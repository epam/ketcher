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

if (!window.chem || !util.Vec2 || !util.Pool)
	throw new Error("Vec2, Pool should be defined first");
chem.SGroup = function (type)
{
	if (!type || !(type in chem.SGroup.TYPES))
		throw new Error("Invalid or unsupported s-group type");

	this.type = type;
	this.id = -1;
	chem.SGroup.equip(this, type);
	this.label = -1;
	this.bracketBox = null;
    this.bracketDir = new util.Vec2(1,0);
    this.areas = [];

	this.highlight = false;
	this.highlighting = null;
	this.selected = false;
	this.selectionPlate = null;

	this.atoms = [];
	this.patoms = [];
	this.bonds = [];
	this.xBonds = [];
	this.neiAtoms = [];
	this.pp = null;
	this.data = {
		'mul': 1, // multiplication count for MUL group
		'connectivity': 'ht', // head-to-head, head-to-tail or either-unknown
		'name' : '',
		'subscript' : '',

		// data s-group fields
		'attached' : false,
		'absolute' : true,
		'showUnits' : false,
		'nCharsToDisplay' : -1,
		'tagChar' : '',
		'daspPos' : 1,
		'fieldType' : 'F',
		'fieldName' : '',
		'units' : '',
		'query' : '',
		'queryOp' : ''
	}
};

// TODO: these methods should be overridden
//      and should only accept valid attributes for each S-group type.
//      The attributes should be accessed via these methods only and not directly through this.data.
// stub
chem.SGroup.prototype.getAttr = function (attr) {
    return this.data[attr];
};

// TODO: should be group-specific
chem.SGroup.prototype.getAttrs = function () {
    var attrs = {};
    for (var attr in this.data)
        attrs[attr] = this.data[attr];
    return attrs;
};

// stub
chem.SGroup.prototype.setAttr = function (attr, value) {
    var oldValue = this.data[attr];
    this.data[attr] = value;
    return oldValue;
};

// stub
chem.SGroup.prototype.checkAttr = function (attr, value) {
    return this.data[attr] == value;
};

chem.SGroup.equip = function (sgroup, type) {
	var impl = chem.SGroup.TYPES[type];
	for (var method in impl)
		sgroup[method] = impl[method];
};

chem.SGroup.numberArrayToString = function (numbers, map) {
	var str = util.stringPadded(numbers.length, 3);
	for (var i = 0; i < numbers.length; ++i) {
		str += ' ' + util.stringPadded(map[numbers[i]], 3);
	}
	return str;
};

chem.SGroup.addGroup = function (mol, sg, atomMap)
{
	// add the group to the molecule
	sg.id = mol.sgroups.add(sg);

	// apply type-specific post-processing
	sg.postLoad(mol, atomMap);

	// mark atoms in the group as belonging to it
	for (var s = 0; s < sg.atoms.length; ++s)
            if (mol.atoms.has(sg.atoms[s]))
                util.Set.add(mol.atoms.get(sg.atoms[s]).sgs, sg.id);

	return sg.id;
};

chem.SGroup.bracketsToMolfile = function (mol, sg, idstr) {
	var bb = chem.SGroup.getObjBBox(sg.atoms, mol);
	bb = bb.extend(new util.Vec2(0.4, 0.4));
        bb.p0 = bb.p0.yComplement();
        bb.p1 = bb.p1.yComplement();
	var coord = [
		[bb.p0.x, bb.p1.y, bb.p0.x, bb.p0.y],
		[bb.p1.x, bb.p0.y, bb.p1.x, bb.p1.y]
	];
	var lines = [];
	for (var j = 0; j < coord.length; ++j) {
		var line = 'M  SDI ' + idstr + util.paddedInt(4, 3);
		for (var i = 0; i < coord[j].length; ++i) {
			line += util.paddedFloat(coord[j][i], 10, 4);
		}
		lines.push(line);
	}

	return lines;
};

