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

import Vec2 from '../../util/vec2';

import op from '../shared/op';
import Action from '../shared/action';

import { fromChiralFlagAddition } from './chiral-flag';
import { fromRGroupAttrs, fromUpdateIfThen } from './rgroup';
import { fromSgroupAddition } from './sgroup';

export function fromPaste(restruct, pstruct, point, angle = 0) {
	const xy0 = getStructCenter(pstruct);
	const offset = Vec2.diff(point, xy0);

	const action = new Action();

	const aidMap = new Map();
	const fridMap = new Map();

	const pasteItems = { // only atoms and bonds now
		atoms: [],
		bonds: []
	};

	pstruct.atoms.forEach((atom, aid) => {
		if (!fridMap.has(atom.fragment))
			fridMap.set(atom.fragment, action.addOp(new op.FragmentAdd().perform(restruct)).frid);

		const tmpAtom = Object.assign(atom.clone(), { fragment: fridMap.get(atom.fragment) });
		const operation = new op.AtomAdd(tmpAtom, Vec2.diff(atom.pp, xy0).rotate(angle).add(point))
			.perform(restruct);
		action.addOp(operation);
		aidMap.set(aid, operation.data.aid);

		pasteItems.atoms.push(operation.data.aid);
	});

	pstruct.bonds.forEach((bond) => {
		const operation = new op.BondAdd(aidMap.get(bond.begin), aidMap.get(bond.end), bond)
			.perform(restruct);
		action.addOp(operation);

		pasteItems.bonds.push(operation.data.bid);
	});

	pstruct.sgroups.forEach((sg) => {
		const newsgid = restruct.molecule.sgroups.newId();
		const sgAtoms = sg.atoms.map(aid => aidMap.get(aid));
		const sgAction = fromSgroupAddition(
			restruct, sg.type, sgAtoms, sg.data, newsgid, sg.pp ? sg.pp.add(offset) : null
		);
		sgAction.operations.reverse().forEach((oper) => {
			action.addOp(oper);
		});
	});

	if (restruct.rxnArrows.size < 1) {
		pstruct.rxnArrows
			.forEach((rxnArrow) => {
				action.addOp(new op.RxnArrowAdd(rxnArrow.pp.add(offset)).perform(restruct));
			});
	}

	pstruct.rxnPluses
		.forEach((plus) => {
			action.addOp(new op.RxnPlusAdd(plus.pp.add(offset)).perform(restruct));
		});

	if (pstruct.isChiral) {
		const bb = pstruct.getCoordBoundingBox();
		const pp = new Vec2(bb.max.x, bb.min.y - 1);
		action.mergeWith(fromChiralFlagAddition(restruct, pp.add(offset)));
	}

	pstruct.rgroups.forEach((rg, rgid) => {
		rg.frags.forEach((frag, frid) => {
			action.addOp(new op.RGroupFragment(rgid, fridMap.get(frid)).perform(restruct));
		});
		const ifThen = pstruct.rgroups.get(rgid).ifthen;
		const newRgId = pstruct.rgroups.get(ifThen) ? ifThen : 0;
		action.mergeWith(fromRGroupAttrs(restruct, rgid, rg.getAttrs()))
			.mergeWith(fromUpdateIfThen(restruct, newRgId, rg.ifthen));
	});

	action.operations.reverse();
	return [action, pasteItems];
}

function getStructCenter(struct) {
	if (struct.atoms.size > 0) {
		let xmin = 1e50;
		let ymin = xmin;
		let xmax = -xmin;
		let ymax = -ymin;

		struct.atoms.forEach((atom) => {
			xmin = Math.min(xmin, atom.pp.x);
			ymin = Math.min(ymin, atom.pp.y);
			xmax = Math.max(xmax, atom.pp.x);
			ymax = Math.max(ymax, atom.pp.y);
		});
		return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2); // TODO: check
	}
	if (struct.rxnArrows.size > 0) return struct.rxnArrows.get(0).pp;
	if (struct.rxnPluses.size > 0) return struct.rxnPluses.get(0).pp;

	return struct.isChiral ? new Vec2(1, -1) : null;
}
