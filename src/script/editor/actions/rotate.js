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
import Pile from '../../util/pile';

import { Bond } from '../../chem/struct';

import op from '../shared/op';
import utils from '../shared/utils';
import Action from '../shared/action';

import { structSelection, getRelSgroupsBySelection, getFragmentAtoms } from './utils';

export function fromFlip(restruct, selection, dir, center) { // eslint-disable-line max-statements
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

	const isFragFound = Object.keys(fids).find((frag) => {
		frag = parseInt(frag, 10);
		return !struct.getFragmentIds(frag).equals(new Pile(fids[frag]));
	});

	if (isFragFound)
		return action; // empty action

	Object.keys(fids).forEach((frag) => {
		const fragment = new Pile(fids[frag]);

		const bbox = struct.getCoordBoundingBox(fragment);
		const calcCenter = center ||
			new Vec2((bbox.max.x + bbox.min.x) / 2, (bbox.max.y + bbox.min.y) / 2);

		fragment.forEach((aid) => {
			const atom = struct.atoms.get(aid);
			const d = flipItemByCenter(atom, calcCenter, dir);
			action.addOp(new op.AtomMove(aid, d));
		});

		if (!selection.sgroupData) {
			const sgroups = getRelSgroupsBySelection(restruct, Array.from(fragment));

			sgroups.forEach((sg) => {
				const d = flipItemByCenter(sg, calcCenter, dir);
				action.addOp(new op.SGroupDataMove(sg.id, d));
			});
		}
	});

	if (selection.bonds) {
		selection.bonds.forEach((bid) => {
			const bond = struct.bonds.get(bid);

			if (bond.type !== Bond.PATTERN.TYPE.SINGLE)
				return;

			if (bond.stereo === Bond.PATTERN.STEREO.UP) {
				action.addOp(new op.BondAttr(bid, 'stereo', Bond.PATTERN.STEREO.DOWN));
				return;
			}

			if (bond.stereo === Bond.PATTERN.STEREO.DOWN)
				action.addOp(new op.BondAttr(bid, 'stereo', Bond.PATTERN.STEREO.UP));
		});
	}

	return action.perform(restruct);
}

function flipItemByCenter(item, center, dir) {
	const d = new Vec2();
	/* eslint-disable no-mixed-operators*/
	if (dir === 'horizontal') {
		d.x = (center.x > item.pp.x)
			? 2 * (center.x - item.pp.x)
			: -2 * (item.pp.x - center.x);
	} else { // 'vertical'
		d.y = (center.y > item.pp.y)
			? 2 * (center.y - item.pp.y)
			: -2 * (item.pp.y - center.y);
	}
	/* eslint-enable no-mixed-operators*/
	return d;
}

export function fromRotate(restruct, selection, center, angle) { // eslint-disable-line
	const struct = restruct.molecule;

	const action = new Action();

	if (!selection)
		selection = structSelection(struct);

	if (selection.atoms) {
		selection.atoms.forEach((aid) => {
			const atom = struct.atoms.get(aid);
			action.addOp(new op.AtomMove(aid, rotateDelta(atom.pp, center, angle)));
		});

		if (!selection.sgroupData) {
			const sgroups = getRelSgroupsBySelection(restruct, selection.atoms);

			sgroups.forEach((sg) => {
				action.addOp(new op.SGroupDataMove(sg.id, rotateDelta(sg.pp, center, angle)));
			});
		}
	}

	if (selection.rxnArrows) {
		selection.rxnArrows.forEach((aid) => {
			var arrow = struct.rxnArrows.get(aid);
			action.addOp(new op.RxnArrowMove(aid, rotateDelta(arrow.pp, center, angle)));
		});
	}

	if (selection.rxnPluses) {
		selection.rxnPluses.forEach((pid) => {
			var plus = struct.rxnPluses.get(pid);
			action.addOp(new op.RxnPlusMove(pid, rotateDelta(plus.pp, center, angle)));
		});
	}

	if (selection.sgroupData) {
		selection.sgroupData.forEach((did) => {
			var data = struct.sgroups.get(did);
			action.addOp(new op.SGroupDataMove(did, rotateDelta(data.pp, center, angle)));
		});
	}

	if (selection.chiralFlags) {
		selection.chiralFlags.forEach((fid) => {
			var flag = restruct.chiralFlags.get(fid);
			action.addOp(new op.ChiralFlagMove(rotateDelta(flag.pp, center, angle)));
		});
	}

	return action.perform(restruct);
}

export function fromBondAlign(restruct, bid, dir) {
	const struct = restruct.molecule;
	const bond = struct.bonds.get(bid);
	const begin = struct.atoms.get(bond.begin);
	const end = struct.atoms.get(bond.end);

	const center = begin.pp.add(end.pp).scaled(0.5);
	let angle = utils.calcAngle(begin.pp, end.pp);
	const atoms = getFragmentAtoms(struct, begin.fragment);

	// TODO: choose minimal angle
	angle = (dir === 'horizontal') ? -angle : ((Math.PI / 2) - angle);

	if (angle === 0 || Math.abs(angle) === Math.PI)
		return fromFlip(restruct, { atoms }, dir, center);

	return fromRotate(restruct, { atoms }, center, angle);
}

function rotateDelta(v, center, angle) {
	var v1 = v.sub(center);
	v1 = v1.rotate(angle);
	v1.add_(center); // eslint-disable-line no-underscore-dangle
	return v1.sub(v);
}
