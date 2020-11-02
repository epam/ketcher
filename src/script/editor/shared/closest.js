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

const SELECTION_DISTANCE_COEFFICIENT = 0.4;

const findMaps = {
	atoms: findClosestAtom,
	bonds: findClosestBond,
	chiralFlags: findClosestChiralFlag,
	sgroupData: findClosestDataSGroupData,
	sgroups: findClosestSGroup,
	rxnArrows: findClosestRxnArrow,
	rxnPluses: findClosestRxnPlus,
	frags: findClosestFrag,
	rgroups: findClosestRGroup
};

function findClosestAtom(restruct, pos, skip, minDist) {
	let closestAtom = null;
	const maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
	const skipId = skip && skip.map === 'atoms' ? skip.id : null;

	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);

	restruct.atoms.forEach((atom, aid) => {
		if (aid === skipId)
			return;

		const dist = Vec2.dist(pos, atom.a.pp);

		if (dist < minDist) {
			closestAtom = aid;
			minDist = dist;
		}
	});

	if (closestAtom !== null) {
		return {
			id: closestAtom,
			dist: minDist
		};
	}

	return null;
}

function findClosestBond(restruct, pos, skip, minDist, scale) { // eslint-disable-line max-params
	let closestBond = null;
	let closestBondCenter = null;
	const maxMinDist = 0.8 * SELECTION_DISTANCE_COEFFICIENT;
	const skipId = skip && skip.map === 'bonds' ? skip.id : null;

	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);

	let minCDist = minDist;

	restruct.bonds.forEach((bond, bid) => {
		if (bid === skipId)
			return;

		const p1 = restruct.atoms.get(bond.b.begin).a.pp;
		const p2 = restruct.atoms.get(bond.b.end).a.pp;

		const mid = Vec2.lc2(p1, 0.5, p2, 0.5);
		const cdist = Vec2.dist(pos, mid);

		if (cdist < minCDist) {
			minCDist = cdist;
			closestBondCenter = bid;
		}
	});

	restruct.bonds.forEach((bond, bid) => {
		if (bid === skipId)
			return;

		const hb = restruct.molecule.halfBonds.get(bond.b.hb1);
		const dir = hb.dir;
		const norm = hb.norm;

		const p1 = restruct.atoms.get(bond.b.begin).a.pp;
		const p2 = restruct.atoms.get(bond.b.end).a.pp;

		const inStripe = Vec2.dot(pos.sub(p1), dir) * Vec2.dot(pos.sub(p2), dir) < 0;

		if (inStripe) {
			const dist = Math.abs(Vec2.dot(pos.sub(p1), norm));

			if (dist < minDist) {
				closestBond = bid;
				minDist = dist;
			}
		}
	});

	if (closestBondCenter !== null) {
		return {
			id: closestBondCenter,
			dist: minCDist
		};
	}

	if (closestBond !== null && minDist > SELECTION_DISTANCE_COEFFICIENT * scale) {
		return {
			id: closestBond,
			dist: minDist
		};
	}

	return null;
}

function findClosestChiralFlag(restruct, pos) {
	var minDist;
	var ret = null;

	// there is only one chiral flag, but we treat it as a "map" for convenience
	restruct.chiralFlags.forEach((item, id) => {
		const p = item.pp;

		if (Math.abs(pos.x - p.x) >= 1.0)
			return;

		const dist = Math.abs(pos.y - p.y);

		if (dist < 0.3 && (!ret || dist < minDist)) {
			minDist = dist;
			ret = { id, dist: minDist };
		}
	});

	return ret;
}

function findClosestDataSGroupData(restruct, pos) {
	let minDist = null;
	let ret = null;

	restruct.sgroupData.forEach((item, id) => {
		if (item.sgroup.type !== 'DAT')
			throw new Error('Data group expected');

		if (item.sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
			const box = item.sgroup.dataArea;
			const inBox = box.p0.y < pos.y && box.p1.y > pos.y && box.p0.x < pos.x && box.p1.x > pos.x;
			const xDist = Math.min(Math.abs(box.p0.x - pos.x), Math.abs(box.p1.x - pos.x));

			if (inBox && (ret === null || xDist < minDist)) {
				ret = { id, dist: xDist };
				minDist = xDist;
			}
		}
	});

	return ret;
}

function findClosestFrag(restruct, pos, skip, minDist, scale) {
	minDist = Math.min(minDist || SELECTION_DISTANCE_COEFFICIENT,
		SELECTION_DISTANCE_COEFFICIENT);

	const struct = restruct.molecule;

	const closestAtom = findClosestAtom(restruct, pos, skip, minDist);

	if (closestAtom) {
		return {
			id: struct.atoms.get(closestAtom.id).fragment,
			dist: closestAtom.dist
		};
	}

	const closestBond = findClosestBond(restruct, pos, skip, minDist, scale);

	if (closestBond) {
		const atomId = struct.bonds.get(closestBond.id).begin;
		return {
			id: struct.atoms.get(atomId).fragment,
			dist: closestBond.dist
		};
	}

	return null;
}

