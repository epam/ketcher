var Box2Abs = require('../../util/box2abs');
var Set = require('../../util/set');
var Vec2 = require('../../util/vec2');
var util = require('../../util');

var Struct = require('../../chem/struct');
var draw = require('../draw');

var ReDataSGroupData = require('./redatasgroupdata');
var ReObject = require('./reobject');

var tfx = util.tfx;

function ReSGroup(sgroup) {
	this.init('sgroup');

	this.item = sgroup;
}
ReSGroup.prototype = new ReObject();
ReSGroup.isSelectable = function () {
	return false;
};

ReSGroup.prototype.draw = function (remol, sgroup) {
	//	console.log("Draw Sgroup: " + sgroup.type); //  sgroup.type == MUL || SRU ||...
	return SGroupDraw[sgroup.type](remol, sgroup);
};

function SGroupdrawBrackets(set, render, sg, xbonds, atomSet, bb, d, n, lowerIndexText, upperIndexText, indexAttribute) { // eslint-disable-line max-params
	var brackets = Struct.SGroup.getBracketParameters(render.ctab.molecule, xbonds, atomSet, bb, d, n, render, sg.id);
	var ir = -1;
	for (var i = 0; i < brackets.length; ++i) {
		var bracket = brackets[i];
		var path = draw.bracket(render, render.obj2scaled(bracket.d),
		                        render.obj2scaled(bracket.n),
		                        render.obj2scaled(bracket.c),
		                        bracket.w, bracket.h);
		set.push(path);
		if (ir < 0 || brackets[ir].d.x < bracket.d.x || (brackets[ir].d.x == bracket.d.x && brackets[ir].d.y > bracket.d.y))
			ir = i;
	}
	var bracketR = brackets[ir];
	function renderIndex(text, shift) {
		var indexPos = render.ps(bracketR.c.addScaled(bracketR.n, shift * bracketR.h));
		var indexPath = render.paper.text(indexPos.x, indexPos.y, text)
			.attr({
				'font': render.options.font,
				'font-size': render.options.fontszsub
			});
		if (indexAttribute)
			indexPath.attr(indexAttribute);
		var indexBox = Box2Abs.fromRelBox(util.relBox(indexPath.getBBox()));
		var t = Math.max(Vec2.shiftRayBox(indexPos, bracketR.d.negated(), indexBox), 3) + 2;
		indexPath.translateAbs(t * bracketR.d.x, t * bracketR.d.y);
		set.push(indexPath);
	}
	if (lowerIndexText)
		renderIndex(lowerIndexText, 0.5);
	if (upperIndexText)
		renderIndex(upperIndexText, -0.5);
}

function drawGroupMul(remol, sgroup) {
	var render = remol.render;
	var set = render.paper.set();
	var inBonds = [],
		xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	Struct.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	Struct.SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir,
		n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	new SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n, sgroup.data.mul);
	return set;
}

function  drawGroupSru(remol, sgroup) {
	var render = remol.render;
	var set = render.paper.set();
	var inBonds = [],
		xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	Struct.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	Struct.SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir,
		n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	var connectivity = sgroup.data.connectivity || 'eu';
	if (connectivity == 'ht')
		connectivity = '';
	var subscript = sgroup.data.subscript || 'n';
	new SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n, subscript, connectivity);
	return set;
}

function drawGroupSup(remol, sgroup) {
	var render = remol.render;
	var set = render.paper.set();
	var inBonds = [],
		xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	Struct.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	Struct.SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir,
		n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	new SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n, sgroup.data.name, null, { 'font-style': 'italic' });
	return set;
}

function drawGroupGen(remol, sgroup) {
	var render = remol.render;
	var paper = render.paper;
	var set = paper.set();
	var inBonds = [],
		xBonds = [];
	var atomSet = Set.fromList(sgroup.atoms);
	Struct.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, atomSet);
	Struct.SGroup.bracketPos(sgroup, render, remol.molecule, xBonds);
	var bb = sgroup.bracketBox;
	var d = sgroup.bracketDir,
		n = d.rotateSC(1, 0);
	sgroup.areas = [bb];
	new SGroupdrawBrackets(set, render, sgroup, xBonds, atomSet, bb, d, n);
	return set;
}

