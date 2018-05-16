/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import Pile from '../../util/pile';

import Action from '../shared/action';
import op from '../operations/op';
import { RGroup } from '../../chem/struct';

import { fromBondStereoUpdate } from './bond';
import { fromSgroupDeletion, removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded } from './sgroup';
import { fromFragmentSplit } from './fragment';
import { atomGetDegree, atomGetNeighbors } from './utils';

export function fromOneAtomDeletion(restruct, id) {
	let action = new Action();
	const atomsToRemove = [];

	const frid = restruct.molecule.atoms.get(id).fragment;

	atomGetNeighbors(restruct, id).forEach((nei) => {
		action.mergeWith(fromBondStereoUpdate(restruct, nei.bid, true));
		action.addOp(new op.BondDelete(nei.bid));// [RB] !!

		if (atomGetDegree(restruct, nei.aid) !== 1)
			return;

		if (removeAtomFromSgroupIfNeeded(action, restruct, nei.aid))
			atomsToRemove.push(nei.aid);

		action.addOp(new op.AtomDelete(nei.aid));
	});

	if (removeAtomFromSgroupIfNeeded(action, restruct, id))
		atomsToRemove.push(id);

	action.addOp(new op.AtomDelete(id));

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	action = action.perform(restruct);
	action = fromFragmentSplit(restruct, frid).mergeWith(action);

	return action;
}

export function fromBondDeletion(restruct, bid, skipAtoms = []) {
	const action = new Action();
	const bond = restruct.molecule.bonds.get(bid);
	const atomsToRemove = [];

	action.mergeWith(fromBondStereoUpdate(restruct, bid, true));
	action.addOp(new op.BondDelete(bid));

	if (!skipAtoms.includes(bond.begin) && atomGetDegree(restruct, bond.begin) === 1) {
		if (removeAtomFromSgroupIfNeeded(action, restruct, bond.begin))
			atomsToRemove.push(bond.begin);

		action.addOp(new op.AtomDelete(bond.begin));
	}

	if (!skipAtoms.includes(bond.end) && atomGetDegree(restruct, bond.end) === 1) {
		if (removeAtomFromSgroupIfNeeded(action, restruct, bond.end))
			atomsToRemove.push(bond.end);

		action.addOp(new op.AtomDelete(bond.end));
	}

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	return action;
}

export function fromOneBondDeletion(restruct, id) {
	const frid = restruct.molecule.getBondFragment(id);
	let action = fromBondDeletion(restruct, id);

	action = action.perform(restruct);
	action.mergeWith(fromFragmentSplit(restruct, frid));

	console.log(action);


	return action;
}

export function fromFragmentDeletion(restruct, selection) { // eslint-disable-line max-statements
	console.assert(!!selection);
	let action = new Action();
	const atomsToRemove = [];
	const frids = [];

	selection = { // TODO: refactor me
		atoms: selection.atoms || [],
		bonds: selection.bonds || [],
		rxnPluses: selection.rxnPluses || [],
		rxnArrows: selection.rxnArrows || [],
		sgroupData: selection.sgroupData || [],
		chiralFlags: selection.chiralFlags || []
	};

	const actionRemoveDataSGroups = new Action();
	restruct.molecule.sgroups.forEach((sg, id) => {
		if (
			selection.sgroupData.includes(id) ||
			new Pile(selection.atoms).isSuperset(new Pile(sg.atoms))
		)
			actionRemoveDataSGroups.mergeWith(fromSgroupDeletion(restruct, id));
	});

	selection.atoms.forEach((aid) => {
		atomGetNeighbors(restruct, aid).forEach((nei) => {
			if (selection.bonds.indexOf(nei.bid) === -1)
				selection.bonds = selection.bonds.concat([nei.bid]);
		});
	});

	selection.bonds.forEach((bid) => {
		const frid = restruct.molecule.getBondFragment(bid);
		if (frids.indexOf(frid) < 0) frids.push(frid);

		action.mergeWith(fromBondDeletion(restruct, bid, selection.atoms));
	});

	selection.atoms.forEach((aid) => {
		const frid3 = restruct.molecule.atoms.get(aid).fragment;
		if (frids.indexOf(frid3) < 0)
			frids.push(frid3);

		if (removeAtomFromSgroupIfNeeded(action, restruct, aid))
			atomsToRemove.push(aid);

		action.addOp(new op.AtomDelete(aid));
	});

	removeSgroupIfNeeded(action, restruct, atomsToRemove);

	selection.rxnArrows.forEach((id) => {
		action.addOp(new op.RxnArrowDelete(id));
	});

	selection.rxnPluses.forEach((id) => {
		action.addOp(new op.RxnPlusDelete(id));
	});

	selection.chiralFlags.forEach((id) => {
		action.addOp(new op.ChiralFlagDelete(id));
	});

	action = action.perform(restruct);

	const rgForRemove = frids.map(frid =>
		RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid));
	while (frids.length > 0)
		action = fromFragmentSplit(restruct, frids.pop(), rgForRemove).mergeWith(action);

	action.mergeWith(actionRemoveDataSGroups);

	return action;
}