function findClosestRGroup(restruct, pos, skip, minDist) {
	minDist = Math.min(minDist || SELECTION_DISTANCE_COEFFICIENT,
		SELECTION_DISTANCE_COEFFICIENT);

	let ret = null;

	restruct.rgroups.forEach((rgroup, rgid) => {
		if (rgid !== skip && rgroup.labelBox && rgroup.labelBox.contains(pos, 0.5)) {
			const dist = Vec2.dist(rgroup.labelBox.centre(), pos);

			if (!ret || dist < minDist) {
				minDist = dist;
				ret = { id: rgid, dist: minDist };
			}
		}
	});

	return ret;
}

function findClosestRxnArrow(restruct, pos) {
	let minDist = null;
	let ret = null;

	restruct.rxnArrows.forEach((arrow, id) => {
		const p = arrow.item.pp;

		if (Math.abs(pos.x - p.x) >= 1.0)
			return;

		const dist = Math.abs(pos.y - p.y);

		if (dist < 0.3 && (!ret || dist < minDist)) {
			minDist = dist;
			ret = { id, dist: minDist };
		}
	});

	return ret;
}

function findClosestRxnPlus(restruct, pos) {
	let minDist = null;
	let ret = null;

	restruct.rxnPluses.forEach((plus, id) => {
		const p = plus.item.pp;
		const dist = Math.max(Math.abs(pos.x - p.x), Math.abs(pos.y - p.y));

		if (dist < 0.3 && (!ret || dist < minDist)) {
			minDist = dist;
			ret = { id, dist: minDist };
		}
	});

	return ret;
}

function findClosestSGroup(restruct, pos) {
	let ret = null;
	let minDist = SELECTION_DISTANCE_COEFFICIENT;

	restruct.molecule.sgroups.forEach((sg, sgid) => {
		const d = sg.bracketDir;
		const n = d.rotateSC(1, 0);
		const pg = new Vec2(Vec2.dot(pos, d), Vec2.dot(pos, n));

		sg.areas.forEach((box) => {
			const inBox = box.p0.y < pg.y && box.p1.y > pg.y && box.p0.x < pg.x && box.p1.x > pg.x;
			const xDist = Math.min(Math.abs(box.p0.x - pg.x), Math.abs(box.p1.x - pg.x));

			if (inBox && (ret === null || xDist < minDist)) {
				ret = sgid;
				minDist = xDist;
			}
		});
	});

	if (ret !== null) {
		return {
			id: ret,
			dist: minDist
		};
	}

	return null;
}

function findClosestItem(restruct, pos, maps, skip, scale) { // eslint-disable-line max-params
	maps = maps || Object.keys(findMaps);

	return maps.reduce((res, mp) => {
		const minDist = res ? res.dist : null;
		const item = findMaps[mp](restruct, pos, skip, minDist, scale);

		if (item !== null && (res === null || item.dist < res.dist)) {
			return {
				map: mp,
				id: item.id,
				dist: item.dist
			};
		}

		return res;
	}, null);
}

/**
 * @param restruct { ReStruct }
 * @param selected { object }
 * @param maps { Array<string> }
 * @param scale { number }
 * @return {{
 * 		atoms: Map<number, number>?
 * 		bonds: Map<number, number>?
 * }}
 */
function findCloseMerge(restruct, selected, maps = ['atoms', 'bonds'], scale) {
	const pos = {
		atoms: new Map(), // aid -> position
		bonds: new Map() // bid -> position
	};

	const struct = restruct.molecule;

	selected.atoms.forEach((aid) => {
		pos.atoms.set(aid, struct.atoms.get(aid).pp);
	});

	selected.bonds.forEach((bid) => {
		const bond = struct.bonds.get(bid);
		pos.bonds.set(
			bid,
			Vec2.lc2(struct.atoms.get(bond.begin).pp, 0.5, struct.atoms.get(bond.end).pp, 0.5)
		);
	});

	const result = {};
	maps.forEach((mp) => {
		result[mp] = Array.from(pos[mp].keys()).reduce((res, srcId) => {
			const skip = { map: mp, id: srcId };
			const item = findMaps[mp](restruct, pos[mp].get(srcId), skip, null, scale);

			if (item && !selected[mp].includes(item.id))
				res.set(srcId, item.id);

			return res;
		}, new Map());
	});

	return result;
}

export default {
	atom: findClosestAtom, // used in Actions
	item: findClosestItem,
	merge: findCloseMerge
};