chem.SGroup.filterAtoms = function (atoms, map) {
	var newAtoms = [];
	for (var i = 0; i < atoms.length; ++i) {
		var aid = atoms[i];
		if (typeof(map[aid]) != "number") {
			newAtoms.push(aid);
		} else if (map[aid] >= 0) {
			newAtoms.push(map[aid]);
		} else {
			newAtoms.push(-1);
		}
	}
	return newAtoms;
};

chem.SGroup.removeNegative = function (atoms) {
	var newAtoms = [];
	for (var j = 0; j < atoms.length; ++j)
		if (atoms[j] >= 0)
			newAtoms.push(atoms[j]);
	return newAtoms;
};

chem.SGroup.filter = function (mol, sg, atomMap)
{
	sg.atoms = chem.SGroup.removeNegative(chem.SGroup.filterAtoms(sg.atoms, atomMap));
};

chem.SGroup.clone = function (sgroup, aidMap, bidMap)
{
	var cp = new chem.SGroup(sgroup.type);

	for (var field in sgroup.data) { // TODO: remove all non-primitive properties from 'data'
		cp.data[field] = sgroup.data[field];
	}
	cp.atoms = util.mapArray(sgroup.atoms, aidMap);
	cp.pp = sgroup.pp;
	cp.bracketBox = sgroup.bracketBox;
	cp.patoms = null;
	cp.bonds = null;
	cp.allAtoms = sgroup.allAtoms;
	return cp;
};

chem.SGroup.addAtom = function (sgroup, aid)
{
	sgroup.atoms.push(aid);
};

chem.SGroup.removeAtom = function (sgroup, aid)
{
	for (var i = 0; i < sgroup.atoms.length; ++i) {
		if (sgroup.atoms[i] == aid) {
			sgroup.atoms.splice(i, 1);
			return;
		}
	}
	throw new Error("The atom is not found in the given s-group");
};

chem.SGroup.getCrossBonds = function (inBonds, xBonds, mol, parentAtomSet) {
    mol.bonds.each(function(bid, bond){
        if (util.Set.contains(parentAtomSet, bond.begin) && util.Set.contains(parentAtomSet, bond.end)) {
            if (inBonds != null)
                inBonds.push(bid);
        } else if (util.Set.contains(parentAtomSet, bond.begin) || util.Set.contains(parentAtomSet, bond.end)) {
            if (xBonds != null)
                xBonds.push(bid);
        }
    }, this);
}

chem.SGroup.bracketPos = function (sg, remol, xbonds) {
    var atoms = sg.atoms;
    if (xbonds.length != 2) {
        sg.bracketDir = new util.Vec2(1, 0);
    } else {
        var b1 = remol.bonds.get(xbonds[0]), b2 = remol.bonds.get(xbonds[1]);
        var p1 = b1.b.center, p2 = b2.b.center;
        sg.bracketDir = util.Vec2.diff(p2, p1).normalized();
    }
    var d = sg.bracketDir;
    var n = d.rotateSC(1, 0);

    var bb = null;
    var render = remol.render;
    var settings = render.settings;
    for (var i = 0; i < atoms.length; ++i) {
        var aid = atoms[i];
        var atom = remol.atoms.get(aid);
        var bba = atom.visel.boundingBox;
        if (bba == null) {
            var p = new util.Vec2(util.Vec2.dot(atom.a.pp, d), util.Vec2.dot(atom.a.pp, n));
            bba = new util.Box2Abs(p,p);
            var ext = new util.Vec2(0.05 * 3, 0.05 * 3);
            bba = bba.extend(ext, ext);
        } else {
            bba = bba.transform(render.scaled2obj, render);
        }
        bb = (bb == null) ? bba : util.Box2Abs.union(bb, bba);
    }
    var vext = new util.Vec2(0.05 * 2, 0.05 * 4);
    if (bb != null)
        bb = bb.extend(vext, vext);

    sg.bracketBox = bb;
};

