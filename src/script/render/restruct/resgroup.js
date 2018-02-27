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
import Pile from '../../util/pile';
import util from '../util';
import scale from '../../util/scale';

import { SGroup } from '../../chem/struct';
import draw from '../draw';

import ReDataSGroupData from './redatasgroupdata';
import ReObject from './reobject';

const tfx = util.tfx;

function ReSGroup(sgroup) {
	this.init('sgroup');

	this.item = sgroup;
}
ReSGroup.prototype = new ReObject();
ReSGroup.isSelectable = function () {
	return false;
};

ReSGroup.prototype.draw = function (remol, sgroup) {
	var render = remol.render;
	var set = render.paper.set();
	var inBonds = [],
		xBonds = [];
	var atomSet = new Pile(sgroup.atoms);
	SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir;
	sgroup.areas = [bb];

	switch (sgroup.type) {
	case 'MUL':
		SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, sgroup.data.mul);
		break;
	case 'SRU':
		var connectivity = sgroup.data.connectivity || 'eu';
		if (connectivity == 'ht')
			connectivity = '';
		var subscript = sgroup.data.subscript || 'n';
		SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, subscript, connectivity);
		break;
	case 'SUP':
		SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, sgroup.data.name, null, { 'font-style': 'italic' });
		break;
	case 'GEN':
		SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d);
		break;
	case 'DAT':
		set = drawGroupDat(remol, sgroup);
		break;
	default: break;
	}
	return set;
};

function SGroupdrawBrackets(set, render, sg, xbonds, atomSet, bb, d, lowerIndexText, upperIndexText, indexAttribute) { // eslint-disable-line max-params
	var brackets = getBracketParameters(render.ctab.molecule, xbonds, atomSet, bb, d, render, sg.id);
	var ir = -1;
	for (var i = 0; i < brackets.length; ++i) {
		var bracket = brackets[i];
		var path = draw.bracket(render.paper, scale.obj2scaled(bracket.d, render.options),
			scale.obj2scaled(bracket.n, render.options),
			scale.obj2scaled(bracket.c, render.options),
			bracket.w, bracket.h, render.options);
		set.push(path);
		if (ir < 0 || brackets[ir].d.x < bracket.d.x || (brackets[ir].d.x == bracket.d.x && brackets[ir].d.y > bracket.d.y))
			ir = i;
	}
	var bracketR = brackets[ir];
	function renderIndex(text, shift) {
		var indexPos = scale.obj2scaled(bracketR.c.addScaled(bracketR.n, shift * bracketR.h), render.options);
		var indexPath = render.paper.text(indexPos.x, indexPos.y, text)
			.attr({
				font: render.options.font,
				'font-size': render.options.fontszsub
			});
		if (indexAttribute)
			indexPath.attr(indexAttribute);
		var indexBox = Box2Abs.fromRelBox(util.relBox(indexPath.getBBox()));
		var t = Math.max(util.shiftRayBox(indexPos, bracketR.d.negated(), indexBox), 3) + 2;
		indexPath.translateAbs(t * bracketR.d.x, t * bracketR.d.y);
		set.push(indexPath);
	}
	if (lowerIndexText)
		renderIndex(lowerIndexText, 0.5);
	if (upperIndexText)
		renderIndex(upperIndexText, -0.5);
}

function showValue(paper, pos, sg, options) {
	var text = paper.text(pos.x, pos.y, sg.data.fieldValue)
		.attr({
			font: options.font,
			'font-size': options.fontsz
		});
	var box = text.getBBox();
	var rect = paper.rect(box.x - 1, box.y - 1, box.width + 2, box.height + 2, 3, 3);
	rect = sg.selected ?
		rect.attr(options.selectionStyle) :
		rect.attr({ fill: '#fff', stroke: '#fff' });
	var st = paper.set();
	st.push(
		rect,
		text.toFront()
	);
	return st;
}

function drawGroupDat(restruct, sgroup) {
	const render = restruct.render;

	// NB: we did not pass xbonds parameter to the backetPos method above,
	//  so the result will be in the regular coordinate system

	bracketPos(sgroup, render, restruct.molecule);
	sgroup.areas = sgroup.bracketBox ? [sgroup.bracketBox] : [];

	if (sgroup.pp === null)
		sgroup.pp = definePP(restruct, sgroup);

	return sgroup.data.attached ? drawAttachedDat(restruct, sgroup) : drawAbsoluteDat(restruct, sgroup);
}

function definePP(restruct, sgroup) {
	let topLeftPoint = sgroup.bracketBox.p1.add(new Vec2(0.5, 0.5));
	const sgroups = Array.from(restruct.molecule.sgroups.values());
	for (let i = 0; i < restruct.molecule.sgroups.size; ++i) {
		if (!descriptorIntersects(sgroups, topLeftPoint))
			break;

		topLeftPoint = topLeftPoint.add(new Vec2(0, 0.5));
	}

	return topLeftPoint;
}