function showValue(paper, pos, sg, options) {
	var text = paper.text(pos.x, pos.y, sg.data.fieldValue)
		.attr({
			'font': options.font,
			'font-size': options.fontsz
		});
	var box = text.getBBox();
	var rect = paper.rect(box.x - 1, box.y - 1,
							  box.width + 2, box.height + 2, 3, 3)
		.attr({
			fill: '#fff',
			stroke: '#fff'
		});
	var st = paper.set();
	st.push(
		rect,
			text.toFront()
	);
	return st;
}

function drawGroupDat(remol, sgroup) { // eslint-disable-line max-statements
	var render = remol.render;
	var options = render.options;
	var paper = render.paper;
	var set = paper.set();
	var atoms = Struct.SGroup.getAtoms(remol, sgroup);
	var i;
	Struct.SGroup.bracketPos(sgroup, render, remol.molecule);
	sgroup.areas = sgroup.bracketBox ? [sgroup.bracketBox] : [];
	if (sgroup.pp == null)
		// NB: we did not pass xbonds parameter to the backetPos method above,
		//  so the result will be in the regular coordinate system
		Struct.SGroup.setPos(remol, sgroup, sgroup.bracketBox.p1.add(new Vec2(0.5, 0.5)));
	var ps = sgroup.pp.scaled(options.scaleFactor);

	if (sgroup.data.attached) {
		for (i = 0; i < atoms.length; ++i) {
			var atom = remol.atoms.get(atoms[i]);
			var p = render.ps(atom.a.pp);
			var bb = atom.visel.boundingBox;
			if (bb != null)
				p.x = Math.max(p.x, bb.p1.x);
			p.x += options.lineWidth; // shift a bit to the right
			var nameI = showValue(paper, p, sgroup, options);
			var boxI = util.relBox(nameI.getBBox());
			nameI.translateAbs(0.5 * boxI.width, -0.3 * boxI.height);
			set.push(nameI);
			var sboxI = Box2Abs.fromRelBox(util.relBox(nameI.getBBox()));
			sboxI = sboxI.transform(render.scaled2obj, render);
			sgroup.areas.push(sboxI);
		}
	} else {
		var name = showValue(paper, ps, sgroup, options);
		var box = util.relBox(name.getBBox());
		name.translateAbs(0.5 * box.width, -0.5 * box.height);
		set.push(name);
		var sbox = Box2Abs.fromRelBox(util.relBox(name.getBBox()));
		sgroup.dataArea = sbox.transform(render.scaled2obj, render);
		if (!remol.sgroupData.has(sgroup.id))
			remol.sgroupData.set(sgroup.id, new ReDataSGroupData(sgroup));
	}
	return set;
}

var SGroupDraw = {
	MUL: drawGroupMul,
	SRU: drawGroupSru,
	SUP: drawGroupSup,
	DAT: drawGroupDat,
	GEN: drawGroupGen
};

ReSGroup.prototype.drawHighlight = function (render) { // eslint-disable-line max-statements
	var options = render.options;
	var paper = render.paper;
	var sg = this.item;
	var bb = sg.bracketBox.transform(render.obj2scaled, render);
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

	Struct.SGroup.getAtoms(render.ctab.molecule, sg).each(function (aid) {
		set.push(render.ctab.atoms.get(aid).makeHighlightPlate(render));
	}, this);
	Struct.SGroup.getBonds(render.ctab.molecule, sg).each(function (bid) {
		set.push(render.ctab.bonds.get(bid).makeHighlightPlate(render));
	}, this);
	render.ctab.addReObjectPath('highlighting', this.visel, set);
};

module.exports = ReSGroup;
