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
	var impl = chem.SGroup.TYPES[type];
	for (var method in impl)
		this[method] = impl[method];
	this.visel = new rnd.Visel(rnd.Visel.TYPE.SGROUP);
	this.label = -1;
	this.bracketBox = null;

	this.highlight = false;
	this.highlighting = null;
	this.selected = false;
	this.selectionPlate = null;

	this.data = {
		'mul': -1, // multiplication count for MUL group
		'atoms': [],
		'patoms' : [],
		'connectivity': null, // head-to-head, head-to-tail or either-unknown
		'bonds' : [],
		'name' : '',
		'subscript' : ''
	}
}

chem.SGroup.numberArrayToString = function (numbers, map) {
	var str = chem.stringPadded(numbers.length, 3);
	for (var i = 0; i < numbers.length; ++i) {
		str += ' ' + chem.stringPadded(map[numbers[i]], 3);
	}
	return str;
}

chem.SGroup.addGroup = function (mol, sg)
{
	// add the group to the molecule
	sg.id = mol.sgroups.add(sg);

	// apply type-specific post-processing
	sg.postLoad(mol);

	// mark atoms in the group as belonging to it
	for (var s = 0; s < sg.data.atoms.length; ++s)
		mol.atoms.get(sg.data.atoms[s]).sgroup = sg.id;

	return sg.id;
}

chem.SGroup.clone = function (sgroup, aidMap, bidMap)
{
	var cp = new chem.SGroup(sgroup.type);

	cp.data.mul = sgroup.data.mul;
	cp.data.atoms = chem.mapArray(sgroup.data.atoms, aidMap);
	cp.data.connectivity = sgroup.data.connectivity;
	return cp;
}

chem.SGroup.addAtom = function (sgroup, aid)
{
	sgroup.data.atoms.push(aid);
}

chem.SGroup.removeAtom = function (sgroup, aid)
{
	for (var i = 0; i < sgroup.data.atoms.length; ++i) {
		if (sgroup.data.atoms[i] == aid) {
			sgroup.data.atoms.splice(i, 1);
			return;
		}
	}
	throw new Error("The atom is not found in the given s-group");
}

chem.SGroup.drawBrackets = function (set, paper, settings, styles, bb) {
	var bracketWidth = Math.min(settings.lineWidth * 5, bb.sz().x * 0.3);
	var leftBracket = paper.path("M{2},{1}L{0},{1}L{0},{3}L{2},{3}",
		bb.p0.x, bb.p0.y, bb.p0.x + bracketWidth, bb.p1.y)
		.attr(styles.sgroupBracketStyle);
	var rightBracket = paper.path("M{2},{1}L{0},{1}L{0},{3}L{2},{3}",
		bb.p1.x, bb.p0.y, bb.p1.x - bracketWidth, bb.p1.y)
		.attr(styles.sgroupBracketStyle);
	set.push(leftBracket, rightBracket);
}

chem.SGroup.getBBox = function (sg, ctab) {
	var bb = null;
	var render = ctab.render;
	var settings = render.settings;
	for (var i = 0; i < sg.data.atoms.length; ++i) {
		var aid = sg.data.atoms[i];
		var atom = ctab.atoms.get(aid);
		var bba = atom.visel.boundingBox;
		if (bba == null) {
			var p = atom.ps;
			bba = new chem.Box2Abs(p,p);
			var ext = new chem.Vec2(settings.lineWidth * 3, settings.lineWidth * 3);
			bba = bba.extend(ext, ext);
		}
		bb = (bb == null) ? bba : chem.Box2Abs.union(bb, bba);
	}
	return bb;
}

