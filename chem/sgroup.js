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

chem.SGroup.prototype.clone = function (aidMap, bidMap)
{
	var cp = new chem.SGroup(this.type);
	this.id = -1;
	cp.data.copy(this.data, aidMap, bidMap);
	return cp;
}

chem.SGroup.GroupMul = function () {
	this.brackets = null;
	this.mul = -1; // multiplication count
	this.atoms = [];
}

chem.SGroup.GroupMul.prototype.copy = function (sg, aidMap, bidMap) {
	this.brackets = sg.brackets;
	this.mul = sg.mul; // multiplication count
	this.atoms = [];
	for (var i = 0; i < sg.atoms.length; ++i)
		this.atoms.push(aidMap[sg.atoms[i]]);
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

chem.SGroup.GroupMul.prototype.prepareForSaving = function (mol) {
	var i,j;
	this.aset = {};
	for (i = 0; i < this.atoms.length; ++i) {
		this.aset[this.atoms[i]] = 1;
	}
	this.inBonds = [];
	this.xBonds = [];

	mol.bonds.each(function(bid, bond){
		if (this.aset[bond.begin] && this.aset[bond.end])
			this.inBonds.push(bid);
		else if (this.aset[bond.begin] || this.aset[bond.end])
			this.xBonds.push(bid);
	}, this);
	if (this.xBonds.length != 0 && this.xBonds.length != 2)
		throw new Error("Unsupported cross-bonds number");

	var xAtom1 = -1,
		xAtom2 = -1;
	var crossBond = null;
	if (this.xBonds.length == 2) {
		var bond1 = mol.bonds.get(this.xBonds[0]);
		if (this.aset[bond1.begin]) {
			xAtom1 = bond1.begin;
		} else {
			xAtom1 = bond1.end;
		}
		var bond2 = mol.bonds.get(this.xBonds[1]);
		if (this.aset[bond2.begin]) {
			xAtom2 = bond2.begin;
		} else {
			xAtom2 = bond2.end;
		}
		crossBond = bond2;
	}

	var amap = null;
	var tailAtom = xAtom1;
	for (j = 0; j < this.mul - 1; ++j) {
		amap = {};
		for (i = 0; i < this.atoms.length; ++i) {
			var aid = this.atoms[i];
			var atom = mol.atoms.get(aid);
			var aid2 = mol.atoms.add(new chem.Molecule.Atom(atom));
			amap[aid] = aid2;
			mol.atoms.get(aid2).pos.y -= 0.8 * (j+1);
		}
		for (i = 0; i < this.inBonds.length; ++i) {
			var bond = mol.bonds.get(this.inBonds[i]);
			var newBond = new chem.Molecule.Bond(bond);
			newBond.begin = amap[newBond.begin];
			newBond.end = amap[newBond.end];
			mol.bonds.add(newBond);
		}
		if (crossBond != null) {
			var newCrossBond = new chem.Molecule.Bond(crossBond);
			newCrossBond.begin = tailAtom;
			newCrossBond.end = amap[xAtom2];
			mol.bonds.add(newCrossBond);
			tailAtom = amap[xAtom1];
		}
	}
	if (tailAtom >= 0) {
		var xBond2 = mol.bonds.get(this.xBonds[0]);
		if (xBond2.begin == xAtom1)
			xBond2.begin = tailAtom;
		else
			xBond2.end = tailAtom;
	}
}

chem.SGroup.TYPES = {
	MUL: chem.SGroup.GroupMul
};