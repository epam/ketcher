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

import Set from '../../util/set';
import Vec2 from '../../util/vec2';
import Struct from '../../chem/struct';

import op from '../shared/op';
import Action from '../shared/action';

import { structSelection, getFragmentAtoms } from './utils';
import { fromChiralFlagAddition } from './chiral-flag';
import { fromRGroupAttrs } from './rgroup';
import { fromSgroupAddition } from './sgroup';

export function fromPaste(restruct, pstruct, point) {
	const clipboard = struct2Clipboard(pstruct);
	const offset = point ? Vec2.diff(point, getAnchorPosition(clipboard)) : new Vec2();
	const action = new Action();

	const amap = {};
	const fmap = {};

	// atoms
	clipboard.atoms.forEach((atom, aid) => {
		if (!(atom.fragment in fmap))
			fmap[atom.fragment] = action.addOp(new op.FragmentAdd().perform(restruct)).frid;

		atom.fragment = fmap[atom.fragment];
		amap[aid] = action.addOp(new op.AtomAdd(atom, atom.pp.add(offset)).perform(restruct)).data.aid;
	});

	// assign fragments to r-groups
	Object.keys(clipboard.rgmap)
		.forEach(frid => action.addOp(new op.RGroupFragment(clipboard.rgmap[frid], fmap[frid]).perform(restruct)));

	Object.keys(clipboard.rgroups)
		.filter(rgid => !restruct.molecule.rgroups.has(rgid))
		.forEach(rg => action.mergeWith(fromRGroupAttrs(restruct, rg, clipboard.rgroups[rg])));

	// bonds
	clipboard.bonds
		.forEach(bond => action.addOp(new op.BondAdd(amap[bond.begin], amap[bond.end], bond).perform(restruct)));

	// sgroups
	clipboard.sgroups.forEach(sgroupInfo => {
		const sgatoms = sgroupInfo.atoms.map(atom => amap[atom]);
		const newsgid = restruct.molecule.sgroups.newId();

		const sgAction = fromSgroupAddition(restruct, sgroupInfo.type, sgatoms, sgroupInfo.attrs, newsgid, sgroupInfo.pp ? sgroupInfo.pp.add(offset) : null);
		sgAction.operations.reverse().forEach(op => action.addOp(op));
	});

	// reaction arrows
	if (restruct.rxnArrows.count() < 1)
		clipboard.rxnArrows.forEach(rxnArrow => action.addOp(new op.RxnArrowAdd(rxnArrow.pp.add(offset)).perform(restruct)));

	// reaction pluses
	clipboard.rxnPluses.forEach(plus => action.addOp(new op.RxnPlusAdd(plus.pp.add(offset)).perform(restruct)));

	// chiral flag
	if (pstruct.isChiral) {
		const bb = pstruct.getCoordBoundingBox();
		const pp = new Vec2(bb.max.x, bb.min.y - 1);
		action.mergeWith(fromChiralFlagAddition(restruct, pp.add(offset)));
	}

	// thats all
	action.operations.reverse();
	return action;
}

// Should it be named structCenter?
function getAnchorPosition(clipboard) {
	if (clipboard.atoms.length) {
		var xmin = 1e50;
		var ymin = xmin;
		var xmax = -xmin;
		var ymax = -ymin;
		for (var i = 0; i < clipboard.atoms.length; i++) {
			xmin = Math.min(xmin, clipboard.atoms[i].pp.x);
			ymin = Math.min(ymin, clipboard.atoms[i].pp.y);
			xmax = Math.max(xmax, clipboard.atoms[i].pp.x);
			ymax = Math.max(ymax, clipboard.atoms[i].pp.y);
		}
		return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2); // TODO: check
	} else if (clipboard.rxnArrows.length) {
		return clipboard.rxnArrows[0].pp;
	} else if (clipboard.rxnPluses.length) {
		return clipboard.rxnPluses[0].pp;
	} else if (clipboard.chiralFlags.length) {
		return clipboard.chiralFlags[0].pp;
	} else { // eslint-disable-line no-else-return
		return null;
	}
}

// TODO: merge to bellow
function struct2Clipboard(struct) { // eslint-disable-line max-statements
	console.assert(!struct.isBlank(), 'Empty struct');

	var selection = structSelection(struct);

	var clipboard = {
		atoms: [],
		bonds: [],
		sgroups: [],
		rxnArrows: [],
		rxnPluses: [],
		chiralFlags: [],
		rgmap: {},
		rgroups: {}
	};

	var mapping = {};
	selection.atoms.forEach(function (id) {
		var newAtom = new Struct.Atom(struct.atoms.get(id));
		newAtom.pos = newAtom.pp;
		mapping[id] = clipboard.atoms.push(new Struct.Atom(newAtom)) - 1;
	});

	selection.bonds.forEach(function (id) {
		var newBond = new Struct.Bond(struct.bonds.get(id));
		newBond.begin = mapping[newBond.begin];
		newBond.end = mapping[newBond.end];
		clipboard.bonds.push(new Struct.Bond(newBond));
	});

	var sgroupList = struct.getSGroupsInAtomSet(selection.atoms);

	sgroupList.forEach(function (sid) {
		var sgroup = struct.sgroups.get(sid);
		var sgAtoms = Struct.SGroup.getAtoms(struct, sgroup);
		var sgroupInfo = {
			type: sgroup.type,
			attrs: sgroup.getAttrs(),
			atoms: [].slice.call(sgAtoms),
			pp: sgroup.pp
		};

		for (var i = 0; i < sgroupInfo.atoms.length; i++)
			sgroupInfo.atoms[i] = mapping[sgroupInfo.atoms[i]];

		clipboard.sgroups.push(sgroupInfo);
	}, this);

	selection.rxnArrows.forEach(function (id) {
		var arrow = new Struct.RxnArrow(struct.rxnArrows.get(id));
		arrow.pos = arrow.pp;
		clipboard.rxnArrows.push(arrow);
	});

	selection.rxnPluses.forEach(function (id) {
		var plus = new Struct.RxnPlus(struct.rxnPluses.get(id));
		plus.pos = plus.pp;
		clipboard.rxnPluses.push(plus);
	});

	// r-groups
	var atomFragments = {};
	var fragments = Set.empty();
	selection.atoms.forEach(function (id) {
		var atom = struct.atoms.get(id);
		var frag = atom.fragment;
		atomFragments[id] = frag;
		Set.add(fragments, frag);
	});

	var rgids = Set.empty();
	Set.each(fragments, function (frid) {
		var atoms = getFragmentAtoms(struct, frid);
		for (var i = 0; i < atoms.length; ++i) {
			if (!Set.contains(atomFragments, atoms[i]))
				return;
		}
		var rgid = Struct.RGroup.findRGroupByFragment(struct.rgroups, frid);
		clipboard.rgmap[frid] = rgid;
		Set.add(rgids, rgid);
	}, this);

	Set.each(rgids, function (id) {
		clipboard.rgroups[id] = struct.rgroups.get(id).getAttrs();
	}, this);

	return clipboard;
}
