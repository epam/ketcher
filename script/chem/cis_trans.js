/*global require, global:false, chem:false*/

/*eslint-disable*/

var Map = require('../util/map');
var Vec2 = require('../util/vec2');

require('./element');
require('./struct');

var chem = global.chem = global.chem || {}; // jshint ignore:line

chem.CisTrans = function (mol, neighborsFunc, context) {
	this.molecule = mol;
	this.bonds = new Map();
	this.getNeighbors = neighborsFunc;
	this.context = context;
};

chem.CisTrans.PARITY = {
	NONE: 0,
	CIS: 1,
	TRANS: 2
};

chem.CisTrans.prototype.each = function (func, context) {
	this.bonds.each(func, context);
};

chem.CisTrans.prototype.getParity = function (idx) {
	return this.bonds.get(idx).parity;
};

chem.CisTrans.prototype.getSubstituents = function (idx) {
	return this.bonds.get(idx).substituents;
};

chem.CisTrans.prototype.sameside = function (beg, end, neiBeg, neiEnd) {
	var diff = Vec2.diff(beg, end);
	var norm = new Vec2(-diff.y, diff.x);

	if (!norm.normalize()) {
		return 0;
	}

	var normBeg = Vec2.diff(neiBeg, beg);
	var normEnd = Vec2.diff(neiEnd, end);

	if (!normBeg.normalize()) {
		return 0;
	}
	if (!normEnd.normalize()) {
		return 0;
	}

	var prodBeg = Vec2.dot(normBeg, norm);
	var prodEnd = Vec2.dot(normEnd, norm);

	if (Math.abs(prodBeg) < 0.001 || Math.abs(prodEnd) < 0.001) {
		return 0;
	}

	return (prodBeg * prodEnd > 0) ? 1 : -1;
};

chem.CisTrans.prototype._sameside = function (iBeg, iEnd, iNeiBeg, iNeiEnd) {
	return this.sameside(this.molecule.atoms.get(iBeg).pp, this.molecule.atoms.get(iEnd).pp,
		this.molecule.atoms.get(iNeiBeg).pp, this.molecule.atoms.get(iNeiEnd).pp);
};

chem.CisTrans.prototype._sortSubstituents = function (substituents) {
	var h0 = this.molecule.atoms.get(substituents[0]).pureHydrogen();
	var h1 = substituents[1] < 0 || this.molecule.atoms.get(substituents[1]).pureHydrogen();
	var h2 = this.molecule.atoms.get(substituents[2]).pureHydrogen();
	var h3 = substituents[3] < 0 || this.molecule.atoms.get(substituents[3]).pureHydrogen();

	if (h0 && h1) {
		return false;
	}
	if (h2 && h3) {
		return false;
	}

	if (h1) {
		substituents[1] = -1;
	} else if (h0) {
		substituents[0] = substituents[1];
		substituents[1] = -1;
	} else if (substituents[0] > substituents[1]) {
		substituents.swap(0, 1);
	}

	if (h3) {
		substituents[3] = -1;
	} else if (h2) {
		substituents[2] = substituents[3];
		substituents[3] = -1;
	} else if (substituents[2] > substituents[3]) {
		substituents.swap(2, 3);
	}

	return true;
};

chem.CisTrans.prototype.isGeomStereoBond = function (bondIdx, substituents) {
	// it must be [C,N,Si]=[C,N,Si] bond
	var bond = this.molecule.bonds.get(bondIdx);

	if (bond.type != chem.Struct.BOND.TYPE.DOUBLE) {
		return false;
	}

	var label1 = this.molecule.atoms.get(bond.begin).label;
	var label2 = this.molecule.atoms.get(bond.end).label;

	if (label1 != 'C' && label1 != 'N' && label1 != 'Si' && label1 != 'Ge') {
		return false;
	}
	if (label2 != 'C' && label2 != 'N' && label2 != 'Si' && label2 != 'Ge') {
		return false;
	}

	// the atoms should have 1 or 2 single bonds
	// (apart from the double bond under consideration)
	var neiBegin = this.getNeighbors.call(this.context, bond.begin);
	var neiЕnd = this.getNeighbors.call(this.context, bond.end);

	if (
	neiBegin.length < 2 || neiBegin.length > 3 ||
	neiЕnd.length < 2 || neiЕnd.length > 3
	) {
		return false;
	}

	substituents[0] = -1;
	substituents[1] = -1;
	substituents[2] = -1;
	substituents[3] = -1;

	var i;
	var nei;

	for (i = 0; i < neiBegin.length; i++) {
		nei = neiBegin[i];

		if (nei.bid == bondIdx) {
			continue;
		}

		if (this.molecule.bonds.get(nei.bid).type != chem.Struct.BOND.TYPE.SINGLE) {
			return false;
		}

		if (substituents[0] == -1) {
			substituents[0] = nei.aid;
		}else { // (substituents[1] == -1)
			substituents[1] = nei.aid;
		}
	}

	for (i = 0; i < neiЕnd.length; i++) {
		nei = neiЕnd[i];

		if (nei.bid == bondIdx) {
			continue;
		}

		if (this.molecule.bonds.get(nei.bid).type != chem.Struct.BOND.TYPE.SINGLE) {
			return false;
		}

		if (substituents[2] == -1) {
			substituents[2] = nei.aid;
		}
		else { // (substituents[3] == -1)
			substituents[3] = nei.aid;
		}
	}

	if (substituents[1] != -1 && this._sameside(bond.begin, bond.end, substituents[0], substituents[1]) != -1) {
		return false;
	}
	if (substituents[3] != -1 && this._sameside(bond.begin, bond.end, substituents[2], substituents[3]) != -1) {
		return false;
	}

	return true;
};

chem.CisTrans.prototype.build = function (exclude_bonds) {
	this.molecule.bonds.each(function (bid, bond) {
		var ct = this.bonds.set(bid,
		{
			parity: 0,
			substituents: new Array(4)
		});

		if (Object.isArray(exclude_bonds) && exclude_bonds[bid])
			return;

		if (!this.isGeomStereoBond(bid, ct.substituents))
			return;

		if (!this._sortSubstituents(ct.substituents))
			return;

		var sign = this._sameside(bond.begin, bond.end, ct.substituents[0], ct.substituents[2]);

		if (sign == 1)
			ct.parity = chem.CisTrans.PARITY.CIS;
		else if (sign == -1)
			ct.parity = chem.CisTrans.PARITY.TRANS;
	}, this);
};
