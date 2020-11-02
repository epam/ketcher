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

import Vec2 from '../../../util/vec2';

function getElementsInRectangle(restruct, p0, p1) {
	const bondList = [];
	const atomList = [];

	const x0 = Math.min(p0.x, p1.x);
	const x1 = Math.max(p0.x, p1.x);
	const y0 = Math.min(p0.y, p1.y);
	const y1 = Math.max(p0.y, p1.y);

	restruct.bonds.forEach((bond, bid) => {
		const centre = Vec2.lc2(restruct.atoms.get(bond.b.begin).a.pp, 0.5,
			restruct.atoms.get(bond.b.end).a.pp, 0.5);
		if (centre.x > x0 && centre.x < x1 && centre.y > y0 && centre.y < y1)
			bondList.push(bid);
	});

	restruct.atoms.forEach((atom, aid) => {
		if (atom.a.pp.x > x0 && atom.a.pp.x < x1 && atom.a.pp.y > y0 && atom.a.pp.y < y1)
			atomList.push(aid);
	});

	const rxnArrowsList = [];
	const rxnPlusesList = [];

	restruct.rxnArrows.forEach((item, id) => {
		if (item.item.pp.x > x0 && item.item.pp.x < x1 && item.item.pp.y > y0 && item.item.pp.y < y1)
			rxnArrowsList.push(id);
	});

	restruct.rxnPluses.forEach((item, id) => {
		if (item.item.pp.x > x0 && item.item.pp.x < x1 && item.item.pp.y > y0 && item.item.pp.y < y1)
			rxnPlusesList.push(id);
	});

	const chiralFlagList = [];
	restruct.chiralFlags.forEach((item, id) => {
		if (item.pp.x > x0 && item.pp.x < x1 && item.pp.y > y0 && item.pp.y < y1)
			chiralFlagList.push(id);
	});

	const sgroupDataList = [];
	restruct.sgroupData.forEach((item, id) => {
		if (item.sgroup.pp.x > x0 && item.sgroup.pp.x < x1 &&
			item.sgroup.pp.y > y0 && item.sgroup.pp.y < y1)
			sgroupDataList.push(id);
	});

	return {
		atoms: atomList,
		bonds: bondList,
		rxnArrows: rxnArrowsList,
		rxnPluses: rxnPlusesList,
		chiralFlags: chiralFlagList,
		sgroupData: sgroupDataList
	};
}

function getElementsInPolygon(restruct, rr) { // eslint-disable-line max-statements
	const bondList = [];
	const atomList = [];
	const r = [];

	for (let i = 0; i < rr.length; ++i)
		r[i] = new Vec2(rr[i].x, rr[i].y);

	restruct.bonds.forEach((bond, bid) => {
		const centre = Vec2.lc2(restruct.atoms.get(bond.b.begin).a.pp, 0.5,
			restruct.atoms.get(bond.b.end).a.pp, 0.5);
		if (isPointInPolygon(r, centre))
			bondList.push(bid);
	});

	restruct.atoms.forEach((atom, aid) => {
		if (isPointInPolygon(r, atom.a.pp))
			atomList.push(aid);
	});

	const rxnArrowsList = [];
	const rxnPlusesList = [];

	restruct.rxnArrows.forEach((item, id) => {
		if (isPointInPolygon(r, item.item.pp))
			rxnArrowsList.push(id);
	});

	restruct.rxnPluses.forEach((item, id) => {
		if (isPointInPolygon(r, item.item.pp))
			rxnPlusesList.push(id);
	});

	const chiralFlagList = [];
	restruct.chiralFlags.forEach((item, id) => {
		if (isPointInPolygon(r, item.pp))
			chiralFlagList.push(id);
	});

	const sgroupDataList = [];
	restruct.sgroupData.forEach((item, id) => {
		if (isPointInPolygon(r, item.sgroup.pp))
			sgroupDataList.push(id);
	});

	return {
		atoms: atomList,
		bonds: bondList,
		rxnArrows: rxnArrowsList,
		rxnPluses: rxnPlusesList,
		chiralFlags: chiralFlagList,
		sgroupData: sgroupDataList
	};
}

// TODO: test me see testPolygon from
// 'Remove unused methods from render' commit
function isPointInPolygon(r, p) { // eslint-disable-line max-statements
	var d = new Vec2(0, 1);
	var n = d.rotate(Math.PI / 2);
	var v0 = Vec2.diff(r[r.length - 1], p);
	var n0 = Vec2.dot(n, v0);
	var d0 = Vec2.dot(d, v0);
	var w0 = null;
	var counter = 0;
	var eps = 1e-5;
	var flag1 = false;
	var flag0 = false;

	for (var i = 0; i < r.length; ++i) {
		var v1 = Vec2.diff(r[i], p);
		var w1 = Vec2.diff(v1, v0);
		var n1 = Vec2.dot(n, v1);
		var d1 = Vec2.dot(d, v1);
		flag1 = false;
		if (n1 * n0 < 0) {
			if (d1 * d0 > -eps) {
				if (d0 > -eps)
					flag1 = true;
				/* eslint-disable no-mixed-operators*/
			} else if ((Math.abs(n0) * Math.abs(d1) - Math.abs(n1) * Math.abs(d0)) * d1 > 0) {
				/* eslint-enable no-mixed-operators*/
				flag1 = true;
			}
		}
		if (flag1 && flag0 && Vec2.dot(w1, n) * Vec2.dot(w0, n) >= 0)
			flag1 = false;
		if (flag1)
			counter++;
		v0 = v1;
		n0 = n1;
		d0 = d1;
		w0 = w1;
		flag0 = flag1;
	}
	return (counter % 2) !== 0;
}

export default {
	inRectangle: getElementsInRectangle,
	inPolygon: getElementsInPolygon
};