function descriptorIntersects(sgroups, topLeftPoint) {
	return sgroups.some((sg) => {
		if (!sg.pp)
			return false;

		const sgBottomRightPoint = sg.pp.add(new Vec2(0.5, 0.5));
		const bottomRightPoint = topLeftPoint.add(new Vec2(0.5, 0.5));

		return Box2Abs.segmentIntersection(sg.pp, sgBottomRightPoint, topLeftPoint, bottomRightPoint);
	});
}

function drawAbsoluteDat(restruct, sgroup) {
	const render = restruct.render;
	const options = render.options;
	const paper = render.paper;
	const set = paper.set();

	const ps = sgroup.pp.scaled(options.scale);
	const name = showValue(paper, ps, sgroup, options);
	const box = util.relBox(name.getBBox());

	name.translateAbs(0.5 * box.width, -0.5 * box.height);
	set.push(name);

	const sbox = Box2Abs.fromRelBox(util.relBox(name.getBBox()));
	sgroup.dataArea = sbox.transform(scale.scaled2obj, render.options);

	if (!restruct.sgroupData.has(sgroup.id))
		restruct.sgroupData.set(sgroup.id, new ReDataSGroupData(sgroup));

	return set;
}

function drawAttachedDat(restruct, sgroup) {
	const render = restruct.render;
	const options = render.options;
	const paper = render.paper;
	const set = paper.set();

	SGroup.getAtoms(restruct, sgroup).forEach((aid) => {
		const atom = restruct.atoms.get(aid);
		const p = scale.obj2scaled(atom.a.pp, options);
		const bb = atom.visel.boundingBox;

		if (bb !== null)
			p.x = Math.max(p.x, bb.p1.x);

		p.x += options.lineWidth; // shift a bit to the right

		const nameI = showValue(paper, p, sgroup, options);
		const boxI = util.relBox(nameI.getBBox());

		nameI.translateAbs(0.5 * boxI.width, -0.3 * boxI.height);
		set.push(nameI);

		let sboxI = Box2Abs.fromRelBox(util.relBox(nameI.getBBox()));
		sboxI = sboxI.transform(scale.scaled2obj, render.options);
		sgroup.areas.push(sboxI);
	});

	return set;
}

function bracketPos(sg, render, mol, xbonds) { // eslint-disable-line max-statements
	var atoms = sg.atoms;

	if (!xbonds || xbonds.length !== 2) {
		sg.bracketDir = new Vec2(1, 0);
	} else {
		var p1 = mol.bonds.get(xbonds[0]).getCenter(mol);
		var p2 = mol.bonds.get(xbonds[1]).getCenter(mol);
		sg.bracketDir = Vec2.diff(p2, p1).normalized();
	}
	var d = sg.bracketDir;

	var bb = null;
	var contentBoxes = [];

	atoms.forEach((aid) => {
		var atom = mol.atoms.get(aid);
		var bba = render ? render.ctab.atoms.get(aid).visel.boundingBox : null;
		if (!bba) {
			var pos = new Vec2(atom.pp);
			var ext = new Vec2(0.05 * 3, 0.05 * 3);
			bba = new Box2Abs(pos, pos).extend(ext, ext);
		} else {
			bba = bba.translate((render.options.offset || new Vec2()).negated()).transform(scale.scaled2obj, render.options);
		}
		contentBoxes.push(bba);
	});
	mol.sGroupForest.children.get(sg.id).forEach((sgid) => {
		var bba = render.ctab.sgroups.get(sgid).visel.boundingBox;
		bba = bba.translate((render.options.offset || new Vec2()).negated()).transform(scale.scaled2obj, render.options);
		contentBoxes.push(bba);
	});
	contentBoxes.forEach((bba) => {
		var bbb = null;
		[bba.p0.x, bba.p1.x].forEach((x) => {
			[bba.p0.y, bba.p1.y].forEach((y) => {
				var v = new Vec2(x, y);
				var p = new Vec2(Vec2.dot(v, d), Vec2.dot(v, d.rotateSC(1, 0)));
				bbb = (bbb === null) ? new Box2Abs(p, p) : bbb.include(p);
			});
		});
		bb = (bb === null) ? bbb : Box2Abs.union(bb, bbb);
	});
	var vext = new Vec2(0.2, 0.4);
	if (bb !== null) bb = bb.extend(vext, vext);
	sg.bracketBox = bb;
}