chem.SGroup.drawBrackets = function (set, render, paper, settings, styles, bb, d, n) {
    d = d || new util.Vec2(1, 0);
    n = n || new util.Vec2(0, 1);
    var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
    var a0 = util.Vec2.lc2(d, bb.p0.x, n, bb.p0.y);
    var a1 = util.Vec2.lc2(d, bb.p0.x, n, bb.p1.y);
    var b0 = util.Vec2.lc2(d, bb.p1.x, n, bb.p0.y);
    var b1 = util.Vec2.lc2(d, bb.p1.x, n, bb.p1.y);
    var a02 = a0.addScaled(d, bracketWidth);
    var a12 = a1.addScaled(d, bracketWidth);
    var b02 = b0.addScaled(d, -bracketWidth);
    var b12 = b1.addScaled(d, -bracketWidth);

    a0 = render.obj2scaled(a0);
    a1 = render.obj2scaled(a1);
    b0 = render.obj2scaled(b0);
    b1 = render.obj2scaled(b1);
    a02 = render.obj2scaled(a02);
    a12 = render.obj2scaled(a12);
    b02 = render.obj2scaled(b02);
    b12 = render.obj2scaled(b12);

    var leftBracket = paper.path("M{0},{1}L{2},{3}L{4},{5}L{6},{7}",
        a02.x, a02.y, a0.x, a0.y, a1.x, a1.y, a12.x, a12.y)
        .attr(styles.sgroupBracketStyle);

    var rightBracket = paper.path("M{0},{1}L{2},{3}L{4},{5}L{6},{7}",
        b02.x, b02.y, b0.x, b0.y, b1.x, b1.y, b12.x, b12.y)
        .attr(styles.sgroupBracketStyle);
    set.push(leftBracket, rightBracket);
};

chem.SGroup.getObjBBox = function (atoms, mol)
{
	if (atoms.length == 0)
		throw new Error("Atom list is empty");

	var a0 = mol.atoms.get(atoms[0]).pp;
	var bb = new util.Box2Abs(a0, a0);
	for (var i = 1; i < atoms.length; ++i) {
		var aid = atoms[i];
		var atom = mol.atoms.get(aid);
		var p = atom.pp;
		bb = bb.include(p);
	}
	return bb;
};

chem.SGroup.getBBox = function (atoms, remol) {
	var bb = null;
	var render = remol.render;
	var settings = render.settings;
	for (var i = 0; i < atoms.length; ++i) {
		var aid = atoms[i];
		var atom = remol.atoms.get(aid);
		var bba = atom.visel.boundingBox;
		if (bba == null) {
			var p = atom.a.pp;
			bba = new util.Box2Abs(p,p);
			var ext = new util.Vec2(0.15, 0.15);
			bba = bba.extend(ext, ext);
		}
		bb = (bb == null) ? bba : util.Box2Abs.union(bb, bba);
	}
	return bb;
};

chem.SGroup.makeAtomBondLines = function (prefix, idstr, ids, map) {
	if (!ids)
		return [];
	var lines = [];
	for (var i = 0; i < Math.floor((ids.length + 14) / 15); ++i) {
		var rem = Math.min(ids.length - 15 * i, 15);
		var salLine = 'M  ' + prefix + ' ' + idstr + ' ' + util.paddedInt(rem, 2);
		for (var j = 0; j < rem; ++j) {
			salLine += ' ' + util.paddedInt(map[ids[i * 15 + j]], 3);
		}
		lines.push(salLine);
	}
	return lines;
};

chem.SGroup.getAtoms = function (mol, sg) {
	if (!sg.allAtoms)
		return sg.atoms;
	var atoms = [];
	mol.atoms.each(function(aid){
		atoms.push(aid);
	});
	return atoms;
};

