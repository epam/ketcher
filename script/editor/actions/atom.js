/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import Struct from '../../chem/struct';

import op from '../shared/op';
import Action from '../shared/action';

import { atomGetAttr, atomGetDegree, atomGetNeighbors } from './utils';
import { removeSgroupIfNeeded, removeAtomFromSgroupIfNeeded } from './sgroup';
import { fromRGroupFragment } from './rgroup';
import { FromFragmentSplit } from './fragment';

export function fromAtomAddition(restruct, pos, atom) {
	atom = Object.assign({}, atom);
	var action = new Action();
	atom.fragment = action.addOp(new op.FragmentAdd().perform(restruct)).frid;
	action.addOp(new op.AtomAdd(atom, pos).perform(restruct));
	return action;
}

export function fromAtomDeletion(restruct, id) {
	var action = new Action();
	var atomsToRemove = [];

	var frid = restruct.molecule.atoms.get(id).fragment;

	atomGetNeighbors(restruct, id).forEach((nei) => {
		action.addOp(new op.BondDelete(nei.bid));// [RB] !!
		if (atomGetDegree(restruct, nei.aid) == 1) {
			if (removeAtomFromSgroupIfNeeded(action, restruct, nei.aid))
				atomsToRemove.push(nei.aid);

			action.addOp(new op.AtomDelete(nei.aid));
		}
	}, this);

	if (removeAtomFromSgroupIfNeeded(action, restruct, id))
		atomsToRemove.push(id);

	action.addOp(new op.AtomDelete(id));

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	action = action.perform(restruct);

	action.mergeWith(new FromFragmentSplit(restruct, frid));

	return action;
}

export function fromAtomsAttrs(restruct, ids, attrs, reset) {
	var action = new Action();
	(typeof (ids) === 'number' ? [ids] : ids).forEach((id) => {
		Object.keys(Struct.Atom.attrlist).forEach((key) => {
			var value;
			if (key in attrs)
				value = attrs[key];
			else if (reset)
				value = Struct.Atom.attrGetDefault(key);
			else return;
			action.addOp(new op.AtomAttr(id, key, value));
		});
		if (!reset && 'label' in attrs && attrs.label != null && attrs.label !== 'L#' && !attrs['atomList'])
			action.addOp(new op.AtomAttr(id, 'atomList', null));
	}, this);
	return action.perform(restruct);
}

export function fromAtomMerge(restruct, srcId, dstId, skipBondsDel = [], skipAtomDel) {
	if (srcId === dstId) return new Action();
	var fragAction = new Action();
	var srcFrid = atomGetAttr(restruct, srcId, 'fragment');
	var dstFrid = atomGetAttr(restruct, dstId, 'fragment');
	if (srcFrid !== dstFrid)
		mergeFragments(fragAction, restruct, srcFrid, dstFrid);

	var action = new Action();

	atomGetNeighbors(restruct, srcId).forEach((nei) => {
		var bond = restruct.molecule.bonds.get(nei.bid);
		var begin;
		var end;

		if (bond.begin === nei.aid) {
			begin = nei.aid;
			end = dstId;
		} else {
			begin = dstId;
			end = nei.aid;
		}
		if (dstId !== bond.begin && dstId !== bond.end && restruct.molecule.findBondId(begin, end) === -1) // TODO: improve this {
			action.addOp(new op.BondAdd(begin, end, bond));

		if (!skipBondsDel.includes('' + nei.bid))
			action.addOp(new op.BondDelete(nei.bid));
	}, this);

	var attrs = Struct.Atom.getAttrHash(restruct.molecule.atoms.get(srcId));
	if (atomGetDegree(restruct, srcId) === 1 && attrs['label'] === '*')
		attrs['label'] = 'C';
	for (var key in attrs)
		if (attrs.hasOwnProperty(key)) action.addOp(new op.AtomAttr(dstId, key, attrs[key]));

	var sgChanged = removeAtomFromSgroupIfNeeded(action, restruct, srcId);

	if (!skipAtomDel) action.addOp(new op.AtomDelete(srcId));

	if (sgChanged)
		removeSgroupIfNeeded(action, restruct, [srcId]);

	return action.perform(restruct).mergeWith(fragAction);
}

export function mergeFragments(action, restruct, frid, frid2) {
	var struct = restruct.molecule;
	if (frid2 != frid && (typeof frid2 === 'number')) {
		var rgid = Struct.RGroup.findRGroupByFragment(struct.rgroups, frid2);
		if (!(typeof rgid === 'undefined'))
			action.mergeWith(fromRGroupFragment(restruct, null, frid2));

		struct.atoms.each((aid, atom) => {
			if (atom.fragment === frid2)
				action.addOp(new op.AtomAttr(aid, 'fragment', frid).perform(restruct));
		});
		action.addOp(new op.FragmentDelete(frid2).perform(restruct));
	}
}