chem.SGroup.GroupMul = {
	draw: function (ctab) {
		var render = ctab.render;
		var settings = render.settings;
		var styles = render.styles;
		var paper = render.paper;
		var set = paper.set();
		this.bracketBox = chem.SGroup.getBBox(this, ctab);
		var vext = new chem.Vec2(settings.lineWidth * 2, settings.lineWidth * 4);
		var bb = this.bracketBox.extend(vext, vext);
		chem.SGroup.drawBrackets(set, paper, settings, styles, bb);
		var multIndex = paper.text(bb.p1.x + settings.lineWidth * 2, bb.p1.y, this.data.mul)
			.attr({'font' : settings.font, 'font-size' : settings.fontszsub});
		var multIndexBox = multIndex.getBBox();
		multIndex.translate(0.5 * multIndexBox.width, -0.3 * multIndexBox.height);
		set.push(multIndex);
		return set;
	},

	saveToMolfile: function (sgMap, atomMap, bondMap) {
		var idstr = chem.stringPadded(sgMap[this.id], 3);

		// TODO: check that multiple lines of atoms are read correctly
		// TODO: split into multiple lines if too many
		var salLine = 'M  SAL ' + idstr + chem.SGroup.numberArrayToString(chem.idList(this.data.atomSet), atomMap);
		var spaLine = 'M  SPA ' + idstr + chem.SGroup.numberArrayToString(chem.idList(this.data.parentAtomSet), atomMap);
		var sblLine = 'M  SBL ' + idstr + chem.SGroup.numberArrayToString(this.data.xBonds, bondMap);
		var smtLine = 'M  SMT ' + idstr + ' ' + this.data.mul;
		return [salLine, sblLine, spaLine, smtLine].join('\n');
	},

	prepareForSaving: function (mol) {
		var i,j;
		this.data.parentAtomSet = {};
		this.data.atomSet = {};
		for (i = 0; i < this.data.atoms.length; ++i) {
			this.data.parentAtomSet[this.data.atoms[i]] = 1;
			this.data.atomSet[this.data.atoms[i]] = 1;
		}
		this.data.inBonds = [];
		this.data.xBonds = [];

		mol.bonds.each(function(bid, bond){
			if (this.data.parentAtomSet[bond.begin] && this.data.parentAtomSet[bond.end])
				this.data.inBonds.push(bid);
			else if (this.data.parentAtomSet[bond.begin] || this.data.parentAtomSet[bond.end])
				this.data.xBonds.push(bid);
		}, this);
		if (this.data.xBonds.length != 0 && this.data.xBonds.length != 2)
			throw new Error("Unsupported cross-bonds number");

		var xAtom1 = -1,
			xAtom2 = -1;
		var crossBond = null;
		if (this.data.xBonds.length == 2) {
			var bond1 = mol.bonds.get(this.data.xBonds[0]);
			if (this.data.parentAtomSet[bond1.begin]) {
				xAtom1 = bond1.begin;
			} else {
				xAtom1 = bond1.end;
			}
			var bond2 = mol.bonds.get(this.data.xBonds[1]);
			if (this.data.parentAtomSet[bond2.begin]) {
				xAtom2 = bond2.begin;
			} else {
				xAtom2 = bond2.end;
			}
			crossBond = bond2;
		}

		var amap = null;
		var tailAtom = xAtom1;
		for (j = 0; j < this.data.mul - 1; ++j) {
			amap = {};
			for (i = 0; i < this.data.atoms.length; ++i) {
				var aid = this.data.atoms[i];
				var atom = mol.atoms.get(aid);
				var aid2 = mol.atoms.add(new chem.Molecule.Atom(atom));
				this.data.atomSet[aid2] = 1;
				amap[aid] = aid2;
				mol.atoms.get(aid2).pos.y -= 0.8 * (j+1);
			}
			for (i = 0; i < this.data.inBonds.length; ++i) {
				var bond = mol.bonds.get(this.data.inBonds[i]);
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
			var xBond2 = mol.bonds.get(this.data.xBonds[0]);
			if (xBond2.begin == xAtom1)
				xBond2.begin = tailAtom;
			else
				xBond2.end = tailAtom;
		}
	},

	postLoad: function (mol)
	{
		this.data.mul = this.data.subscript - 0;
		var atomReductionMap = {};
		var patoms = this.data.patoms;
		var patomsMap = chem.identityMap(patoms);
		// mark repetitions for removal
		for (var k = 1; k < this.data.mul; ++k) {
			for (var m = 0; m < patoms.length; ++m) {
				var raid = this.data.atoms[k * patoms.length + m];
				mol.atoms.get(raid).pos.y -= 3*k; // for debugging purposes
				atomReductionMap[raid] = patoms[m]; // "merge" atom in parent
			}
		}

		var bondsToRemove = [];
		mol.bonds.each(function(bid, bond){
			var beginIn = bond.begin in atomReductionMap;
			var endIn = bond.end in atomReductionMap;
			// if both adjacent atoms of a bond are to be merged, remove it
			if (beginIn && endIn
				|| beginIn && bond.end in patomsMap
				|| endIn && bond.begin in patomsMap) {
				bondsToRemove.push(bid);
			// if just one atom is merged, modify the bond accordingly
			} else if (beginIn) {
				bond.begin = atomReductionMap[bond.begin];
			} else if (endIn) {
				bond.end = atomReductionMap[bond.end];
			}
		}, this);

		// apply removal lists
		for (var b = 0; b < bondsToRemove.length; ++b) {
			mol.bonds.remove(bondsToRemove[b]);
		}
		for (var a in atomReductionMap) {
			mol.atoms.remove(a);
		}
		this.data.atoms = patoms;
		this.data.patoms = null;
	}
}

chem.SGroup.GroupSru = {
	draw: function (ctab) {
		var render = ctab.render;
		var settings = render.settings;
		var styles = render.styles;
		var paper = render.paper;
		var set = paper.set();
		this.bracketBox = chem.SGroup.getBBox(this, ctab);
		var vext = new chem.Vec2(settings.lineWidth * 2, settings.lineWidth * 4);
		var bb = this.bracketBox.extend(vext, vext);
		chem.SGroup.drawBrackets(set, paper, settings, styles, bb);
		var connectivityIndex = paper.text(bb.p1.x + settings.lineWidth * 1, bb.p0.y, this.data.connectivity)
			.attr({'font' : settings.font, 'font-size' : settings.fontszsub});
		var connectivityIndexBox = connectivityIndex.getBBox();
		connectivityIndex.translate(0.5 * connectivityIndexBox.width, 0.3 * connectivityIndexBox.height);
		set.push(connectivityIndex);
		return set;
	},

	saveToMolfile: function (sgMap, atomMap, bondMap) {
		var idstr = chem.stringPadded(sgMap[this.id], 3);

		// TODO: save to v3000 as well
		// TODO: check that multiple lines of atoms are read correctly
		// TODO: split into multiple lines if too many
		var salLine = 'M  SAL ' + idstr + chem.SGroup.numberArrayToString(this.data.atoms, atomMap);
		var sblLine = 'M  SBL ' + idstr + chem.SGroup.numberArrayToString(this.data.xBonds, bondMap);
		//var smtLine = 'M  SMT ' + idstr + ' ' + this.data.mul;
		return [salLine, sblLine].join('\n');
	},

	prepareForSaving: function (mol) { 
		this.data.xBonds = this.data.bonds; // TODO: fix
	},

	postLoad: function (mol) {
		this.data.connectivity = (this.data.connectivity || 'EU').trim().toLowerCase();
	}
}

chem.SGroup.GroupSup = {
	draw: function (ctab) {
		var render = ctab.render;
		var settings = render.settings;
		var styles = render.styles;
		var paper = render.paper;
		var set = paper.set();
		this.bracketBox = chem.SGroup.getBBox(this, ctab);
		var vext = new chem.Vec2(settings.lineWidth * 2, settings.lineWidth * 4);
		var bb = this.bracketBox.extend(vext, vext);
		chem.SGroup.drawBrackets(set, paper, settings, styles, bb);
		var name = paper.text(bb.p1.x + settings.lineWidth * 2, bb.p1.y, this.data.name)
			.attr({'font' : settings.font, 'font-size' : settings.fontszsub, 'font-style' : 'italic'});
		var nameBox = name.getBBox();
		name.translate(0.5 * nameBox.width, -0.3 * nameBox.height);
		set.push(name);
		return set;
	},

	saveToMolfile: function (sgMap, atomMap, bondMap) {
		var idstr = chem.stringPadded(sgMap[this.id], 3);

		var salLine = 'M  SAL ' + idstr + chem.SGroup.numberArrayToString(this.data.atoms, atomMap);
		var sblLine = 'M  SBL ' + idstr + chem.SGroup.numberArrayToString(this.data.xBonds, bondMap);
		var list = [salLine, sblLine];
		if (this.data.name && this.data.name != '')
			list.push('M  SMT ' + idstr + ' ' + this.data.name);
		return list.join('\n');
	},

	prepareForSaving: function (mol) {
		this.data.xBonds = this.data.bonds; // TODO: fix
	},

	postLoad: function (mol) {
		this.data.name = (this.data.subscript || '').trim();
	}
}

chem.SGroup.TYPES = {
	'MUL': chem.SGroup.GroupMul,
	'SRU': chem.SGroup.GroupSru,
	'SUP': chem.SGroup.GroupSup
};