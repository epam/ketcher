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

import Pool from '../../util/pool';
import Vec2 from '../../util/vec2';

import { Bond } from '../struct';

function CisTrans(mol, neighborsFunc, context) {
	this.molecule = mol;
	this.bonds = new Pool();
	this.getNeighbors = neighborsFunc;
	this.context = context;
}

CisTrans.PARITY = {
	NONE: 0,
	CIS: 1,
	TRANS: 2
};

CisTrans.prototype.each = function (func) {
	this.bonds.forEach(func);
};

CisTrans.prototype.getParity = function (idx) {
	return this.bonds.get(idx).parity;
};

CisTrans.prototype.getSubstituents = function (idx) {
	return this.bonds.get(idx).substituents;
};

CisTrans.prototype.sameside = function (beg, end, neiBeg, neiEnd) {
	var diff = Vec2.diff(beg, end);
	var norm = new Vec2(-diff.y, diff.x);

	if (!norm.normalize())
		return 0;

	var normBeg = Vec2.diff(neiBeg, beg);
	var normEnd = Vec2.diff(neiEnd, end);

	if (!normBeg.normalize())
		return 0;
	if (!normEnd.normalize())
		return 0;

	var prodBeg = Vec2.dot(normBeg, norm);
	var prodEnd = Vec2.dot(normEnd, norm);

	if (Math.abs(prodBeg) < 0.001 || Math.abs(prodEnd) < 0.001)
		return 0;

	return (prodBeg * prodEnd > 0) ? 1 : -1;
};

CisTrans.prototype.samesides = function (iBeg, iEnd, iNeiBeg, iNeiEnd) {
	return this.sameside(this.molecule.atoms.get(iBeg).pp, this.molecule.atoms.get(iEnd).pp,
		this.molecule.atoms.get(iNeiBeg).pp, this.molecule.atoms.get(iNeiEnd).pp);
};

CisTrans.prototype.sortSubstituents = function (substituents) { // eslint-disable-line max-statements
	var h0 = this.molecule.atoms.get(substituents[0]).pureHydrogen();
	var h1 = substituents[1] < 0 || this.molecule.atoms.get(substituents[1]).pureHydrogen();
	var h2 = this.molecule.atoms.get(substituents[2]).pureHydrogen();
	var h3 = substituents[3] < 0 || this.molecule.atoms.get(substituents[3]).pureHydrogen();

	if (h0 && h1)
		return false;
	if (h2 && h3)
		return false;

	if (h1) {
		substituents[1] = -1;
	} else if (h0) {
		substituents[0] = substituents[1];
		substituents[1] = -1;
	} else if (substituents[0] > substituents[1]) {
		swap(substituents, 0, 1);
	}

	if (h3) {
		substituents[3] = -1;
	} else if (h2) {
		substituents[2] = substituents[3];
		substituents[3] = -1;
	} else if (substituents[2] > substituents[3]) {
		swap(substituents, 2, 3);
	}

	return true;
};

CisTrans.prototype.isGeomStereoBond = function (bondIdx, substituents) { // eslint-disable-line max-statements
	// it must be [C,N,Si]=[C,N,Si] bond
	var bond = this.molecule.bonds.get(bondIdx);

	if (bond.type != Bond.PATTERN.TYPE.DOUBLE)
		return false;

	var label1 = this.molecule.atoms.get(bond.begin).label;
	var label2 = this.molecule.atoms.get(bond.end).label;

	if (label1 != 'C' && label1 != 'N' && label1 != 'Si' && label1 != 'Ge')
		return false;
	if (label2 != 'C' && label2 != 'N' && label2 != 'Si' && label2 != 'Ge')
		return false;

	// the atoms should have 1 or 2 single bonds
	// (apart from the double bond under consideration)
	var neiBegin = this.getNeighbors.call(this.context, bond.begin);
	var neiЕnd = this.getNeighbors.call(this.context, bond.end);

	if (
		neiBegin.length < 2 || neiBegin.length > 3 ||
		neiЕnd.length < 2 || neiЕnd.length > 3
	)
		return false;

	substituents[0] = -1;
	substituents[1] = -1;
	substituents[2] = -1;
	substituents[3] = -1;

	var i;
	var nei;

	for (i = 0; i < neiBegin.length; i++) {
		nei = neiBegin[i];

		if (nei.bid == bondIdx)
			continue; // eslint-disable-line no-continue

		if (this.molecule.bonds.get(nei.bid).type != Bond.PATTERN.TYPE.SINGLE)
			return false;

		if (substituents[0] == -1)
			substituents[0] = nei.aid;
		else // (substituents[1] == -1)
			substituents[1] = nei.aid;
	}

	for (i = 0; i < neiЕnd.length; i++) {
		nei = neiЕnd[i];

		if (nei.bid == bondIdx)
			continue; // eslint-disable-line no-continue

		if (this.molecule.bonds.get(nei.bid).type != Bond.PATTERN.TYPE.SINGLE)
			return false;

		if (substituents[2] == -1)
			substituents[2] = nei.aid;
		else // (substituents[3] == -1)
			substituents[3] = nei.aid;
	}

	if (substituents[1] != -1 && this.samesides(bond.begin, bond.end, substituents[0], substituents[1]) != -1)
		return false;
	if (substituents[3] != -1 && this.samesides(bond.begin, bond.end, substituents[2], substituents[3]) != -1)
		return false;

	return true;
};

CisTrans.prototype.build = function (excludeBonds) {
	this.molecule.bonds.forEach((bond, bid) => {
		const ct = {
			parity: 0,
			substituents: []
		};
		this.bonds.set(bid, ct);

		if (Array.isArray(excludeBonds) && excludeBonds[bid])
			return;

		if (!this.isGeomStereoBond(bid, ct.substituents))
			return;

		if (!this.sortSubstituents(ct.substituents))
			return;

		const sign = this.samesides(bond.begin, bond.end, ct.substituents[0], ct.substituents[2]);

		if (sign === 1)
			ct.parity = CisTrans.PARITY.CIS;
		else if (sign === -1)
			ct.parity = CisTrans.PARITY.TRANS;
	});
};

function swap(arr, i1, i2) {
	var tmp = arr[i1];
	arr[i1] = arr[i2];
	arr[i2] = tmp;
}

export default CisTrans;
