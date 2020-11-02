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

import { difference } from 'lodash';
import Vec2 from '../../util/vec2';

import closest from '../shared/closest';

export function atomGetAttr(restruct, aid, name) {
	return restruct.molecule.atoms.get(aid)[name];
}

export function atomGetDegree(restruct, aid) {
	return restruct.atoms.get(aid).a.neighbors.length;
}

export function atomGetNeighbors(restruct, aid) {
	return restruct.atoms.get(aid).a.neighbors.map((nei) => {
		const hb = restruct.molecule.halfBonds.get(nei);
		return ({
			aid: hb.end,
			bid: hb.bid
		});
	});
}

export function atomGetSGroups(restruct, aid) {
	return Array.from(restruct.atoms.get(aid).a.sgs);
}

export function atomGetPos(restruct, id) {
	return restruct.molecule.atoms.get(id).pp;
}

export function structSelection(struct) {
	return ['atoms', 'bonds', 'frags', 'sgroups', 'rgroups', 'rxnArrows', 'rxnPluses']
		.reduce((res, key) => {
			res[key] = Array.from(struct[key].keys());
			return res;
		}, {});
}

export function getFragmentAtoms(struct, frid) {
	return Array.from(struct.atoms.keys())
		.filter(aid => struct.atoms.get(aid).fragment === frid);
}

// Get new atom id/label and pos for bond being added to existing atom
export function atomForNewBond(restruct, id) { // eslint-disable-line max-statements
	const neighbours = [];
	const pos = atomGetPos(restruct, id);

	atomGetNeighbors(restruct, id).forEach((nei) => {
		const neiPos = atomGetPos(restruct, nei.aid);

		if (Vec2.dist(pos, neiPos) < 0.1)
			return;

		neighbours.push({ id: nei.aid, v: Vec2.diff(neiPos, pos) });
	});

	neighbours.sort((nei1, nei2) => Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x));

	var i;
	var maxI = 0;
	var angle;
	var maxAngle = 0;

	// TODO: impove layout: tree, ...

	for (i = 0; i < neighbours.length; i++) {
		angle = Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);

		if (angle < 0)
			angle += 2 * Math.PI;

		if (angle > maxAngle) {
			maxI = i;
			maxAngle = angle;
		}
	}

	let v = new Vec2(1, 0);

	if (neighbours.length > 0) {
		if (neighbours.length === 1) {
			maxAngle = -(4 * Math.PI / 3);

			// zig-zag
			const nei = atomGetNeighbors(restruct, id)[0];
			if (atomGetDegree(restruct, nei.aid) > 1) {
				const neiNeighbours = [];
				const neiPos = atomGetPos(restruct, nei.aid);
				const neiV = Vec2.diff(pos, neiPos);
				const neiAngle = Math.atan2(neiV.y, neiV.x);

				atomGetNeighbors(restruct, nei.aid).forEach((neiNei) => {
					const neiNeiPos = atomGetPos(restruct, neiNei.aid);

					if (neiNei.bid === nei.bid || Vec2.dist(neiPos, neiNeiPos) < 0.1)
						return;

					const vDiff = Vec2.diff(neiNeiPos, neiPos);
					let ang = Math.atan2(vDiff.y, vDiff.x) - neiAngle;

					if (ang < 0)
						ang += 2 * Math.PI;

					neiNeighbours.push(ang);
				});
				neiNeighbours.sort((nei1, nei2) => nei1 - nei2);

				if (neiNeighbours[0] <= Math.PI * 1.01 &&
					neiNeighbours[neiNeighbours.length - 1] <= 1.01 * Math.PI)
					maxAngle *= -1;
			}
		}

		angle = (maxAngle / 2) + Math.atan2(neighbours[maxI].v.y, neighbours[maxI].v.x);

		v = v.rotate(angle);
	}

	v.add_(pos); // eslint-disable-line no-underscore-dangle

	let a = closest.atom(restruct, v, null, 0.1);
	a = a === null ? ({ label: 'C' }) : a.id;

	return { atom: a, pos: v };
}

export function getRelSgroupsBySelection(restruct, selectedAtoms) {
	return restruct.molecule.sgroups
		.filter((sgid, sg) =>
			!sg.data.attached && !sg.data.absolute && difference(sg.atoms, selectedAtoms).length === 0);
}
