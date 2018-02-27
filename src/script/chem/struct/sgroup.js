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

import Atom from './atom';
import Bond from './bond';

function SGroup(type) { // eslint-disable-line max-statements
	console.assert(type && type in SGroup.TYPES, 'Invalid or unsupported s-group type');

	this.type = type;
	this.id = -1;
	this.label = -1;
	this.bracketBox = null;
	this.bracketDir = new Vec2(1, 0);
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
		mul: 1, // multiplication count for MUL group
		connectivity: 'ht', // head-to-head, head-to-tail or either-unknown
		name: '',
		subscript: 'n',

		// data s-group fields
		attached: false,
		absolute: true,
		showUnits: false,
		nCharsToDisplay: -1,
		tagChar: '',
		daspPos: 1,
		fieldType: 'F',
		fieldName: '',
		fieldValue: '',
		units: '',
		query: '',
		queryOp: ''
	};
}

SGroup.TYPES = {
	MUL: 1,
	SRU: 2,
	SUP: 3,
	DAT: 4,
	GEN: 5
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
	Object.keys(this.data).forEach((attr) => {
		attrs[attr] = this.data[attr];
	});
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

// SGroup.numberArrayToString = function (numbers, map) {
// 	var str = util.stringPadded(numbers.length, 3);
// 	for (var i = 0; i < numbers.length; ++i) {
// 		str += ' ' + util.stringPadded(map[numbers[i]], 3);
// 	}
// 	return str;
// };

SGroup.filterAtoms = function (atoms, map) {
	var newAtoms = [];
	for (var i = 0; i < atoms.length; ++i) {
		var aid = atoms[i];
		if (typeof (map[aid]) !== 'number')
			newAtoms.push(aid);
		else if (map[aid] >= 0)
			newAtoms.push(map[aid]);
		else
			newAtoms.push(-1);
	}
	return newAtoms;
};

SGroup.removeNegative = function (atoms) {
	var newAtoms = [];
	for (var j = 0; j < atoms.length; ++j) {
		if (atoms[j] >= 0)
			newAtoms.push(atoms[j]);
	}
	return newAtoms;
};

SGroup.filter = function (mol, sg, atomMap) {
	sg.atoms = SGroup.removeNegative(SGroup.filterAtoms(sg.atoms, atomMap));
};

/**
 * @param sgroup
 * @param aidMap < Map<number, number> }
 * @returns { SGroup }
 */
SGroup.clone = function (sgroup, aidMap) {
	const cp = new SGroup(sgroup.type);

	Object.keys(sgroup.data).forEach((field) => {
		cp.data[field] = sgroup.data[field];
	});

	cp.atoms = sgroup.atoms.map(elem => aidMap.get(elem));
	cp.pp = sgroup.pp;
	cp.bracketBox = sgroup.bracketBox;
	cp.patoms = null;
	cp.bonds = null;
	cp.allAtoms = sgroup.allAtoms;
	return cp;
};

SGroup.addAtom = function (sgroup, aid) {
	sgroup.atoms.push(aid);
};

SGroup.removeAtom = function (sgroup, aid) {
	for (var i = 0; i < sgroup.atoms.length; ++i) {
		if (sgroup.atoms[i] === aid) {
			sgroup.atoms.splice(i, 1);
			return;
		}
	}
	console.error('The atom is not found in the given s-group');
};

/**
 * @param inBonds
 * @param xBonds
 * @param mol
 * @param parentAtomSet { Pile<number> }
 */
SGroup.getCrossBonds = function (inBonds, xBonds, mol, parentAtomSet) {
	mol.bonds.forEach((bond, bid) => {
		if (parentAtomSet.has(bond.begin) && parentAtomSet.has(bond.end)) {
			if (inBonds !== null)
				inBonds.push(bid);
		} else if (parentAtomSet.has(bond.begin) || parentAtomSet.has(bond.end)) {
			if (xBonds !== null)
				xBonds.push(bid);
		}
	});
};

SGroup.bracketPos = function (sg, mol, xbonds) { // eslint-disable-line max-statements
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
		var pos = new Vec2(atom.pp);
		var ext = new Vec2(0.05 * 3, 0.05 * 3);
		var bba = new Box2Abs(pos, pos).extend(ext, ext);
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
};

/**
 * @param mol
 * @param xbonds
 * @param atomSet { Pile<number> }
 * @param bb
 * @param d
 * @param n
 * @returns { Array }
 */
SGroup.getBracketParameters = function (mol, xbonds, atomSet, bb, d, n) { // eslint-disable-line max-params
	function BracketParams(c, d, w, h) {
		this.c = c;
		this.d = d;
		this.n = d.rotateSC(1, 0);
		this.w = w;
		this.h = h;
	}
	var brackets = [];
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
			var dr = Vec2.diff(cr0, cl0).normalized();
			var dl = dr.negated();

			var bracketWidth = 0.25;
			var bracketHeight = 1.5;
			brackets.push(
				new BracketParams(cl0.addScaled(dl, 0), dl, bracketWidth, bracketHeight),
				new BracketParams(cr0.addScaled(dr, 0), dr, bracketWidth, bracketHeight)
			);
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
};

SGroup.getObjBBox = function (atoms, mol) {
	console.assert(atoms.length != 0, 'Atom list is empty');

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
	mol.atoms.forEach((atom, aid) => { atoms.push(aid); });
	return atoms;
};

SGroup.getBonds = function (mol, sg) {
	var atoms = SGroup.getAtoms(mol, sg);
	var bonds = [];
	mol.bonds.forEach((bond, bid) => {
		if (atoms.indexOf(bond.begin) >= 0 && atoms.indexOf(bond.end) >= 0)
			bonds.push(bid);
	});
	return bonds;
};

SGroup.prepareMulForSaving = function (sgroup, mol) { // eslint-disable-line max-statements
	sgroup.atoms.sort((a, b) => a - b);
	sgroup.atomSet = new Pile(sgroup.atoms);
	sgroup.parentAtomSet = new Pile(sgroup.atomSet);
	var inBonds = [];
	var xBonds = [];

	mol.bonds.forEach((bond, bid) => {
		if (sgroup.parentAtomSet.has(bond.begin) && sgroup.parentAtomSet.has(bond.end))
			inBonds.push(bid);
		else if (sgroup.parentAtomSet.has(bond.begin) || sgroup.parentAtomSet.has(bond.end))
			xBonds.push(bid);
	});

	if (xBonds.length !== 0 && xBonds.length !== 2)
		throw Error('Unsupported cross-bonds number');

	var xAtom1 = -1;
	var xAtom2 = -1;
	var crossBond = null;
	if (xBonds.length === 2) {
		var bond1 = mol.bonds.get(xBonds[0]);
		xAtom1 = sgroup.parentAtomSet.has(bond1.begin) ? bond1.begin : bond1.end;

		var bond2 = mol.bonds.get(xBonds[1]);
		xAtom2 = sgroup.parentAtomSet.has(bond2.begin) ? bond2.begin : bond2.end;
		crossBond = bond2;
	}

	var amap = null;
	var tailAtom = xAtom2;

	var newAtoms = [];
	for (var j = 0; j < sgroup.data.mul - 1; j++) {
		amap = {};
		sgroup.atoms.forEach((aid) => {
			var atom = mol.atoms.get(aid);
			var aid2 = mol.atoms.add(new Atom(atom));
			newAtoms.push(aid2);
			sgroup.atomSet.add(aid2);
			amap[aid] = aid2;
		});
		inBonds.forEach((bid) => {
			var bond = mol.bonds.get(bid);
			var newBond = new Bond(bond);
			newBond.begin = amap[newBond.begin];
			newBond.end = amap[newBond.end];
			mol.bonds.add(newBond);
		});
		if (crossBond !== null) {
			var newCrossBond = new Bond(crossBond);
			newCrossBond.begin = tailAtom;
			newCrossBond.end = amap[xAtom1];
			mol.bonds.add(newCrossBond);
			tailAtom = amap[xAtom2];
		}
	}
	if (tailAtom >= 0) {
		var xBond2 = mol.bonds.get(xBonds[1]);
		if (xBond2.begin === xAtom2)
			xBond2.begin = tailAtom;
		else
			xBond2.end = tailAtom;
	}
	sgroup.bonds = xBonds;

	newAtoms.forEach((aid) => {
		mol.sGroupForest.getPathToRoot(sgroup.id).reverse().forEach((sgid) => {
			mol.atomAddToSGroup(sgid, aid);
		});
	});
};

SGroup.getMassCentre = function (mol, atoms) {
	var c = new Vec2(); // mass centre
	for (var i = 0; i < atoms.length; ++i)
		c = c.addScaled(mol.atoms.get(atoms[i]).pp, 1.0 / atoms.length);
	return c;
};

export default SGroup;
