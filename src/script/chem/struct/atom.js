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

import Vec2 from '../../util/vec2';
import Pile from '../../util/pile';
import element from '../element';
import AtomList from './atomlist';

function Atom(params) { // eslint-disable-line max-statements
	var def = Atom.attrGetDefault;
	console.assert(params || 'label' in params, 'label must be specified!');

	this.label = params.label;
	this.fragment = ('fragment' in params) ? params.fragment : -1;
	this.pseudo = params.pseudo || checkPseudo(params.label);

	ifDef(this, params, 'alias', def('alias'));
	ifDef(this, params, 'isotope', def('isotope'));
	ifDef(this, params, 'radical', def('radical'));
	ifDef(this, params, 'charge', def('charge'));
	ifDef(this, params, 'rglabel', def('rglabel')); // r-group index mask, i-th bit stands for i-th r-site
	ifDef(this, params, 'attpnt', def('attpnt')); // attachment point
	ifDef(this, params, 'explicitValence', def('explicitValence'));

	this.valence = 0;
	this.implicitH = 0; // implicitH is not an attribute
	this.pp = params.pp ? new Vec2(params.pp) : new Vec2();

	// sgs should only be set when an atom is added to an s-group by an appropriate method,
	//   or else a copied atom might think it belongs to a group, but the group be unaware of the atom
	// TODO: make a consistency check on atom/s-group assignments
	this.sgs = new Pile();

	// query
	ifDef(this, params, 'ringBondCount', def('ringBondCount'));
	ifDef(this, params, 'substitutionCount', def('substitutionCount'));
	ifDef(this, params, 'unsaturatedAtom', def('unsaturatedAtom'));
	ifDef(this, params, 'hCount', def('hCount'));

	// reaction
	ifDef(this, params, 'aam', def('aam'));
	ifDef(this, params, 'invRet', def('invRet'));
	ifDef(this, params, 'exactChangeFlag', def('exactChangeFlag'));
	ifDef(this, params, 'rxnFragmentType', -1); // this isn't really an attribute

	this.atomList = params.atomList ? new AtomList(params.atomList) : null;
	this.neighbors = []; // set of half-bonds having this atom as their origin
	this.badConn = false;
}

Atom.getAttrHash = function (atom) {
	var attrs = {};
	for (var attr in Atom.attrlist) {
		if (typeof (atom[attr]) !== 'undefined')
			attrs[attr] = atom[attr];
	}
	return attrs;
};

Atom.attrGetDefault = function (attr) {
	if (attr in Atom.attrlist)
		return Atom.attrlist[attr];
	return console.assert(false, 'Attribute unknown');
};


Atom.PATTERN =
{
	RADICAL:
	{
		NONE: 0,
		SINGLET: 1,
		DOUPLET: 2,
		TRIPLET: 3
	}
};

Atom.attrlist = {
	alias: null,
	label: 'C',
	pseudo: null,
	isotope: 0,
	radical: 0,
	charge: 0,
	explicitValence: -1,
	ringBondCount: 0,
	substitutionCount: 0,
	unsaturatedAtom: 0,
	hCount: 0,
	atomList: null,
	invRet: 0,
	exactChangeFlag: 0,
	rglabel: null,
	attpnt: null,
	aam: 0
};

export function radicalElectrons(radical) {
	radical -= 0;
	if (radical === Atom.PATTERN.RADICAL.NONE)
		return 0;
	else if (radical === Atom.PATTERN.RADICAL.DOUPLET)
		return 1;
	else if (radical === Atom.PATTERN.RADICAL.SINGLET ||
		radical === Atom.PATTERN.RADICAL.TRIPLET)
		return 2;
	return console.assert(false, 'Unknown radical value');
}

/**
 * @param fidMap { Map<number, number> }
 * @returns { Atom }
 */
Atom.prototype.clone = function (fidMap) {
	const ret = new Atom(this);
	if (fidMap && fidMap.has(this.fragment))
		ret.fragment = fidMap.get(this.fragment);
	return ret;
};

Atom.prototype.isQuery = function () {
	return this.atomList !== null || this.label === 'A' || this.attpnt || this.hCount;
};

Atom.prototype.pureHydrogen = function () {
	return this.label === 'H' && this.isotope === 0;
};

Atom.prototype.isPlainCarbon = function () {
	return this.label === 'C' && this.isotope === 0 && this.radical === 0 && this.charge === 0 &&
		this.explicitValence < 0 && this.ringBondCount === 0 && this.substitutionCount === 0 &&
		this.unsaturatedAtom === 0 && this.hCount === 0 && !this.atomList;
};

