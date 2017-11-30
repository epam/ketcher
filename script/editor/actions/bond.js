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
import utils from '../shared/utils';
import Action from '../shared/action';

import { atomGetAttr, atomForNewBond, atomGetDegree, atomGetSGroups } from './utils';
import { fromAtomMerge, mergeFragments } from './atom';
import { removeSgroupIfNeeded, removeAtomFromSgroupIfNeeded } from './sgroup';
import { fromFragmentSplit } from './fragment';

export function fromBondAddition(restruct, bond, begin, end, pos, pos2) { // eslint-disable-line max-params, max-statements
	if (end === undefined) {
		var atom = atomForNewBond(restruct, begin);
		end = atom.atom;
		pos = atom.pos;
	}
	var action = new Action();

	var frid = null;

	if (!(typeof begin === 'number')) {
		if (typeof end === 'number')
			frid = atomGetAttr(restruct, end, 'fragment');
	} else {
		frid = atomGetAttr(restruct, begin, 'fragment');
		if (typeof end === 'number') {
			var frid2 = atomGetAttr(restruct, end, 'fragment');
			mergeFragments(action, restruct, frid, frid2);
		}
	}

	if (frid == null)
		frid = action.addOp(new op.FragmentAdd().perform(restruct)).frid;

	if (!(typeof begin === 'number')) {
		begin.fragment = frid;
		begin = action.addOp(new op.AtomAdd(begin, pos).perform(restruct)).data.aid;

		pos = pos2;
	} else if (atomGetAttr(restruct, begin, 'label') === '*') {
		action.addOp(new op.AtomAttr(begin, 'label', 'C').perform(restruct));
	}


	if (!(typeof end === 'number')) {
		end.fragment = frid;
		// TODO: <op>.data.aid here is a hack, need a better way to access the id of a newly created atom
		end = action.addOp(new op.AtomAdd(end, pos).perform(restruct)).data.aid;
		if (typeof begin === 'number') {
			atomGetSGroups(restruct, begin).forEach((sid) => {
				action.addOp(new op.SGroupAtomAdd(sid, end).perform(restruct));
			}, this);
		}
	} else if (atomGetAttr(restruct, end, 'label') === '*') {
		action.addOp(new op.AtomAttr(end, 'label', 'C').perform(restruct));
	}

	var bid = action.addOp(new op.BondAdd(begin, end, bond).perform(restruct)).data.bid;

	action.operations.reverse();

	return [action, begin, end, bid];
}

export function fromBondDeletion(restruct, id) {
	var action = new Action();
	var bond = restruct.molecule.bonds.get(id);
	var frid = restruct.molecule.atoms.get(bond.begin).fragment;
	var atomsToRemove = [];

	action.addOp(new op.BondDelete(id));

	if (atomGetDegree(restruct, bond.begin) === 1) {
		if (removeAtomFromSgroupIfNeeded(action, restruct, bond.begin))
			atomsToRemove.push(bond.begin);

		action.addOp(new op.AtomDelete(bond.begin));
	}

	if (atomGetDegree(restruct, bond.end) === 1) {
		if (removeAtomFromSgroupIfNeeded(action, restruct, bond.end))
			atomsToRemove.push(bond.end);

		action.addOp(new op.AtomDelete(bond.end));
	}

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	action = action.perform(restruct);

	action.mergeWith(fromFragmentSplit(restruct, frid));

	return action;
}

/**
 * @param restruct { ReStruct }
 * @param id { number }
 * @param bond { Bond }
 * @param flip { boolean }
 * @param reset { boolean }
 */
export function fromBondAttrs(restruct, id, bond, flip, reset) { // eslint-disable-line max-params
	const action = new Action();

	Object.keys(Struct.Bond.attrlist).forEach((key) => {
		if (!bond[key] && !reset)
			return;

		const value = bond[key] || Struct.Bond.attrGetDefault(key);
		action.addOp(new op.BondAttr(id, key, value));
	});

	if (flip)
		action.mergeWith(toBondFlipping(restruct.molecule, id));

	return action.perform(restruct);
}

