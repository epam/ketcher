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

import Box2Abs from '../../util/box2abs';
import Vec2 from '../../util/vec2';
import ReObject from './reobject';
import scale from '../../util/scale';

function ReFrag(/* Struct.Fragment = {}*/frag) {
	this.init('frag');
	this.item = frag;
}

ReFrag.prototype = new ReObject();

ReFrag.isSelectable = function () {
	return false;
};

ReFrag.prototype.fragGetAtoms = function (restruct, fid) {
	return Array.from(restruct.atoms.keys())
		.filter(aid => restruct.atoms.get(aid).a.fragment === fid);
};

ReFrag.prototype.fragGetBonds = function (restruct, fid) {
	return Array.from(restruct.bonds.keys())
		.filter((bid) => {
			const bond = restruct.bonds.get(bid).b;

			const firstFrag = restruct.atoms.get(bond.begin).a.fragment;
			const secondFrag = restruct.atoms.get(bond.end).a.fragment;

			return firstFrag === fid && secondFrag === fid;
		});
};

ReFrag.prototype.calcBBox = function (restruct, fid, render) { // TODO need to review parameter list
	var ret;
	restruct.atoms.forEach((atom) => {
		if (atom.a.fragment !== fid)
			return;

		// TODO ReObject.calcBBox to be used instead
		let bba = atom.visel.boundingBox;
		if (!bba) {
			bba = new Box2Abs(atom.a.pp, atom.a.pp);
			const ext = new Vec2(0.05 * 3, 0.05 * 3);
			bba = bba.extend(ext, ext);
		} else {
			if (!render) render = global._ui_editor.render; // eslint-disable-line
			bba = bba.translate((render.options.offset || new Vec2()).negated()).transform(scale.scaled2obj, render.options);
		}
		ret = (ret ? Box2Abs.union(ret, bba) : bba);
	});

	return ret;
};

// TODO need to review parameter list
ReFrag.prototype._draw = function (render, fid, attrs) { // eslint-disable-line no-underscore-dangle
	const bb = this.calcBBox(render.ctab, fid, render);

	if (bb) {
		const p0 = scale.obj2scaled(new Vec2(bb.p0.x, bb.p0.y), render.options);
		const p1 = scale.obj2scaled(new Vec2(bb.p1.x, bb.p1.y), render.options);
		return render.paper.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0).attr(attrs);
	}

	// TODO abnormal situation, empty fragments must be destroyed by tools
	return console.assert(null, 'Empty fragment');
};

ReFrag.prototype.draw = function (render) { // eslint-disable-line no-unused-vars
	return null;// this._draw(render, fid, { 'stroke' : 'lightgray' }); // [RB] for debugging only
};

ReFrag.prototype.drawHighlight = function (render) { // eslint-disable-line no-unused-vars
	// Do nothing. This method shouldn't actually be called.
};

ReFrag.prototype.setHighlight = function (highLight, render) {
	let fid = render.ctab.frags.keyOf(this);

	if (!fid && fid !== 0) {
		console.warn('Fragment does not belong to the render');
		return;
	}

	fid = parseInt(fid, 10);

	render.ctab.atoms.forEach((atom) => {
		if (atom.a.fragment === fid)
			atom.setHighlight(highLight, render);
	});

	render.ctab.bonds.forEach((bond) => {
		if (render.ctab.atoms.get(bond.b.begin).a.fragment === fid)
			bond.setHighlight(highLight, render);
	});
};

export default ReFrag;
