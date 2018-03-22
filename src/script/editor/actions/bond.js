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

import { Bond } from '../../chem/struct';

import op from '../shared/op';
import utils from '../shared/utils';
import Action from '../shared/action';

import { atomGetAttr, atomForNewBond, atomGetDegree } from './utils';
import { fromAtomMerge, mergeFragmentsIfNeeded, mergeSgroups } from './atom';
import { removeSgroupIfNeeded, removeAtomFromSgroupIfNeeded } from './sgroup';
import { fromFragmentSplit } from './fragment';

export function fromBondAddition(restruct, bond, begin, end, pos, pos2) { // eslint-disable-line
	if (end === undefined) {
		const atom = atomForNewBond(restruct, begin);
		end = atom.atom;
		pos = atom.pos;
	}
	const action = new Action();

	let frid = null;

	if (!(typeof begin === 'number')) {
		if (typeof end === 'number')
			frid = atomGetAttr(restruct, end, 'fragment');
	} else {
		frid = atomGetAttr(restruct, begin, 'fragment');
		if (typeof end === 'number')
			mergeFragmentsIfNeeded(action, restruct, begin, end);
	}

	if (frid == null)
		frid = action.addOp(new op.FragmentAdd().perform(restruct)).frid;

	if (!(typeof begin === 'number')) {
		begin.fragment = frid;
		begin = action.addOp(new op.AtomAdd(begin, pos).perform(restruct)).data.aid;
		if (typeof end === 'number')
			mergeSgroups(action, restruct, [begin], end);
		pos = pos2;
	} else if (atomGetAttr(restruct, begin, 'label') === '*') {
		action.addOp(new op.AtomAttr(begin, 'label', 'C').perform(restruct));
	}

	if (!(typeof end === 'number')) {
		end.fragment = frid;
		// TODO: <op>.data.aid here is a hack, need a better way to access the id of a created atom
		end = action.addOp(new op.AtomAdd(end, pos).perform(restruct)).data.aid;
		if (typeof begin === 'number')
			mergeSgroups(action, restruct, [end], begin);
	} else if (atomGetAttr(restruct, end, 'label') === '*') {
		action.addOp(new op.AtomAttr(end, 'label', 'C').perform(restruct));
	}

	const bid = action.addOp(new op.BondAdd(begin, end, bond).perform(restruct)).data.bid;
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
 * @param ids { Array<number>|number }
 * @param attrs { Bond }
 * @param reset? { boolean }
 */
export function fromBondsAttrs(restruct, ids, attrs, reset) {
	const action = new Action();
	const bids = Array.isArray(ids) ? ids : [ids];

	bids.forEach((bid) => {
		Object.keys(Bond.attrlist).forEach((key) => {
			if (!(key in attrs) && !reset)
				return;

			const value = (key in attrs) ? attrs[key] : Bond.attrGetDefault(key);
			action.addOp(new op.BondAttr(bid, key, value));
		});
	});

	return action.perform(restruct);
}

/**
 * @param restruct { ReStruct }
 * @param mergeMap { Map<number, number> }
 */
export function fromBondsMerge(restruct, mergeMap) {
	const struct = restruct.molecule;

	const atomPairs = new Map();
	let action = new Action();

	mergeMap.forEach((dstId, srcId) => {
		const bond = struct.bonds.get(srcId);
		const bondCI = struct.bonds.get(dstId);

		const params = utils.mergeBondsParams(struct, bond, struct, bondCI);
		if (!params.merged) return;

		atomPairs.set(bond.begin, !params.cross ? bondCI.begin : bondCI.end);
		atomPairs.set(bond.end, !params.cross ? bondCI.end : bondCI.begin);
	});

	atomPairs.forEach((dst, src) => {
		action = fromAtomMerge(restruct, src, dst).mergeWith(action);
	});

	return action;
}

function fromBondFlipping(restruct, id) {
	const bond = restruct.molecule.bonds.get(id);

	const action = new Action();
	action.addOp(new op.BondDelete(id));
	action.addOp(new op.BondAdd(bond.end, bond.begin, bond)).data.bid = id;
	return action.perform(restruct);
}

/**
 * @param restruct { ReStruct }
 * @param itemID - bond id in structure
 * @param bond - bond for change
 * @param bondProps - bondTool properties
 * @returns Action
 */
export function bondChangingAction(restruct, itemID, bond, bondProps) {
	if (bondProps.stereo !== Bond.PATTERN.STEREO.NONE && //
		bondProps.type === Bond.PATTERN.TYPE.SINGLE &&
		bond.type === bondProps.type && bond.stereo === bondProps.stereo)
	// if bondTool is stereo and equal to bond for change
		return fromBondFlipping(restruct, itemID);

	const loop = plainBondTypes.includes(bondProps.type) ? plainBondTypes : null;
	if (bondProps.stereo === Bond.PATTERN.STEREO.NONE &&
		bondProps.type === Bond.PATTERN.TYPE.SINGLE &&
		bond.stereo === Bond.PATTERN.STEREO.NONE &&
		loop)
	// if `Single bond` tool is chosen and bond for change in `plainBondTypes`
		bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length];

	const isFlip = bondFlipRequired(restruct.molecule, bond, bondProps);
	const action = isFlip ? fromBondFlipping(restruct, itemID) : new Action();

	return fromBondsAttrs(restruct, itemID, bondProps).mergeWith(action);
}

function bondFlipRequired(struct, bond, attrs) {
	return attrs.type === Bond.PATTERN.TYPE.SINGLE &&
		bond.stereo === Bond.PATTERN.STEREO.NONE &&
		attrs.stereo !== Bond.PATTERN.STEREO.NONE &&
		struct.atoms.get(bond.begin).neighbors.length <
		struct.atoms.get(bond.end).neighbors.length;
}

const plainBondTypes = [
	Bond.PATTERN.TYPE.SINGLE,
	Bond.PATTERN.TYPE.DOUBLE,
	Bond.PATTERN.TYPE.TRIPLE
];
