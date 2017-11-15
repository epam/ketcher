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
import utils from '../shared/utils';
import Action from '../shared/action';

import { structSelection, getRelSgroupsBySelection, getFragmentAtoms } from './utils';

export function fromFlip(restruct, selection, dir) { // eslint-disable-line max-statements
	const struct = restruct.molecule;

	const action = new Action();

	if (!selection)
		selection = structSelection(struct);

	if (!selection.atoms)
		return action.perform(restruct);

	const fids = selection.atoms.reduce((acc, aid) => {
		const atom = struct.atoms.get(aid);

		if (!acc[atom.fragment])
			acc[atom.fragment] = [];

		acc[atom.fragment].push(aid);
		return acc;
	}, {});

	const isFragFound = Object.keys(fids).find(frag => {
		frag = parseInt(frag, 10);
		return !Set.eq(struct.getFragmentIds(frag), Set.fromList(fids[frag]));
	});

	if (isFragFound)
		return action; // empty action

	Object.keys(fids).forEach(frag => {
		const fragment = Set.fromList(fids[frag]);

		const bbox = struct.getCoordBoundingBox(fragment);

		Set.each(fragment, aid => {
			const atom = struct.atoms.get(aid);
			const d = new Vec2();

			/* eslint-disable no-mixed-operators*/
			if (dir === 'horizontal')
				d.x = bbox.min.x + bbox.max.x - 2 * atom.pp.x;
			else // 'vertical'
				d.y = bbox.min.y + bbox.max.y - 2 * atom.pp.y;
			/* eslint-enable no-mixed-operators*/

			action.addOp(new op.AtomMove(aid, d));
		});

		if (!selection.sgroupData) {
			const sgroups = getRelSgroupsBySelection(restruct, Set.list(fragment));

			sgroups.forEach(sg => {
				const d = new Vec2();

				if (dir === 'horizontal')
					d.x = bbox.min.x + bbox.max.x - 2 * sg.pp.x;
				else // 'vertical'
					d.y = bbox.min.y + bbox.max.y - 2 * sg.pp.y;

				action.addOp(new op.SGroupDataMove(sg.id, d));
			});
		}
	});

	if (selection.bonds) {
		selection.bonds.forEach(bid => {
			const bond = struct.bonds.get(bid);

			if (bond.type !== Struct.Bond.PATTERN.TYPE.SINGLE)
				return;

			if (bond.stereo === Struct.Bond.PATTERN.STEREO.UP) {
				action.addOp(new op.BondAttr(bid, 'stereo', Struct.Bond.PATTERN.STEREO.DOWN));
				return;
			}

			if (bond.stereo === Struct.Bond.PATTERN.STEREO.DOWN)
				action.addOp(new op.BondAttr(bid, 'stereo', Struct.Bond.PATTERN.STEREO.UP));
		});
	}

	return action.perform(restruct);
}

export function fromRotate(restruct, selection, center, angle) { // eslint-disable-line max-statements
	const struct = restruct.molecule;

	const action = new Action();

	if (!selection)
		selection = structSelection(struct);

	if (selection.atoms) {
		selection.atoms.forEach(aid => {
			const atom = struct.atoms.get(aid);
			action.addOp(new op.AtomMove(aid, rotateDelta(atom.pp, center, angle)));
		});

		if (!selection.sgroupData) {
			const sgroups = getRelSgroupsBySelection(restruct, selection.atoms);

			sgroups.forEach(sg => {
				action.addOp(new op.SGroupDataMove(sg.id, rotateDelta(sg.pp, center, angle)));
			});
		}
	}

	if (selection.rxnArrows) {
		selection.rxnArrows.forEach(function (aid) {
			var arrow = struct.rxnArrows.get(aid);
			action.addOp(new op.RxnArrowMove(aid, rotateDelta(arrow.pp, center, angle)));
		});
	}

	if (selection.rxnPluses) {
		selection.rxnPluses.forEach(function (pid) {
			var plus = struct.rxnPluses.get(pid);
			action.addOp(new op.RxnPlusMove(pid, rotateDelta(plus.pp, center, angle)));
		});
	}

	if (selection.sgroupData) {
		selection.sgroupData.forEach(function (did) {
			var data = struct.sgroups.get(did);
			action.addOp(new op.SGroupDataMove(did, rotateDelta(data.pp, center, angle)));
		});
	}

	if (selection.chiralFlags) {
		selection.chiralFlags.forEach(function (fid) {
			var flag = restruct.chiralFlags.get(fid);
			action.addOp(new op.ChiralFlagMove(rotateDelta(flag.pp, center, angle)));
		});
	}

	return action.perform(restruct);
}

export function fromBondAlign(restruct, bid, dir) {
	var struct = restruct.molecule;
	var bond = struct.bonds.get(bid);
	var begin = struct.atoms.get(bond.begin);
	var end = struct.atoms.get(bond.end);

	var center = begin.pp.add(end.pp).scaled(0.5);
	var angle = utils.calcAngle(begin.pp, end.pp);
	var atoms = getFragmentAtoms(struct, begin.fragment);
	angle = (dir === 'horizontal') ? -angle : ((Math.PI / 2) - angle);

	// TODO: choose minimal angle
	// console.info('single bond', utils.degrees(angle), atoms, dir);
	return fromRotate(restruct, { atoms: atoms }, center, angle);
}

function rotateDelta(v, center, angle) {
	var v1 = v.sub(center);
	v1 = v1.rotate(angle);
	v1.add_(center); // eslint-disable-line no-underscore-dangle
	return v1.sub(v);
}