Atom.prototype.isPseudo = function () {
	// TODO: handle reaxys generics separately
	return !this.atomList && !this.rglabel && !element.map[this.label];
};

Atom.prototype.hasRxnProps = function () {
	return !!(this.invRet || this.exactChangeFlag || this.attpnt !== null || this.aam);
};

Atom.prototype.calcValence = function (conn) { // eslint-disable-line max-statements
	var atom = this;
	var charge = atom.charge;
	var label = atom.label;
	if (atom.isQuery()) {
		this.implicitH = 0;
		return true;
	}
	var elem = element.map[label];
	if (elem === undefined) {
		this.implicitH = 0;
		return true;
	}

	var groupno = element[elem].group;
	var rad = radicalElectrons(atom.radical);

	var valence = conn;
	var hyd = 0;
	var absCharge = Math.abs(charge);

	if (groupno === 1) {
		if (label === 'H' ||
			label === 'Li' || label === 'Na' || label === 'K' ||
			label === 'Rb' || label === 'Cs' || label === 'Fr') {
			valence = 1;
			hyd = 1 - rad - conn - absCharge;
		}
	} else if (groupno === 2) {
		if (conn + rad + absCharge === 2 || conn + rad + absCharge === 0)
			valence = 2;
		else
			hyd = -1;
	} else if (groupno === 3) {
		if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
			if (charge === -1) {
				valence = 4;
				hyd = 4 - rad - conn;
			} else {
				valence = 3;
				hyd = 3 - rad - conn - absCharge;
			}
		} else if (label === 'Tl') {
			if (charge === -1) {
				if (rad + conn <= 2) {
					valence = 2;
					hyd = 2 - rad - conn;
				} else {
					valence = 4;
					hyd = 4 - rad - conn;
				}
			} else if (charge === -2) {
				if (rad + conn <= 3) {
					valence = 3;
					hyd = 3 - rad - conn;
				} else {
					valence = 5;
					hyd = 5 - rad - conn;
				}
			} else if (rad + conn + absCharge <= 1) {
				valence = 1;
				hyd = 1 - rad - conn - absCharge;
			} else {
				valence = 3;
				hyd = 3 - rad - conn - absCharge;
			}
		}
	} else if (groupno === 4) {
		if (label === 'C' || label === 'Si' || label === 'Ge') {
			valence = 4;
			hyd = 4 - rad - conn - absCharge;
		} else if (label === 'Sn' || label === 'Pb') {
			if (conn + rad + absCharge <= 2) {
				valence = 2;
				hyd = 2 - rad - conn - absCharge;
			} else {
				valence = 4;
				hyd = 4 - rad - conn - absCharge;
			}
		}
	} else if (groupno === 5) {
		if (label === 'N' || label === 'P') {
			if (charge === 1) {
				valence = 4;
				hyd = 4 - rad - conn;
			} else if (charge === 2) {
				valence = 3;
				hyd = 3 - rad - conn;
			} else if (label === 'N' || rad + conn + absCharge <= 3) {
				valence = 3;
				hyd = 3 - rad - conn - absCharge;
			} else { // ELEM_P && rad + conn + absCharge > 3
				valence = 5;
				hyd = 5 - rad - conn - absCharge;
			}
		} else if (label === 'Bi' || label === 'Sb' || label === 'As') {
			if (charge === 1) {
				if (rad + conn <= 2 && label !== 'As') {
					valence = 2;
					hyd = 2 - rad - conn;
				} else {
					valence = 4;
					hyd = 4 - rad - conn;
				}
			} else if (charge === 2) {
				valence = 3;
				hyd = 3 - rad - conn;
			} else if (rad + conn <= 3) {
				valence = 3;
				hyd = 3 - rad - conn - absCharge;
			} else {
				valence = 5;
				hyd = 5 - rad - conn - absCharge;
			}
		}
	} else if (groupno === 6) {
		if (label === 'O') {
			if (charge >= 1) {
				valence = 3;
				hyd = 3 - rad - conn;
			} else {
				valence = 2;
				hyd = 2 - rad - conn - absCharge;
			}
		} else if (label === 'S' || label === 'Se' || label === 'Po') {
			if (charge === 1) {
				if (conn <= 3) {
					valence = 3;
					hyd = 3 - rad - conn;
				} else {
					valence = 5;
					hyd = 5 - rad - conn;
				}
			} else if (conn + rad + absCharge <= 2) {
				valence = 2;
				hyd = 2 - rad - conn - absCharge;
			} else if (conn + rad + absCharge <= 4) {
				// See examples in PubChem
				// [S] : CID 16684216
				// [Se]: CID 5242252
				// [Po]: no example, just following ISIS/Draw logic here
				valence = 4;
				hyd = 4 - rad - conn - absCharge;
			} else {
				// See examples in PubChem
				// [S] : CID 46937044
				// [Se]: CID 59786
				// [Po]: no example, just following ISIS/Draw logic here
				valence = 6;
				hyd = 6 - rad - conn - absCharge;
			}
		} else if (label === 'Te') {
			if (charge === -1) {
				if (conn <= 2) {
					valence = 2;
					hyd = 2 - rad - conn - absCharge;
				}
			} else if (charge === 0 || charge === 2) {
				if (conn <= 2) {
					valence = 2;
					hyd = 2 - rad - conn - absCharge;
				} else if (conn <= 4) {
					valence = 4;
					hyd = 4 - rad - conn - absCharge;
				} else if (charge === 0 && conn <= 6) {
					valence = 6;
					hyd = 6 - rad - conn - absCharge;
				} else {
					hyd = -1;
				}
			}
		}
	} else if (groupno === 7) {
		if (label === 'F') {
			valence = 1;
			hyd = 1 - rad - conn - absCharge;
		} else if (label === 'Cl' || label === 'Br' ||
			label === 'I' || label === 'At') {
			if (charge === 1) {
				if (conn <= 2) {
					valence = 2;
					hyd = 2 - rad - conn;
				} else if (conn === 3 || conn === 5 || conn >= 7) {
					hyd = -1;
				}
			} else if (charge === 0) {
				if (conn <= 1) {
					valence = 1;
					hyd = 1 - rad - conn;
					// While the halogens can have valence 3, they can not have
					// hydrogens in that case.
				} else if (conn === 2 || conn === 4 || conn === 6) {
					if (rad === 1) {
						valence = conn;
						hyd = 0;
					} else {
						hyd = -1; // will throw an error in the end
					}
				} else if (conn > 7) {
					hyd = -1; // will throw an error in the end
				}
			}
		}
	} else if (groupno === 8) {
		if (conn + rad + absCharge === 0)
			valence = 1;
		else
			hyd = -1;
	}

	this.valence = valence;
	this.implicitH = hyd;
	if (this.implicitH < 0) {
		this.valence = conn;
		this.implicitH = 0;
		this.badConn = true;
		return false;
	}
	return true;
};

