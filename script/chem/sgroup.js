var Box2Abs = require('../util/box2abs');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');

var Atom = require('./atom');
var Bond = require('./bond');

var SGroup = function (type) {
	if (!type || !(type in SGroup.TYPES))
		throw new Error('Invalid or unsupported s-group type');

	this.type = type;
	this.id = -1;
	this.label = -1;
	this.bracketBox = null;
	this.bracketDir = new Vec2(1,0);
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
		'name': '',
		'subscript': 'n',

		// data s-group fields
		'attached': false,
		'absolute': true,
		'showUnits': false,
		'nCharsToDisplay': -1,
		'tagChar': '',
		'daspPos': 1,
		'fieldType': 'F',
		'fieldName': '',
		'fieldValue': '',
		'units': '',
		'query': '',
		'queryOp': ''
	}
};

SGroup.TYPES = {
	'MUL': 1,
	'SRU': 2,
	'SUP': 3,
	'DAT': 4,
	'GEN': 5
};

// TODO: these methods should be overridden
//      and should only accept valid attributes for each S-group type.
//      The attributes should be accessed via these methods only and not directly through this.data.
// stub
SGroup.prototype.getAttr = function (attr) {
	return this.data[attr];
};

// TODO: should be group-specific
SGroup.prototype.getAttrs = function () {
	var attrs = {};
	for (var attr in this.data)
		attrs[attr] = this.data[attr];
	return attrs;
};

// stub
SGroup.prototype.setAttr = function (attr, value) {
	var oldValue = this.data[attr];
	this.data[attr] = value;
	return oldValue;
};

// stub
SGroup.prototype.checkAttr = function (attr, value) {
	return this.data[attr] == value;
};

SGroup.numberArrayToString = function (numbers, map) {
	var str = util.stringPadded(numbers.length, 3);
	for (var i = 0; i < numbers.length; ++i) {
		str += ' ' + util.stringPadded(map[numbers[i]], 3);
	}
	return str;
};

SGroup.addGroup = function (mol, sg, atomMap)
{
	// add the group to the molecule
	sg.id = mol.sgroups.add(sg);

	// apply type-specific post-processing
	postLoad[sg.type](sg, mol, atomMap);
	// mark atoms in the group as belonging to it
	for (var s = 0; s < sg.atoms.length; ++s)
		if (mol.atoms.has(sg.atoms[s]))
			Set.add(mol.atoms.get(sg.atoms[s]).sgs, sg.id);

	mol.sGroupForest.insert(sg.id);
	return sg.id;
};

SGroup.filterAtoms = function (atoms, map) {
	var newAtoms = [];
	for (var i = 0; i < atoms.length; ++i) {
		var aid = atoms[i];
		if (typeof(map[aid]) != 'number') {
			newAtoms.push(aid);
		} else if (map[aid] >= 0) {
			newAtoms.push(map[aid]);
		} else {
			newAtoms.push(-1);
		}
	}
	return newAtoms;
};

SGroup.removeNegative = function (atoms) {
	var newAtoms = [];
	for (var j = 0; j < atoms.length; ++j)
		if (atoms[j] >= 0)
			newAtoms.push(atoms[j]);
	return newAtoms;
};

SGroup.filter = function (mol, sg, atomMap)
{
	sg.atoms = SGroup.removeNegative(SGroup.filterAtoms(sg.atoms, atomMap));
};