chem.SGroup.GroupMul = {
	draw: function (remol) {
		var render = remol.render;
		var settings = render.settings;
		var styles = render.styles;
		var paper = render.paper;
		var set = paper.set();
        var inBonds = [], xBonds = [];
        chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, util.Set.fromList(this.atoms));
        chem.SGroup.bracketPos(this, remol, xBonds);
        var bb = this.bracketBox;
        var d = this.bracketDir, n = d.rotateSC(1, 0);
        this.areas = [bb];
	chem.SGroup.drawBrackets(set, render, paper, settings, styles, bb, d, n);
        var idxOffset = 0.25;
        var idxPos = util.Vec2.lc(d, d.x < 0 ? bb.p0.x - idxOffset : bb.p1.x + idxOffset,
            n, d.x < 0 ? bb.p0.y : bb.p1.y);
        idxPos = render.obj2scaled(idxPos);
        var multIndex = paper.text(idxPos.x, idxPos.y, this.data.mul)
		.attr({
			'font' : settings.font,
			'font-size' : settings.fontszsub
		});
		var multIndexBox = rnd.relBox(multIndex.getBBox());
		multIndex.translate(0.5 * multIndexBox.width, -0.3 * multIndexBox.height);
		set.push(multIndex);
		return set;
	},

	saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
		var idstr = util.stringPadded(sgMap[this.id], 3);

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, util.idList(this.atomSet), atomMap)); // TODO: check atomSet
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SPA', idstr, util.idList(this.parentAtomSet), atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		var smtLine = 'M  SMT ' + idstr + ' ' + this.data.mul;
		lines.push(smtLine);
		lines = lines.concat(chem.SGroup.bracketsToMolfile(mol, this, idstr));
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
		var i,j;
		this.atomSet = util.Set.fromList(this.atoms);
        this.parentAtomSet = util.Set.clone(this.atomSet);
		var inBonds = [];
		var xBonds = [];

		mol.bonds.each(function(bid, bond){
			if (util.Set.contains(this.parentAtomSet, bond.begin) && util.Set.contains(this.parentAtomSet, bond.end))
				inBonds.push(bid);
			else if (util.Set.contains(this.parentAtomSet, bond.begin) || util.Set.contains(this.parentAtomSet,bond.end))
				xBonds.push(bid);
		}, this);
		if (xBonds.length != 0 && xBonds.length != 2)
			throw {'id':this.id, 'error-type':'cross-bond-number', 'message':"Unsupported cross-bonds number"};

		var xAtom1 = -1,
		xAtom2 = -1;
		var crossBond = null;
		if (xBonds.length == 2) {
			var bond1 = mol.bonds.get(xBonds[0]);
			if (util.Set.contains(this.parentAtomSet, bond1.begin)) {
				xAtom1 = bond1.begin;
			} else {
				xAtom1 = bond1.end;
			}
			var bond2 = mol.bonds.get(xBonds[1]);
			if (util.Set.contains(this.parentAtomSet, bond2.begin)) {
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
				var aid2 = mol.atoms.add(new chem.Struct.Atom(atom));
				this.atomSet[aid2] = 1;
				amap[aid] = aid2;
			}
			for (i = 0; i < inBonds.length; ++i) {
				var bond = mol.bonds.get(inBonds[i]);
				var newBond = new chem.Struct.Bond(bond);
				newBond.begin = amap[newBond.begin];
				newBond.end = amap[newBond.end];
				mol.bonds.add(newBond);
			}
			if (crossBond != null) {
				var newCrossBond = new chem.Struct.Bond(crossBond);
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

	postLoad: function (mol, atomMap)
	{
		this.data.mul = this.data.subscript - 0;
		var atomReductionMap = {};

		this.atoms = chem.SGroup.filterAtoms(this.atoms, atomMap);
		this.patoms = chem.SGroup.filterAtoms(this.patoms, atomMap);

		// mark repetitions for removal
		for (var k = 1; k < this.data.mul; ++k) {
			for (var m = 0; m < this.patoms.length; ++m) {
				var raid = this.atoms[k * this.patoms.length + m];
				if (raid < 0)
					continue;
				if (this.patoms[m] < 0) {
					throw new Error("parent atom missing");
				}
//				mol.atoms.get(raid).pp.y -= 3*k; // for debugging purposes
				atomReductionMap[raid] = this.patoms[m]; // "merge" atom in parent
			}
		}
		this.patoms = chem.SGroup.removeNegative(this.patoms);

		var patomsMap = util.identityMap(this.patoms);

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
			atomMap[a] = -1;
		}
		this.atoms = this.patoms;
		this.patoms = null;
	}
};

