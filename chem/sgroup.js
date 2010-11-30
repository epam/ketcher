/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 *
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 *
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

if (!window.chem || !chem.Vec2 || !chem.Pool)
	throw new Error("Vec2, Pool should be defined first")
chem.SGroup = function (type)
{
	if (!type || !(type in chem.SGroup.TYPES))
		throw new Error("Invalid or unsupported s-group type");
//	if (typeof(id) != 'number' || id < 0)
//		throw new Error("Id should be a non-negative number");

	this.type = type;
	this.id = -1;
	this.data = new chem.SGroup.TYPES[type]();
	this.visel = new rnd.Visel(rnd.Visel.TYPE.SGROUP);
}

chem.SGroup.GroupMul = function () {
	this.brackets = null;
	this.mul = -1; // multiplication count
	this.atoms = [];
	this.leftBond = -1;
	this.rightBond = -1;
}

chem.SGroup.GroupMul.prototype.draw = function (ctab) {
	var render = ctab.render;
	var settings = render.settings;
	var styles = render.styles;
	var paper = render.paper;
	var set = paper.set();
	// TODO: delete the paths
	var bb = null;
	for (var i = 0; i < this.atoms.length; ++i) {
		var aid = this.atoms[i];
		var atom = ctab.atoms.get(aid);
		var bba = atom.visel.boundingBox;
		bb = bb == null ? bba : chem.Box2Abs.union(bb, bba);
	}
	var vext = new chem.Vec2(settings.lineWidth * 2, settings.lineWidth * 4);
	bb = bb.extend(vext, vext);
	var bracketWidth = Math.min(bb.sz().y * 0.2, bb.sz().x * 0.3);
	var leftBracket = paper.path("M{2},{1}L{0},{1}L{0},{3}L{2},{3}",
		bb.p0.x, bb.p0.y, bb.p0.x + bracketWidth, bb.p1.y)
		.attr(styles.sgroupBracketStyle);
	var rightBracket = paper.path("M{2},{1}L{0},{1}L{0},{3}L{2},{3}",
		bb.p1.x, bb.p0.y, bb.p1.x - bracketWidth, bb.p1.y)
		.attr(styles.sgroupBracketStyle);
	var multIndex = paper.text(bb.p1.x + settings.lineWidth * 2, bb.p1.y, this.mul)
		.attr({'font' : settings.font, 'font-size' : settings.fontszsub});
	multIndex.translate(0, -0.3 * multIndex.getBBox().height);
	set.push(leftBracket, rightBracket, multIndex);
	return set;
}

chem.SGroup.TYPES = {
	MUL: chem.SGroup.GroupMul
};

//for (var type in chem.SGroup.TYPES) {
//	chem.SGroup.TYPES[type].type = type;
//}