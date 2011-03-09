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

// chem.Molecule constructor and utilities are defined here
if (!window.chem || !chem.Vec2 || !chem.Pool)
	throw new Error("Vec2, Pool should be defined first")

chem.Molecule = function ()
{
	this.atoms = new chem.Pool();
	this.bonds = new chem.Pool();
	this.sgroups = new chem.Pool();
	this.isChiral = false;
}

chem.Molecule.prototype.toLists = function ()
{
	var aidMap = {};
	var atomList = [];
	this.atoms.each(function(aid, atom) {
		aidMap[aid] = atomList.length;
		atomList.push(atom);
	});

	var bondList = [];
	this.bonds.each(function(bid, bond) {
		var b = Object.clone(bond);
		b.begin = aidMap[bond.begin];
		b.end = aidMap[bond.end];
		bondList.push(b);
	});

	return {
		'atoms': atomList,
		'bonds': bondList
	};
}

chem.Molecule.prototype.clone = function ()
{
	var cp = new chem.Molecule();
	var aidMap = {};
	this.atoms.each(function(aid, atom) {
		aidMap[aid] = cp.atoms.add(atom.clone());
	});

	var bidMap = {};
	this.bonds.each(function(bid, bond) {
		bidMap[bid] = cp.bonds.add(bond.clone(aidMap));
	});

	this.sgroups.each(function(sid, sg) {
		sg = chem.SGroup.clone(sg, aidMap, bidMap);
		var id = cp.sgroups.add(sg);
		sg.id = id;
		for (var i = 0; i < sg.atoms.length; ++i) {
			cp.atoms.get(sg.atoms[i]).sgroup = id;
		}
	});
	cp.isChiral = this.isChiral;

	return cp;
}

chem.Molecule.prototype.findBondId = function (begin, end)
{
	var id = -1;
    
	this.bonds.find(function (bid, bond)
	{
		if ((bond.begin == begin && bond.end == end) ||
			(bond.begin == end && bond.end == begin))
			{
			id = bid;
			return true;
		}
		return false;
	}, this);
    
	return id;
}

chem.Molecule.prototype.merge = function (mol)
{
	var aidMap = {};
	mol.atoms.each(function(aid, atom){
		aidMap[aid] = this.atoms.add(atom);
	}, this);
	mol.bonds.each(function(bid, bond){
		var params = new chem.Molecule.Bond(bond);
		params.begin = aidMap[bond.begin];
		params.end = aidMap[bond.end];
		this.bonds.add(params);
	}, this);
}

chem.Molecule.ATOM =
{
	RADICAL:
	{
		NONE:    0,
		SINGLET: 1,
		DOUPLET: 2,
		TRIPLET: 3
	}
};

chem.Molecule.radicalElectrons = function(radical)
{
	radical = radical - 0;
	if (radical == chem.Molecule.ATOM.RADICAL.NONE)
		return 0;
	else if (radical == chem.Molecule.ATOM.RADICAL.DOUPLET)
		return 1;
	else if (radical == chem.Molecule.ATOM.RADICAL.SINGLET ||
		radical == chem.Molecule.ATOM.RADICAL.TRIPLET)
		return 2;
	throw new Error("Unknown radical value");
}

chem.Molecule.BOND =
{
	TYPE:
	{
		SINGLE: 1,
		DOUBLE: 2,
		TRIPLE: 3,
		AROMATIC: 4,
		SINGLE_OR_DOUBLE: 5,
		SINGLE_OR_AROMATIC: 6,
		DOUBLE_OR_AROMATIC: 7,
		ANY : 8
	},

	STEREO:
	{
		NONE: 0,
		UP: 1,
		EITHER: 4,
		DOWN: 6,
		CIS_TRANS: 3
	},

	TOPOLOGY:
	{
		EITHER: 0,
		RING: 1,
		CHAIN: 2
	}
};