chem.SGroup.GroupSru = {
	draw: function (remol) {
		var render = remol.render;
		var settings = render.settings;
		var styles = render.styles;
		var paper = render.paper;
		var set = paper.set();
        var inBonds = [], xBonds = [];
        chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, util.Set.fromList(this.atoms));
        chem.SGroup.bracketPos(this, remol, xBonds);
        var bb = this.bracketBox;
        var d = this.bracketDir, n = d.rotateSC(1, 0);
        this.areas = [bb];
        chem.SGroup.drawBrackets(set, render, paper, settings, styles, bb, d, n);
		var connectivity = this.data.connectivity || 'eu';
        var idxOffset = 0.25;
		if (connectivity != 'ht') {
            var idxPos = util.Vec2.lc(d, d.x < 0 ? bb.p0.x - idxOffset : bb.p1.x + idxOffset,
                n, d.x >= 0 ? bb.p0.y : bb.p1.y);
            idxPos = render.obj2scaled(idxPos);
			var connectivityIndex = paper.text(idxPos.x, idxPos.y, connectivity)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontszsub
			});
			set.push(connectivityIndex);
		}
		this.data.subscript = this.data.subscript || 'n';
        idxPos = util.Vec2.lc(d, d.x < 0 ? bb.p0.x - idxOffset : bb.p1.x + idxOffset,
            n, d.x < 0 ? bb.p0.y : bb.p1.y);
        idxPos = render.obj2scaled(idxPos);
		var subscript = paper.text(idxPos.x, idxPos.y, this.data.subscript)
		.attr({
			'font' : settings.font,
			'font-size' : settings.fontszsub
		});
		set.push(subscript);
		return set;
	},

	saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
		var idstr = util.stringPadded(sgMap[this.id], 3);

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		lines = lines.concat(chem.SGroup.bracketsToMolfile(mol, this, idstr));
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
		var xBonds = [];
		mol.bonds.each(function(bid, bond){
			var a1 = mol.atoms.get(bond.begin);
			var a2 = mol.atoms.get(bond.end);
			if (util.Set.contains(a1.sgs, this.id) && !util.Set.contains(a2.sgs, this.id) ||
				util.Set.contains(a2.sgs, this.id) && !util.Set.contains(a1.sgs, this.id))
				xBonds.push(bid);
		},this);
		this.bonds = xBonds;
	},

	postLoad: function (mol, atomMap) {
		this.data.connectivity = (this.data.connectivity || 'EU').strip().toLowerCase();
	}
};