function getBracketParameters(mol, xbonds, atomSet, bb, d, render, id) { // eslint-disable-line max-params
	function BracketParams(c, d, w, h) {
		this.c = c;
		this.d = d;
		this.n = d.rotateSC(1, 0);
		this.w = w;
		this.h = h;
	}
	var brackets = [];
	var n = d.rotateSC(1, 0);
	if (xbonds.length < 2) {
		(function () {
			d = d || new Vec2(1, 0);
			n = n || d.rotateSC(1, 0);
			var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
			var cl = Vec2.lc2(d, bb.p0.x, n, 0.5 * (bb.p0.y + bb.p1.y));
			var cr = Vec2.lc2(d, bb.p1.x, n, 0.5 * (bb.p0.y + bb.p1.y));
			var bracketHeight = bb.sz().y;

			brackets.push(new BracketParams(cl, d.negated(), bracketWidth, bracketHeight), new BracketParams(cr, d, bracketWidth, bracketHeight));
		}());
	} else if (xbonds.length === 2) {
		(function () { // eslint-disable-line max-statements
			var b1 = mol.bonds.get(xbonds[0]);
			var b2 = mol.bonds.get(xbonds[1]);
			var cl0 = b1.getCenter(mol);
			var cr0 = b2.getCenter(mol);
			var tl = -1;
			var tr = -1;
			var tt = -1;
			var tb = -1;
			var cc = Vec2.centre(cl0, cr0);
			var dr = Vec2.diff(cr0, cl0).normalized();
			var dl = dr.negated();
			var dt = dr.rotateSC(1, 0);
			var db = dt.negated();

			mol.sGroupForest.children.get(id).forEach((sgid) => {
				var bba = render.ctab.sgroups.get(sgid).visel.boundingBox;
				bba = bba.translate((render.options.offset || new Vec2()).negated()).transform(scale.scaled2obj, render.options);
				tl = Math.max(tl, util.shiftRayBox(cl0, dl, bba));
				tr = Math.max(tr, util.shiftRayBox(cr0, dr, bba));
				tt = Math.max(tt, util.shiftRayBox(cc, dt, bba));
				tb = Math.max(tb, util.shiftRayBox(cc, db, bba));
			}, this);
			tl = Math.max(tl + 0.2, 0);
			tr = Math.max(tr + 0.2, 0);
			tt = Math.max(Math.max(tt, tb) + 0.1, 0);
			var bracketWidth = 0.25;
			var bracketHeight = 1.5 + tt;
			brackets.push(new BracketParams(cl0.addScaled(dl, tl), dl, bracketWidth, bracketHeight),
				new BracketParams(cr0.addScaled(dr, tr), dr, bracketWidth, bracketHeight));
		}());
	} else {
		(function () {
			for (var i = 0; i < xbonds.length; ++i) {
				var b = mol.bonds.get(xbonds[i]);
				var c = b.getCenter(mol);
				var d = atomSet.has(b.begin) ? b.getDir(mol) : b.getDir(mol).negated();
				brackets.push(new BracketParams(c, d, 0.2, 1.0));
			}
		}());
	}
	return brackets;
}

ReSGroup.prototype.drawHighlight = function (render) { // eslint-disable-line max-statements
	var options = render.options;
	var paper = render.paper;
	var sg = this.item;
	var bb = sg.bracketBox.transform(scale.obj2scaled, options);
	var lw = options.lineWidth;
	var vext = new Vec2(lw * 4, lw * 6);
	bb = bb.extend(vext, vext);
	var d = sg.bracketDir,
		n = d.rotateSC(1, 0);
	var a0 = Vec2.lc2(d, bb.p0.x, n, bb.p0.y);
	var a1 = Vec2.lc2(d, bb.p0.x, n, bb.p1.y);
	var b0 = Vec2.lc2(d, bb.p1.x, n, bb.p0.y);
	var b1 = Vec2.lc2(d, bb.p1.x, n, bb.p1.y);

	var set = paper.set();
	sg.highlighting = paper
		.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{0},{1}', tfx(a0.x), tfx(a0.y), tfx(a1.x), tfx(a1.y), tfx(b1.x), tfx(b1.y), tfx(b0.x), tfx(b0.y))
		.attr(options.highlightStyle);
	set.push(sg.highlighting);

	SGroup.getAtoms(render.ctab.molecule, sg).forEach((aid) => {
		set.push(render.ctab.atoms.get(aid).makeHighlightPlate(render));
	}, this);
	SGroup.getBonds(render.ctab.molecule, sg).forEach((bid) => {
		set.push(render.ctab.bonds.get(bid).makeHighlightPlate(render));
	}, this);
	render.ctab.addReObjectPath('highlighting', this.visel, set);
};

ReSGroup.prototype.show = function (restruct) {
	var render = restruct.render;
	var sgroup = this.item;
	if (sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
		var remol = render.ctab;
		var path = this.draw(remol, sgroup);
		restruct.addReObjectPath('data', this.visel, path, null, true);
		this.setHighlight(this.highlight, render); // TODO: fix this
	}
};

export default ReSGroup;