chem.Molecule.FRAGMENT = {
	NONE:0,
	REACTANT:1,
	PRODUCT:2,
	AGENT:3
};

chem.Molecule.fragments = new chem.Pool(); // maps fragment indices into their types

chem.Molecule.prototype.merge = function (mol)
{
	var aidMap = {};
	mol.atoms.each(function(aid, atom){
		aidMap[aid] = this.atoms.add(atom);
	}, this);
	mol.bonds.each(function(bid, bond){
		var params = new chem.Molecule.Bond(bond);
		params.begin = aidMap[bond.begin];
		params.end = aidMap[bond.end];
		this.bonds.add(params);
	}, this);
}

chem.Molecule.Atom = function (params)
{
	if (!params || !('label' in params))
		throw new Error("label must be specified!");

	this.label = params.label;
	chem.ifDef(this, params, 'isotope', 0);
	chem.ifDef(this, params, 'radical', 0);
	chem.ifDef(this, params, 'charge', 0);
	chem.ifDef(this, params, 'valence', 0);
	chem.ifDef(this, params, 'explicitValence', 0);
	chem.ifDef(this, params, 'implicitH', 0);
	if (!Object.isUndefined(params.pos))
		this.pos = new chem.Vec2(params.pos);
	else
		this.pos = new chem.Vec2();

	chem.ifDef(this, params, 'fragment', -1);
	chem.ifDef(this, params, 'sgroup', -1);

	// query
	chem.ifDef(this, params, 'ringBondCount', -1);
	chem.ifDef(this, params, 'substitutionCount', -1);
	chem.ifDef(this, params, 'unsaturatedAtom', -1);

	this.atomList = !Object.isUndefined(params.atomList) && params.atomList != null ? new chem.Molecule.AtomList(params.atomList) : null;
}

chem.Molecule.Atom.prototype.clone = function ()
{
	return new chem.Molecule.Atom(this);
}

chem.Molecule.Atom.prototype.isQuery =  function ()
{
	return this.atomList != null || this.label == 'A';
}

chem.Molecule.Atom.prototype.pureHydrogen =  function ()
{
	return this.label == 'H' && this.isotope == 0;
}

chem.Molecule.AtomList = function (params)
{
	if (!params || !('notList' in params) || !('ids' in params))
		throw new Error("'notList' and 'ids' must be specified!");

	this.notList = params.notList; /*boolean*/
	this.ids = params.ids; /*Array of integers*/
}

chem.Molecule.AtomList.prototype.labelList = function ()
{
	var labels = [];
	for (var i = 0; i < this.ids.length; ++i)
		labels.push(chem.Element.elements.get(this.ids[i]).label);
	return labels;
}

chem.Molecule.AtomList.prototype.label = function ()
{
	var label = "[" + this.labelList().join(",") + "]";
	if (this.notList)
		label = "!" + label;
	return label;
}

chem.Molecule.Bond = function (params)
{
	if (!params || !('begin' in params) || !('end' in params) || !('type' in params))
		throw new Error("'begin', 'end' and 'type' properties must be specified!");

	this.begin = params.begin;
	this.end = params.end;
	this.type = params.type;
	chem.ifDef(this, params, 'stereo', chem.Molecule.BOND.STEREO.NONE);
	chem.ifDef(this, params, 'topology', chem.Molecule.BOND.TOPOLOGY.EITHER);
	chem.ifDef(this, params, 'reactingCenterStatus', 0);
}

chem.Molecule.Bond.prototype.clone = function (aidMap)
{
	var cp = new chem.Molecule.Bond(this);
	if (aidMap) {
		cp.begin = aidMap[cp.begin];
		cp.end = aidMap[cp.end];
	}
	return cp;
}

chem.Molecule.Bond.prototype.findOtherEnd = function (i)
{
	if (i == this.begin)
		return this.end;
	if (i == this.end)
		return this.begin;
	throw new Error("bond end not found");
}