chem.SGroup.GroupSup = {
	draw: function (remol) {
		var render = remol.render;
		var settings = render.settings;
		var styles = render.styles;
		var paper = render.paper;
		var set = paper.set();
        var inBonds = [], xBonds = [];
        chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, util.Set.fromList(this.atoms));
        chem.SGroup.bracketPos(this, remol, xBonds);
        var bb = this.bracketBox;
        var d = this.bracketDir, n = d.rotateSC(1, 0);
        this.areas = [bb];
        chem.SGroup.drawBrackets(set, render, paper, settings, styles, bb, d, n);
		if (this.data.name) {
            var idxOffset = 0.25;
            var idxPos = util.Vec2.lc(d, d.x < 0 ? bb.p0.x - idxOffset : bb.p1.x + idxOffset,
                n, d.x < 0 ? bb.p0.y : bb.p1.y);
            idxPos = render.obj2scaled(idxPos);
			var name = paper.text(idxPos.x, idxPos.y, this.data.name)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontszsub,
				'font-style' : 'italic'
			});
			var nameBox = rnd.relBox(name.getBBox());
			name.translate(0.5 * nameBox.width * d.x, 0);
			set.push(name);
		}
		return set;
	},

	saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
		var idstr = util.stringPadded(sgMap[this.id], 3);

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		if (this.data.name && this.data.name != '')
			lines.push('M  SMT ' + idstr + ' ' + this.data.name);
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
		// This code is also used for GroupSru and should be moved into a separate common method
		// It seems that such code should be used for any sgroup by this this should be checked
		var xBonds = [];
		mol.bonds.each(function(bid, bond){
			var a1 = mol.atoms.get(bond.begin);
			var a2 = mol.atoms.get(bond.end);
			if (util.Set.contains(a1.sgs, this.id) && !util.Set.contains(a2.sgs, this.id) ||
				util.Set.contains(a2.sgs, this.id) && !util.Set.contains(a1.sgs, this.id))
				xBonds.push(bid);
		},this);
		this.bonds = xBonds;
	},

	postLoad: function (mol, atomMap) {
		this.data.name = (this.data.subscript || '').strip();
	}
};

chem.SGroup.GroupGen = {
	draw: function (remol) {
		var render = remol.render;
		var settings = render.settings;
		var styles = render.styles;
		var paper = render.paper;
		var set = paper.set();
        var inBonds = [], xBonds = [];
        chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, util.Set.fromList(this.atoms));
        chem.SGroup.bracketPos(this, remol, xBonds);
        var bb = this.bracketBox;
        var d = this.bracketDir, n = d.rotateSC(1, 0);
        this.areas = [bb];
        chem.SGroup.drawBrackets(set, render, paper, settings, styles, bb, d, n);
		return set;
	},

	saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
		var idstr = util.stringPadded(sgMap[this.id], 3);

		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SBL', idstr, this.bonds, bondMap));
		lines = lines.concat(chem.SGroup.bracketsToMolfile(mol, this, idstr));
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
	},

	postLoad: function (mol, atomMap) {
	}
};

chem.SGroup.getMassCentre = function (mol, atoms) {
	var c = new util.Vec2(); // mass centre
	for (var i = 0; i < atoms.length; ++i) {
		c = c.addScaled(mol.atoms.get(atoms[i]).pp, 1.0 / atoms.length);
	}
	return c;
};

chem.SGroup.setPos = function (remol, sg, pos) {
	sg.pp = pos;
};

