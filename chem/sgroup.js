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
	chem.SGroup.equip(this, type);
	this.visel = new rnd.Visel(rnd.Visel.TYPE.SGROUP);
	this.label = -1;
	this.bracketBox = null;

	this.highlight = false;
	this.highlighting = null;
	this.selected = false;
	this.selectionPlate = null;

	this.atoms = [];
	this.patoms = [];
	this.bonds = [];
	this.data = {
		'mul': 1, // multiplication count for MUL group
		'connectivity': null, // head-to-head, head-to-tail or either-unknown
		'name' : '',
		'subscript' : ''
	}
}

chem.SGroup.equip = function (sgroup, type) {
	var impl = chem.SGroup.TYPES[type];
	for (var method in impl)
		sgroup[method] = impl[method];
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
	for (var s = 0; s < sg.atoms.length; ++s)
		mol.atoms.get(sg.atoms[s]).sgroup = sg.id;

	return sg.id;
}

chem.SGroup.clone = function (sgroup, aidMap, bidMap)
{
	var cp = new chem.SGroup(sgroup.type);

	for (var field in sgroup.data) { // TODO: remove all non-primitive properties from 'data'
		cp.data[field] = sgroup.data[field];
	}
	cp.atoms = chem.mapArray(sgroup.atoms, aidMap);
	cp.patoms = null;
	cp.bonds = null;
	return cp;
}

chem.SGroup.addAtom = function (sgroup, aid)
{
	sgroup.atoms.push(aid);
}

