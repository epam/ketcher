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

import Vec2 from '../../util/vec2';

import op from '../shared/op';
import Action from '../shared/action';

import { fromChiralFlagAddition } from './chiral-flag';
import { fromRGroupAttrs } from './rgroup';
import { fromSgroupAddition } from './sgroup';

export function fromPaste(restruct, pstruct, point, angle = 0) {
	const xy0 = getStructCenter(pstruct);
	const offset = Vec2.diff(point, xy0);

	const action = new Action();

	const aidMap = {};
	const fridMap = {};

	pstruct.atoms.each((aid, atom) => {
		if (!(atom.fragment in fridMap))
			fridMap[atom.fragment] = action.addOp(new op.FragmentAdd().perform(restruct)).frid;

		const tmpAtom = Object.assign(atom.clone(), { fragment: fridMap[atom.fragment] });
		const operation = new op.AtomAdd(tmpAtom, Vec2.diff(atom.pp, xy0).rotate(angle).add(point)).perform(restruct);
		action.addOp(operation);
		aidMap[aid] = operation.data.aid;
	});

	pstruct.bonds.each((bid, bond) =>
		action.addOp(new op.BondAdd(aidMap[bond.begin], aidMap[bond.end], bond).perform(restruct))
	);

	pstruct.sgroups.each((sgid, sg) => {
		const newsgid = restruct.molecule.sgroups.newId();
		const sgAtoms = sg.atoms.map(aid => aidMap[aid]);
		const sgAction = fromSgroupAddition(restruct, sg.type, sgAtoms, sg.data, newsgid, sg.pp ? sg.pp.add(offset) : null);
		sgAction.operations.reverse().forEach(op => action.addOp(op));
	});

	if (restruct.rxnArrows.count() < 1) {
		pstruct.rxnArrows.values()
			.forEach(rxnArrow => action.addOp(new op.RxnArrowAdd(rxnArrow.pp.add(offset)).perform(restruct)));
	}

	pstruct.rxnPluses.values()
		.forEach(plus => action.addOp(new op.RxnPlusAdd(plus.pp.add(offset)).perform(restruct)));

	if (pstruct.isChiral) {
		const bb = pstruct.getCoordBoundingBox();
		const pp = new Vec2(bb.max.x, bb.min.y - 1);
		action.mergeWith(fromChiralFlagAddition(restruct, pp.add(offset)));
	}

	pstruct.rgroups.each((rgid, rg) => {
		rg.frags.each(frid => action.addOp(new op.RGroupFragment(rgid, fridMap[frid]).perform(restruct)));
		action.mergeWith(fromRGroupAttrs(restruct, rgid, rg.getAttrs()));
	});

	action.operations.reverse();
	return action;
}

function getStructCenter(struct) {
	if (struct.atoms.count() > 0) {
		let xmin = 1e50;
		let ymin = xmin;
		let xmax = -xmin;
		let ymax = -ymin;

		struct.atoms.each((aid, atom) => {
			xmin = Math.min(xmin, atom.pp.x);
			ymin = Math.min(ymin, atom.pp.y);
			xmax = Math.max(xmax, atom.pp.x);
			ymax = Math.max(ymax, atom.pp.y);
		});
		return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2); // TODO: check
	}
	if (struct.rxnArrows.count() > 0) return struct.rxnArrows.get(0).pp;
	if (struct.rxnPluses.count() > 0) return struct.rxnPluses.get(0).pp;

	return struct.isChiral ? new Vec2(1, -1) : null;
}