Atom.prototype.calcValenceMinusHyd = function (conn) { // eslint-disable-line max-statements
	var atom = this;
	var charge = atom.charge;
	var label = atom.label;
	var elem = element.map[label];
	if (elem === null)
		console.assert('Element ' + label + ' unknown');
	if (elem < 0) { // query atom, skip
		this.implicitH = 0;
		return null;
	}

	var groupno = element[elem].group;
	var rad = radicalElectrons(atom.radical);

	if (groupno === 3) {
		if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
			if (charge === -1) {
				if (rad + conn <= 4)
					return rad + conn;
			}
		}
	} else if (groupno === 5) {
		if (label === 'N' || label === 'P') {
			if (charge === 1)
				return rad + conn;
			if (charge === 2)
				return rad + conn;
		} else if (label === 'Sb' || label === 'Bi' || label === 'As') {
			if (charge === 1)
				return rad + conn;
			else if (charge === 2)
				return rad + conn;
		}
	} else if (groupno === 6) {
		if (label === 'O') {
			if (charge >= 1)
				return rad + conn;
		} else if (label === 'S' || label === 'Se' || label === 'Po') {
			if (charge === 1)
				return rad + conn;
		}
	} else if (groupno === 7) {
		if (label === 'Cl' || label === 'Br' ||
			label === 'I' || label === 'At') {
			if (charge === 1)
				return rad + conn;
		}
	}

	return rad + conn + Math.abs(charge);
};

function ifDef(dst, src, prop, def) {
	dst[prop] = !(typeof src[prop] === 'undefined') ? src[prop] : def;
}

function checkPseudo(label) {
	return !element.map[label] && label !== 'L' && label !== 'L#' && label !== 'R#' ? label : null;
}

export default Atom;