chem.SGroup.removeAtom = function (sgroup, aid)
{
	for (var i = 0; i < sgroup.atoms.length; ++i) {
		if (sgroup.atoms[i] == aid) {
			sgroup.atoms.splice(i, 1);
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
	for (var i = 0; i < sg.atoms.length; ++i) {
		var aid = sg.atoms[i];
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

chem.SGroup.makeAtomBondLines = function (prefix, idstr, ids, map) {
	if (!ids)
		return [];
	var lines = [];
	for (var i = 0; i < Math.floor((ids.length + 14) / 15); ++i) {
		var rem = Math.min(ids.length - 15 * i, 15);
		var salLine = 'M  ' + prefix + ' ' + idstr + ' ' + chem.paddedInt(rem, 2);
		for (var j = 0; j < rem; ++j) {
			salLine += ' ' + chem.paddedInt(map[ids[i * 15 + j]], 3);
		}
		lines.push(salLine);
	}
	return lines;
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

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, chem.idList(this.atomSet), atomMap)); // TODO: check atomSet
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SPA', idstr, chem.idList(this.parentAtomSet), atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		var smtLine = 'M  SMT ' + idstr + ' ' + this.data.mul;
		lines.push(smtLine);
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
		var i,j;
		this.parentAtomSet = {};
		this.atomSet = {};
		for (i = 0; i < this.atoms.length; ++i) {
			this.parentAtomSet[this.atoms[i]] = 1;
			this.atomSet[this.atoms[i]] = 1;
		}
		var inBonds = [];
		var xBonds = [];

		mol.bonds.each(function(bid, bond){
			if (this.parentAtomSet[bond.begin] && this.parentAtomSet[bond.end])
				inBonds.push(bid);
			else if (this.parentAtomSet[bond.begin] || this.parentAtomSet[bond.end])
				xBonds.push(bid);
		}, this);
		if (xBonds.length != 0 && xBonds.length != 2)
			throw new Error("Unsupported cross-bonds number");

		var xAtom1 = -1,
			xAtom2 = -1;
		var crossBond = null;
		if (xBonds.length == 2) {
			var bond1 = mol.bonds.get(xBonds[0]);
			if (this.parentAtomSet[bond1.begin]) {
				xAtom1 = bond1.begin;
			} else {
				xAtom1 = bond1.end;
			}
			var bond2 = mol.bonds.get(xBonds[1]);
			if (this.parentAtomSet[bond2.begin]) {
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
			for (i = 0; i < this.atoms.length; ++i) {
				var aid = this.atoms[i];
				var atom = mol.atoms.get(aid);
				var aid2 = mol.atoms.add(new chem.Molecule.Atom(atom));
				this.atomSet[aid2] = 1;
				amap[aid] = aid2;
				mol.atoms.get(aid2).pos.y -= 0.8 * (j+1);
			}
			for (i = 0; i < inBonds.length; ++i) {
				var bond = mol.bonds.get(inBonds[i]);
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
			var xBond2 = mol.bonds.get(xBonds[0]);
			if (xBond2.begin == xAtom1)
				xBond2.begin = tailAtom;
			else
				xBond2.end = tailAtom;
		}
		this.bonds = xBonds;
	},

	postLoad: function (mol)
	{
		this.data.mul = this.data.subscript - 0;
		var atomReductionMap = {};
		var patoms = this.patoms;
		var patomsMap = chem.identityMap(patoms);
		// mark repetitions for removal
		for (var k = 1; k < this.data.mul; ++k) {
			for (var m = 0; m < patoms.length; ++m) {
				var raid = this.atoms[k * patoms.length + m];
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
		this.atoms = patoms;
		this.patoms = null;
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
		var connectivity = this.data.connectivity || 'eu';
		if (connectivity != 'ht') {
			var connectivityIndex = paper.text(bb.p1.x + settings.lineWidth * 1, bb.p0.y, connectivity)
				.attr({'font' : settings.font, 'font-size' : settings.fontszsub});
			var connectivityIndexBox = connectivityIndex.getBBox();
			connectivityIndex.translate(0.5 * connectivityIndexBox.width, 0.3 * connectivityIndexBox.height);
			set.push(connectivityIndex);
		}
		this.data.subscript = this.data.subscript || 'n';
		var subscript = paper.text(bb.p1.x + settings.lineWidth * 2, bb.p1.y, this.data.subscript)
			.attr({'font' : settings.font, 'font-size' : settings.fontszsub});
		var subscriptBox = subscript.getBBox();
		subscript.translate(0.5 * subscriptBox.width, -0.3 * subscriptBox.height);
		set.push(subscript);
		return set;
	},

	saveToMolfile: function (sgMap, atomMap, bondMap) {
		var idstr = chem.stringPadded(sgMap[this.id], 3);

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
		var xBonds = [];
		mol.bonds.each(function(bid, bond){
			var a1 = mol.atoms.get(bond.begin);
			var a2 = mol.atoms.get(bond.end);
			if ((a1.sgroup == this.id && a2.sgroup != this.id) || (a1.sgroup != this.id && a2.sgroup == this.id))
				xBonds.push(bid);
		},this);
		this.bonds = xBonds;
	},

	postLoad: function (mol) {
		this.data.connectivity = (this.data.connectivity || 'EU').strip().toLowerCase();
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
		if (this.data.name) {
			var name = paper.text(bb.p1.x + settings.lineWidth * 2, bb.p1.y, this.data.name)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontszsub,
				'font-style' : 'italic'
			});
			var nameBox = name.getBBox();
			name.translate(0.5 * nameBox.width, -0.3 * nameBox.height);
			set.push(name);
		}
		return set;
	},

	saveToMolfile: function (sgMap, atomMap, bondMap) {
		var idstr = chem.stringPadded(sgMap[this.id], 3);

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		if (this.data.name && this.data.name != '')
			lines.push('M  SMT ' + idstr + ' ' + this.data.name);
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
	},

	postLoad: function (mol) {
		this.data.name = (this.data.subscript || '').strip();
	}
}

chem.SGroup.GroupGen = {
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
		return set;
	},

	saveToMolfile: function (sgMap, atomMap, bondMap) {
		var idstr = chem.stringPadded(sgMap[this.id], 3);

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
	},

	postLoad: function (mol) {
	}
}

chem.SGroup.GroupDat = {
	draw: function (ctab) {
		var render = ctab.render;
		var settings = render.settings;
		var paper = render.paper;
		var set = paper.set();
		this.ps = this.p.scaled(settings.scaleFactor);
		
		var name = paper.text(this.ps.x, this.ps.y, this.data.fieldValue)
		.attr({
			'font' : settings.font,
			'font-size' : settings.fontsz
		});
		var box = name.getBBox();
		name.translate(0.5 * box.width, -0.5 * box.height);
		set.push(name);
		this.bracketBox = chem.Box2Abs.fromRelBox(name.getBBox());
		return set;
	},

	saveToMolfile: function (sgMap, atomMap, bondMap) {
		var idstr = chem.stringPadded(sgMap[this.id], 3);

		var data = this.data;
		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		var sdtLine = 'M  SDT ' + idstr +
			' ' + chem.stringPadded(data.fieldName, 30, true) +
			chem.stringPadded(data.fieldType, 2) +
			chem.stringPadded(data.units, 20, true) +
			chem.stringPadded(data.query, 2) +
			chem.stringPadded(data.queryOp, 3);
		lines.push(sdtLine);
		var sddLine = 'M  SDD ' + idstr +
			' ' + chem.paddedFloat(p.x, 10, 4) + chem.paddedFloat(p.y, 10, 4) +
			'    ' + // ' eee'
			(data.attached ? 'A' : 'D') + // f
			(data.absolute ? 'A' : 'R') + // g
			(data.showUnits ? 'U' : ' ') + // h
			'   ' + //  i
			(data.nCharnCharsToDisplay >= 0 ? chem.paddedInt(data.nCharnCharsToDisplay, 3) : 'ALL') + // jjj
			'  1   ' + // 'kkk ll '
			chem.stringPadded(data.tagChar, 1) + // m
			'  ' + chem.paddedInt(data.daspPos, 1) + // n
			'  '; // oo
		lines.push(sddLine);
		var str = data.fieldValue;
		var charsPerLine = 69;
		while (str.length > charsPerLine) {
			lines.push('M  SCD ' + idstr + ' ' + str.slice(0, charsPerLine));
			str = str.slice(69);
		}
		lines.push('M  SED ' + idstr + ' ' + chem.stringPadded(str, charsPerLine, true));
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
		if (this.data.allAtoms) {
			this.atoms = [];
			mol.atoms.each(function(aid){
				this.atoms.push(aid);
			},this);
		}
	},

	postLoad: function (mol) {
		if (this.data.fieldName == 'MDLBG_FRAGMENT_STEREO' || this.data.fieldName == 'MDLBG_FRAGMENT_COEFFICIENT' || this.data.fieldName == 'MDLBG_FRAGMENT_CHARGE') {
			this.atoms = [];
			this.allAtoms = true;
		}
	}
}

chem.SGroup.TYPES = {
	'MUL': chem.SGroup.GroupMul,
	'SRU': chem.SGroup.GroupSru,
	'SUP': chem.SGroup.GroupSup,
	'DAT': chem.SGroup.GroupDat,
	'GEN': chem.SGroup.GroupGen
};