SGroup.clone = function (sgroup, aidMap, bidMap)
{
	var cp = new SGroup(sgroup.type);

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

SGroup.addAtom = function (sgroup, aid)
{
	sgroup.atoms.push(aid);
};

SGroup.removeAtom = function (sgroup, aid)
{
	for (var i = 0; i < sgroup.atoms.length; ++i) {
		if (sgroup.atoms[i] === aid) {
			sgroup.atoms.splice(i, 1);
			return;
		}
	}
	throw new Error('The atom is not found in the given s-group');
};

SGroup.getCrossBonds = function (inBonds, xBonds, mol, parentAtomSet) {
	mol.bonds.each(function (bid, bond){
		if (Set.contains(parentAtomSet, bond.begin) && Set.contains(parentAtomSet, bond.end)) {
			if (!util.isNull(inBonds))
				inBonds.push(bid);
		} else if (Set.contains(parentAtomSet, bond.begin) || Set.contains(parentAtomSet, bond.end)) {
			if (!util.isNull(xBonds))
				xBonds.push(bid);
		}
	}, this);
};

SGroup.bracketPos = function (sg, render, mol, xbonds) {
	var atoms = sg.atoms;
	if (!xbonds || xbonds.length !== 2) {
		sg.bracketDir = new Vec2(1, 0);
	} else {
		var b1 = mol.bonds.get(xbonds[0]), b2 = mol.bonds.get(xbonds[1]);
		var p1 = b1.getCenter(mol), p2 = b2.getCenter(mol);
		sg.bracketDir = Vec2.diff(p2, p1).normalized();
	}
	var d = sg.bracketDir;
	var n = d.rotateSC(1, 0);

	var bb = null;
	var contentBoxes = [];
	util.each(atoms, function (aid) {
		var atom = mol.atoms.get(aid);
		var bba = render ? render.ctab.atoms.get(aid).visel.boundingBox : null;
		var pos = new Vec2(atom.pp);
		if (util.isNull(bba)) {
			bba = new Box2Abs(pos, pos);
			var ext = new Vec2(0.05 * 3, 0.05 * 3);
			bba = bba.extend(ext, ext);
		} else {
			bba = bba.translate((render.offset || new Vec2()).negated()).transform(render.scaled2obj, render);
		}
		contentBoxes.push(bba);
	}, this);
	util.each(mol.sGroupForest.children.get(sg.id), function (sgid) {
		var bba = render ? render.ctab.sgroups.get(sgid).visel.boundingBox : null;
		if (util.isNull(bba))
			return; // TODO: use object box instead
		bba = bba.translate((render.offset || new Vec2()).negated()).transform(render.scaled2obj, render);
		contentBoxes.push(bba);
	}, this);
	util.each(contentBoxes, function (bba) {
		var bbb = null;
		util.each([bba.p0.x, bba.p1.x], function (x) {
			util.each([bba.p0.y, bba.p1.y], function (y) {
				var v = new Vec2(x, y);
				var p = new Vec2(Vec2.dot(v, d), Vec2.dot(v, n));
				bbb = util.isNull(bbb) ? new Box2Abs(p, p) : bbb.include(p);
			}, this);
		}, this);
		bb = util.isNull(bb) ? bbb : Box2Abs.union(bb, bbb);
	}, this);
	var vext = new Vec2(0.2, 0.4);
	if (!util.isNull(bb))
		bb = bb.extend(vext, vext);
	sg.bracketBox = bb;
};

SGroup.getBracketParameters = function (mol, xbonds, atomSet, bb, d, n, render, id) {
	var bracketParams = function (c, d, w, h) {
		this.c = c;
		this.d = d;
		this.n = d.rotateSC(1,0);
		this.w = w;
		this.h = h;
	};
	var brackets = [];
	if (xbonds.length < 2) {
		(function () {
			d = d || new Vec2(1, 0);
			n = n || d.rotateSC(1, 0);
			var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
			var cl = Vec2.lc2(d, bb.p0.x, n, 0.5 * (bb.p0.y + bb.p1.y));
			var cr = Vec2.lc2(d, bb.p1.x, n, 0.5 * (bb.p0.y + bb.p1.y));
			var bracketHeight = bb.sz().y;

			brackets.push(new bracketParams(cl, d.negated(), bracketWidth, bracketHeight), new bracketParams(cr, d, bracketWidth, bracketHeight));
		})();
	} else if (xbonds.length === 2) {
		(function () {
			var b1 = mol.bonds.get(xbonds[0]), b2 = mol.bonds.get(xbonds[1]);
			var cl0 = b1.getCenter(mol), cr0 = b2.getCenter(mol), tl = -1, tr = -1, tt = -1, tb = -1, cc = Vec2.centre(cl0, cr0);
			var dr = Vec2.diff(cr0, cl0).normalized(), dl = dr.negated(), dt = dr.rotateSC(1,0), db = dt.negated();

			util.each(mol.sGroupForest.children.get(id), function (sgid) {
				var bba = render ? render.ctab.sgroups.get(sgid).visel.boundingBox : null;
				if (util.isNull(bba))
					return; // TODO: use object box instead
				bba = bba.translate((render.offset || new Vec2()).negated()).transform(render.scaled2obj, render);
				tl = Math.max(tl, Vec2.shiftRayBox(cl0, dl, bba));
				tr = Math.max(tr, Vec2.shiftRayBox(cr0, dr, bba));
				tt = Math.max(tt, Vec2.shiftRayBox(cc, dt, bba));
				tb = Math.max(tb, Vec2.shiftRayBox(cc, db, bba));
			}, this);
			tl = Math.max(tl + 0.2, 0);
			tr = Math.max(tr + 0.2, 0);
			tt = Math.max(Math.max(tt, tb) + 0.1, 0);
			var bracketWidth = 0.25, bracketHeight = 1.5 + tt;
			brackets.push(new bracketParams(cl0.addScaled(dl, tl), dl, bracketWidth, bracketHeight),
			new bracketParams(cr0.addScaled(dr, tr), dr, bracketWidth, bracketHeight));
		})();

	} else {
		(function () {
			for (var i = 0; i < xbonds.length; ++i) {
				var b = mol.bonds.get(xbonds[i]);
				var c = b.getCenter(mol);
				var d = Set.contains(atomSet, b.begin) ? b.getDir(mol) : b.getDir(mol).negated();
				brackets.push(new bracketParams(c, d, 0.2, 1.0));
			}
		})();
	}
	return brackets;
};

SGroup.getObjBBox = function (atoms, mol)
{
	if (atoms.length == 0)
		throw new Error('Atom list is empty');

	var a0 = mol.atoms.get(atoms[0]).pp;
	var bb = new Box2Abs(a0, a0);
	for (var i = 1; i < atoms.length; ++i) {
		var aid = atoms[i];
		var atom = mol.atoms.get(aid);
		var p = atom.pp;
		bb = bb.include(p);
	}
	return bb;
};

SGroup.getAtoms = function (mol, sg) {
	/* shoud we use prototype? */
	if (!sg.allAtoms)
		return sg.atoms;
	var atoms = [];
	mol.atoms.each(function (aid){
		atoms.push(aid);
	});
	return atoms;
};

SGroup.getBonds = function (mol, sg) {
	var atoms = SGroup.getAtoms(mol, sg);
	var bonds = [];
	mol.bonds.each(function (bid, bond){
		if (atoms.indexOf(bond.begin) >= 0 && atoms.indexOf(bond.end) >= 0) bonds.push(bid);
	});
	return bonds;
};

SGroup.prepareMulForSaving = function (sgroup, mol) {
	var j;
	sgroup.atoms.sort();
	sgroup.atomSet = Set.fromList(sgroup.atoms);
	sgroup.parentAtomSet = Set.clone(sgroup.atomSet);
	var inBonds = [];
	var xBonds = [];
	
	mol.bonds.each(function (bid, bond) {
		if (Set.contains(sgroup.parentAtomSet, bond.begin) && Set.contains(sgroup.parentAtomSet, bond.end))
			inBonds.push(bid);
		else if (Set.contains(sgroup.parentAtomSet, bond.begin) || Set.contains(sgroup.parentAtomSet, bond.end))
			xBonds.push(bid);
	}, sgroup);
	if (xBonds.length != 0 && xBonds.length != 2)
		throw {
			'id': sgroup.id,
			'error-type': 'cross-bond-number',
			'message': 'Unsupported cross-bonds number'
		};
	
	var xAtom1 = -1,
		xAtom2 = -1;
	var crossBond = null;
	if (xBonds.length == 2) {
		var bond1 = mol.bonds.get(xBonds[0]);
		if (Set.contains(sgroup.parentAtomSet, bond1.begin)) {
			xAtom1 = bond1.begin;
		} else {
			xAtom1 = bond1.end;
		}
		var bond2 = mol.bonds.get(xBonds[1]);
		if (Set.contains(sgroup.parentAtomSet, bond2.begin)) {
			xAtom2 = bond2.begin;
		} else {
			xAtom2 = bond2.end;
		}
		crossBond = bond2;
	}
	
	var amap = null;
	var tailAtom = xAtom1;
	
	var newAtoms = [];
	for (j = 0; j < sgroup.data.mul - 1; ++j) {
		amap = {};
		util.each(sgroup.atoms, function (aid) {
			var atom = mol.atoms.get(aid);
			var aid2 = mol.atoms.add(new Atom(atom));
			newAtoms.push(aid2);
			sgroup.atomSet[aid2] = 1;
			amap[aid] = aid2;
		}, sgroup);
		util.each(inBonds, function (bid) {
			var bond = mol.bonds.get(bid);
			var newBond = new Bond(bond);
			newBond.begin = amap[newBond.begin];
			newBond.end = amap[newBond.end];
			mol.bonds.add(newBond);
		}, sgroup);
		if (crossBond != null) {
			var newCrossBond = new Bond(crossBond);
			newCrossBond.begin = tailAtom;
			newCrossBond.end = amap[xAtom2];
			mol.bonds.add(newCrossBond);
			tailAtom = amap[xAtom1];
		}
	}
	
	util.each(newAtoms, function (aid) {
		util.each(mol.sGroupForest.getPathToRoot(sgroup.id).reverse(), function (sgid) {
			mol.atomAddToSGroup(sgid, aid);
		}, sgroup);
	}, sgroup);
	if (tailAtom >= 0) {
		var xBond2 = mol.bonds.get(xBonds[0]);
		if (xBond2.begin == xAtom1)
			xBond2.begin = tailAtom;
		else
			xBond2.end = tailAtom;
	}
	
	sgroup.bonds = xBonds;
};

var postLoadMul = function (sgroup, mol, atomMap) {
	sgroup.data.mul = sgroup.data.subscript - 0;
	var atomReductionMap = {};
	
	sgroup.atoms = SGroup.filterAtoms(sgroup.atoms, atomMap);
	sgroup.patoms = SGroup.filterAtoms(sgroup.patoms, atomMap);
	
	// mark repetitions for removal
	for (var k = 1; k < sgroup.data.mul; ++k) {
		for (var m = 0; m < sgroup.patoms.length; ++m) {
			var raid = sgroup.atoms[k * sgroup.patoms.length + m];
			if (raid < 0)
				continue;
			if (sgroup.patoms[m] < 0) {
				throw new Error('parent atom missing');
			}
			//                mol.atoms.get(raid).pp.y -= 3*k; // for debugging purposes
			atomReductionMap[raid] = sgroup.patoms[m]; // "merge" atom in parent
		}
	}
	sgroup.patoms = SGroup.removeNegative(sgroup.patoms);
	
	var patomsMap = util.identityMap(sgroup.patoms);
	
	var bondsToRemove = [];
	mol.bonds.each(function (bid, bond) {
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
	}, sgroup);
	
	// apply removal lists
	for (var b = 0; b < bondsToRemove.length; ++b) {
		mol.bonds.remove(bondsToRemove[b]);
	}
	for (var a in atomReductionMap) {
		mol.atoms.remove(a);
		atomMap[a] = -1;
	}
	sgroup.atoms = sgroup.patoms;
	sgroup.patoms = null;
};


var postLoadSru = function (sgroup, mol, atomMap) {
	sgroup.data.connectivity = (sgroup.data.connectivity || 'EU').strip().toLowerCase();
};

var postLoadSup = function (sgroup, mol, atomMap) {
	sgroup.data.name = (sgroup.data.subscript || '').strip();
	sgroup.data.subscript = '';
};

var postLoadGen = function (sgroup, mol, atomMap) {
};

var postLoadDat = function (sgroup, mol, atomMap) {
	if (!sgroup.data.absolute)
		sgroup.pp = sgroup.pp.add(SGroup.getMassCentre(mol, sgroup.atoms));
		// [NK] Temporary comment incoplete 'allAtoms' behavior
		// TODO: need ether remove 'allAtoms' flag or hadle it
		// consistently (other flags: *_KEY, *_RADICAL?)
		// var allAtomsInGroup = this.atoms.length == mol.atoms.count();
		// if (allAtomsInGroup &&
		//     (this.data.fieldName == 'MDLBG_FRAGMENT_STEREO' ||
		//      this.data.fieldName == 'MDLBG_FRAGMENT_COEFFICIENT' ||
		//      this.data.fieldName == 'MDLBG_FRAGMENT_CHARGE')) {
		// 	this.atoms = [];
		// 	this.allAtoms = true;
		// }
};

var postLoad = {
	'MUL': postLoadMul,
	'SRU': postLoadSru,
	'SUP': postLoadSup,
	'DAT': postLoadDat,
	'GEN': postLoadGen
};


SGroup.getMassCentre = function (mol, atoms) {
	var c = new Vec2(); // mass centre
	for (var i = 0; i < atoms.length; ++i) {
		c = c.addScaled(mol.atoms.get(atoms[i]).pp, 1.0 / atoms.length);
	}
	return c;
};

SGroup.setPos = function (remol, sg, pos) {
	sg.pp = pos;
};

module.exports = SGroup;