chem.SGroup.GroupDat = {
	showValue: function (paper, pos, sg, settings) {
		var name = paper.text(pos.x, pos.y, sg.data.fieldValue)
		.attr({
			'font' : settings.font,
			'font-size' : settings.fontsz
		});
		return name;
	},

	draw: function (remol) {
		var render = remol.render;
		var settings = render.settings;
		var paper = render.paper;
		var set = paper.set();
		var absolute = this.data.absolute || this.allAtoms;
		var atoms = chem.SGroup.getAtoms(remol, this);
		var i;
        var inBonds = [], xBonds = [];
        chem.SGroup.getCrossBonds(inBonds, xBonds, remol.molecule, util.Set.fromList(this.atoms));
        chem.SGroup.bracketPos(this, remol, xBonds);
        this.areas = [this.bracketBox];
		if (this.pp == null) {
			chem.SGroup.setPos(remol, this, this.bracketBox.p1.add(new util.Vec2(0.5, 0.5)));
		}
        var ps = this.pp.scaled(settings.scaleFactor);

        if (this.data.attached) {
                for (i = 0; i < atoms.length; ++i) {
                var atom = remol.atoms.get(atoms[i]);
                var p = render.ps(atom.a.pp);
                var bb = atom.visel.boundingBox;
                if (bb != null) {
                    p.x = Math.max(p.x, bb.p1.x);
                }
                p.x += settings.lineWidth; // shift a bit to the right
                var name_i = this.showValue(paper, p, this, settings);
                var box_i = rnd.relBox(name_i.getBBox());
                name_i.translate(0.5 * box_i.width, -0.3 * box_i.height);
                set.push(name_i);
                var sbox_i = util.Box2Abs.fromRelBox(rnd.relBox(name_i.getBBox()));
                this.areas.push(sbox_i.transform(render.scaled2obj, render));
            }
        } else {
            var name = this.showValue(paper, ps, this, settings);
            var box = rnd.relBox(name.getBBox());
            name.translate(0.5 * box.width, -0.5 * box.height);
            set.push(name);
            var sbox = util.Box2Abs.fromRelBox(rnd.relBox(name.getBBox()));
            this.dataArea = sbox.transform(render.scaled2obj, render);
            if (!remol.sgroupData.has(this.id))
                remol.sgroupData.set(this.id, new rnd.ReDataSGroupData(this));
        }
        return set;
	},

	saveToMolfile: function (mol, sgMap, atomMap, bondMap) {
		var idstr = util.stringPadded(sgMap[this.id], 3);

		var data = this.data;
		var pp = this.pp;
        if (!data.absolute)
            pp = pp.sub(chem.SGroup.getMassCentre(mol, this.atoms));
		var lines = [];
		lines = lines.concat(chem.SGroup.makeAtomBondLines('SAL', idstr, this.atoms, atomMap));
		var sdtLine = 'M  SDT ' + idstr +
		' ' + util.stringPadded(data.fieldName, 30, true) +
		util.stringPadded(data.fieldType, 2) +
		util.stringPadded(data.units, 20, true) +
		util.stringPadded(data.query, 2) +
		util.stringPadded(data.queryOp, 3);
		lines.push(sdtLine);
		var sddLine = 'M  SDD ' + idstr +
		' ' + util.paddedFloat(pp.x, 10, 4) + util.paddedFloat(-pp.y, 10, 4) +
		'    ' + // ' eee'
		(data.attached ? 'A' : 'D') + // f
		(data.absolute ? 'A' : 'R') + // g
		(data.showUnits ? 'U' : ' ') + // h
		'   ' + //  i
		(data.nCharnCharsToDisplay >= 0 ? util.paddedInt(data.nCharnCharsToDisplay, 3) : 'ALL') + // jjj
		'  1   ' + // 'kkk ll '
		util.stringPadded(data.tagChar, 1) + // m
		'  ' + util.paddedInt(data.daspPos, 1) + // n
		'  '; // oo
		lines.push(sddLine);
		var str = data.fieldValue;
		var charsPerLine = 69;
		while (str.length > charsPerLine) {
			lines.push('M  SCD ' + idstr + ' ' + str.slice(0, charsPerLine));
			str = str.slice(69);
		}
		lines.push('M  SED ' + idstr + ' ' + util.stringPadded(str, charsPerLine, true));
		return lines.join('\n');
	},

	prepareForSaving: function (mol) {
		this.atoms = chem.SGroup.getAtoms(mol, this);
	},

	postLoad: function (mol, atomMap) {
		var allAtomsInGroup = this.atoms.length == mol.atoms.count();
        if (!this.data.absolute)
            this.pp = this.pp.add(chem.SGroup.getMassCentre(mol, this.atoms));
		if (allAtomsInGroup &&
			(	this.data.fieldName == 'MDLBG_FRAGMENT_STEREO' ||
				this.data.fieldName == 'MDLBG_FRAGMENT_COEFFICIENT' ||
				this.data.fieldName == 'MDLBG_FRAGMENT_CHARGE')) {
			this.atoms = [];
			this.allAtoms = true;
		}
	}
};

chem.SGroup.TYPES = {
	'MUL': chem.SGroup.GroupMul,
	'SRU': chem.SGroup.GroupSru,
	'SUP': chem.SGroup.GroupSup,
	'DAT': chem.SGroup.GroupDat,
	'GEN': chem.SGroup.GroupGen
};