/**
 * @param restruct { ReStruct }
 * @param mergeMap { Map<number, number> }
 */
export function fromBondsMerge(restruct, mergeMap) {
	let action = new Action();
	const atomsToDelete = [];
	const srcBonds = Array.from(mergeMap.keys()).map(id => parseInt(id, 10));
	const struct = restruct.molecule;

	mergeMap.forEach((dstId, srcId) => {
		const bond = struct.bonds.get(srcId);
		const bondCI = struct.bonds.get(dstId);

		// copy bond src attr and delete
		let bondAttrAction = new Action();
		const params = utils.mergeBondsParams(struct, bond, struct, bondCI);
		if (!params.merged) return;

		const attrs = Struct.Bond.getAttrHash(bond);
		Object.keys(attrs).forEach((key) => {
			bondAttrAction.addOp(new op.BondAttr(dstId, key, attrs[key]));
		});
		bondAttrAction.addOp(new op.BondDelete(srcId));
		bondAttrAction = bondAttrAction.perform(restruct);

		// old src atoms
		if (!atomsToDelete.includes(bond.begin)) atomsToDelete.push(bond.begin);
		if (!atomsToDelete.includes(bond.end)) atomsToDelete.push(bond.end);

		action = fromAtomMerge(restruct, bond.begin, !params.cross ? bondCI.begin : bondCI.end, srcBonds, true)
			.mergeWith(fromAtomMerge(restruct, bond.end, !params.cross ? bondCI.end : bondCI.begin, srcBonds, true))
			.mergeWith(bondAttrAction)
			.mergeWith(action);
	});

	// delete atoms
	let delAtomsAction = new Action();
	atomsToDelete.forEach((aid) => {
		delAtomsAction.addOp(new op.AtomDelete(aid));
	});
	delAtomsAction = delAtomsAction.perform(restruct);

	return delAtomsAction.mergeWith(action);
}

export function toBondFlipping(struct, id) {
	const bond = struct.bonds.get(id);

	const action = new Action();
	action.addOp(new op.BondDelete(id));
	action.addOp(new op.BondAdd(bond.end, bond.begin, bond)).data.bid = id;
	return action;
}

function fromBondFlipping(restruct, bid) {
	return toBondFlipping(restruct.molecule, bid).perform(restruct);
}

/**
 * @param itemID - bond id in structure
 * @param bond - bond for change
 * @param bondProps - bondTool properties
 * @returns Action
 */
export function bondChangingAction(restruct, itemID, bond, bondProps) {
	if (bondProps.stereo !== Struct.Bond.PATTERN.STEREO.NONE && //
		bondProps.type === Struct.Bond.PATTERN.TYPE.SINGLE &&
		bond.type === bondProps.type && bond.stereo === bondProps.stereo)
	// if bondTool is stereo and equal to bond for change
		return fromBondFlipping(restruct, itemID);

	var loop = plainBondTypes.indexOf(bondProps.type) >= 0 ? plainBondTypes : null;
	if (bondProps.stereo === Struct.Bond.PATTERN.STEREO.NONE &&
		bondProps.type === Struct.Bond.PATTERN.TYPE.SINGLE &&
		bond.stereo === Struct.Bond.PATTERN.STEREO.NONE &&
		loop)
	// if `Single bond` tool is chosen and bond for change in `plainBondTypes`
		bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length];

	return fromBondAttrs(restruct, itemID, bondProps,
		bondFlipRequired(restruct.molecule, bond, bondProps));
}

function bondFlipRequired(struct, bond, attrs) {
	return attrs.type === Struct.Bond.PATTERN.TYPE.SINGLE &&
		bond.stereo === Struct.Bond.PATTERN.STEREO.NONE &&
		attrs.stereo !== Struct.Bond.PATTERN.STEREO.NONE &&
		struct.atoms.get(bond.begin).neighbors.length <
		struct.atoms.get(bond.end).neighbors.length;
}

const plainBondTypes = [
	Struct.Bond.PATTERN.TYPE.SINGLE,
	Struct.Bond.PATTERN.TYPE.DOUBLE,
	Struct.Bond.PATTERN.TYPE.TRIPLE
];
