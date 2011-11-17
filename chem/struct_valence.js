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

if (!window.chem || !chem.Struct)
	throw new Error("Include MolData.js first");

chem.Struct.prototype.calcConn = function (aid)
{
	var conn = 0;
	var atom = this.atoms.get(aid);
	var hasAromatic = false;
	for (var i = 0; i < atom.neighbors.length; ++i) {
		var hb = this.halfBonds.get(atom.neighbors[i]);
		var bond = this.bonds.get(hb.bid);
		switch (bond.type) {
			case chem.Struct.BOND.TYPE.SINGLE:
				conn += 1;
				break;
			case chem.Struct.BOND.TYPE.DOUBLE:
				conn += 2;
				break;
			case chem.Struct.BOND.TYPE.TRIPLE:
				conn += 3;
				break;
			case chem.Struct.BOND.TYPE.AROMATIC:
				conn += 1;
				hasAromatic = true;
				break;
			default:
				return -1;
		}
	}
	if (hasAromatic)
		conn += 1;
	return conn;
};

chem.Struct.Atom.prototype.calcValence = function (conn)
{
	var atom = this;
	var charge = atom.charge;
	var label = atom.label;
	if (atom.isQuery()) {
		this.valence = -1;
		this.implicitH = -1;
		return true;
	}
	var elem = chem.Element.getElementByLabel(label);
	if (elem == null) {
		this.valence = -1;
		this.implicitH = 0;
		return true;
	}

	var groupno = chem.Element.elements.get(elem).group;
	var rad = chem.Struct.radicalElectrons(atom.radical);

	var valence = conn;
	var hyd = 0;
	var absCharge = Math.abs(charge);

	if (groupno == 1)
	{
		if (label == 'H' ||
			label == 'Li' || label == 'Na' || label == 'K' ||
			label == 'Rb' || label == 'Cs' || label == 'Fr')
			{
			valence = 1;
			hyd = 1 - rad - conn - absCharge;
		}
	}
	else if (groupno == 3)
	{
		if (label == 'B' || label == 'Al' || label == 'Ga' || label == 'In')
		{
			if (charge == -1)
			{
				valence = 4;
				hyd = 4 - rad - conn;
			}
			else
			{
				valence = 3;
				hyd = 3 - rad - conn - absCharge;
			}
		}
		else if (label == 'Tl')
		{
			if (charge == -1)
			{
				if (rad + conn <= 2)
				{
					valence = 2;
					hyd = 2 - rad - conn;
				}
				else
				{
					valence = 4;
					hyd = 4 - rad - conn;
				}
			}
			else if (charge == -2)
			{
				if (rad + conn <= 3)
				{
					valence = 3;
					hyd = 3 - rad - conn;
				}
				else
				{
					valence = 5;
					hyd = 5 - rad - conn;
				}
			}
			else
			{
				if (rad + conn + absCharge <= 1)
				{
					valence = 1;
					hyd = 1 - rad - conn - absCharge;
				}
				else
				{
					valence = 3;
					hyd = 3 - rad - conn - absCharge;
				}
			}
		}
	}
	else if (groupno == 4)
	{
		if (label == 'C' || label == 'Si' || label == 'Ge')
		{
			valence = 4;
			hyd = 4 - rad - conn - absCharge;
		}
		else if (label == 'Sn' || label == 'Pb')
		{
			if (conn + rad + absCharge <= 2)
			{
				valence = 2;
				hyd = 2 - rad - conn - absCharge;
			}
			else
			{
				valence = 4;
				hyd = 4 - rad - conn - absCharge;
			}
		}
	}
	else if (groupno == 5)
	{
		if (label == 'N' || label == 'P')
		{
			if (charge == 1)
			{
				valence = 4;
				hyd = 4 - rad - conn;
			}
			else if (charge == 2)
			{
				valence = 3;
				hyd = 3 - rad - conn;
			}
			else
			{
				if (label == 'N' || rad + conn + absCharge <= 3)
				{
					valence = 3;
					hyd = 3 - rad - conn - absCharge;
				}
				else // ELEM_P && rad + conn + absCharge > 3
				{
					valence = 5;
					hyd = 5 - rad - conn - absCharge;
				}
			}
		}
		else if (label == 'Bi' || label == 'Sb' || label == 'As')
		{
			if (charge == 1)
			{
				if (rad + conn <= 2 && label != 'As')
				{
					valence = 2;
					hyd = 2 - rad - conn;
				}
				else
				{
					valence = 4;
					hyd = 4 - rad - conn;
				}
			}
			else if (charge == 2)
			{
				valence = 3;
				hyd = 3 - rad - conn;
			}
			else
			{
				if (rad + conn <= 3)
				{
					valence = 3;
					hyd = 3 - rad - conn - absCharge;
				}
				else
				{
					valence = 5;
					hyd = 5 - rad - conn - absCharge;
				}
			}
		}
	}
	else if (groupno == 6)
	{
		if (label == 'O')
		{
			if (charge >= 1)
			{
				valence = 3;
				hyd = 3 - rad - conn;
			}
			else
			{
				valence = 2;
				hyd = 2 - rad - conn - absCharge;
			}
		}
		else if (label == 'S' || label == 'Se' || label == 'Po')
		{
			if (charge == 1)
			{
				if (conn <= 3)
				{
					valence = 3;
					hyd = 3 - rad - conn;
				}
				else
				{
					valence = 5;
					hyd = 5 - rad - conn;
				}
			}
			else
			{
				if (conn + rad + absCharge <= 2)
				{
					valence = 2;
					hyd = 2 - rad - conn - absCharge;
				}
				else if (conn + rad + absCharge <= 4)
				// See examples in PubChem
				// [S] : CID 16684216
				// [Se]: CID 5242252
				// [Po]: no example, just following ISIS/Draw logic here
				{
					valence = 4;
					hyd = 4 - rad - conn - absCharge;
				}
				else
				// See examples in PubChem
				// [S] : CID 46937044
				// [Se]: CID 59786
				// [Po]: no example, just following ISIS/Draw logic here
				{
					valence = 6;
					hyd = 6 - rad - conn - absCharge;
				}
			}
		}
		else if (label == 'Te')
		{
			if (charge == -1)
			{
				if (conn <= 2)
				{
					valence = 2;
					hyd = 2 - rad - conn - absCharge;
				}
			}
			else if (charge == 0 || charge == 2)
			{
				if (conn <= 2)
				{
					valence = 2;
					hyd = 2 - rad - conn - absCharge;
				}
				else if (conn <= 4)
				{
					valence = 4;
					hyd = 4 - rad - conn - absCharge;
				}
				else if (charge == 0 && conn <= 6)
				{
					valence = 6;
					hyd = 6 - rad - conn - absCharge;
				}
				else
					hyd = -1;
			}
		}
	}
	else if (groupno == 7)
	{
		if (label == 'F')
		{
			valence = 1;
			hyd = 1 - rad - conn - absCharge;
		}
		else if (label == 'Cl' || label == 'Br' ||
			label == 'I'  || label == 'At')
			{
			if (charge == 1)
			{
				if (conn <= 2)
				{
					valence = 2;
					hyd = 2 - rad - conn;
				}
				else if (conn == 3 || conn == 5 || conn >= 7)
					hyd = -1;
			}
			else if (charge == 0)
			{
				if (conn <= 1)
				{
					valence = 1;
					hyd = 1 - rad - conn;
				}
				// While the halogens can have valence 3, they can not have
				// hydrogens in that case.
				else if (conn == 2 || conn == 4 || conn == 6)
				{
					if (rad == 1)
					{
						valence = conn;
						hyd = 0;
					}
					else
						hyd = -1; // will throw an error in the end
				}
				else if (conn > 7)
					hyd = -1; // will throw an error in the end
			}
		}
	}

	this.valence = valence;
	this.implicitH = hyd;
	if (this.implicitH < 0)
	{
		this.valence = conn;
		this.implicitH = 0;
		this.badConn = true;
		return false;
	}
	return true;
};

chem.Struct.Atom.prototype.calcValenceMinusHyd = function (conn)
{
	var atom = this;
	var charge = atom.charge;
	var label = atom.label;
	var elem = chem.Element.getElementByLabel(label);
	if (elem == null)
		throw new Error("Element " + label + " unknown");
	if (elem < 0) { // query atom, skip
		this.valence = -1;
		this.implicitH = -1;
		return null;
	}

	var groupno = chem.Element.elements.get(elem).group;
	var rad = chem.Struct.radicalElectrons(atom.radical);

	if (groupno == 3)
	{
		if (label == 'B' || label == 'Al' || label == 'Ga' || label == 'In')
		{
			if (charge == -1)
				if (rad + conn <= 4)
					return rad + conn;
		}
	}
	else if (groupno == 5)
	{
		if (label == 'N' || label == 'P')
		{
			if (charge == 1)
				return rad + conn;
			if (charge == 2)
				return rad + conn;
		}
		else if (label == 'Sb' || label == 'Bi' || label == 'As')
		{
			if (charge == 1)
				return rad + conn;
			else if (charge == 2)
				return rad + conn;
		}
	}
	else if (groupno == 6)
	{
		if (label == 'O')
		{
			if (charge >= 1)
				return rad + conn;
		}
		else if (label == 'S'  || label == 'Se' || label == 'Po')
		{
			if (charge == 1)
				return rad + conn;
		}
	}
	else if (groupno == 7)
	{
		if (label == 'Cl' || label == 'Br' ||
			label == 'I'  || label == 'At')
			{
			if (charge == 1)
				return rad + conn;
		}
	}

	return rad + conn + Math.abs(charge);
};

chem.Struct.prototype.calcImplicitHydrogen = function (aid)
{
	var conn = this.calcConn(aid);
	var atom = this.atoms.get(aid);
	if (conn < 0) {
		atom.implicitH = -1;
		return;
	}
	atom.badConn = false;
	if (atom.explicitValence) {
		var elem = chem.Element.getElementByLabel(atom.label);
		atom.implicitH = 0;
		if (elem != null) {
			atom.implicitH = atom.valence - atom.calcValenceMinusHyd(conn);
			if (atom.implicitH < 0) {
				atom.implicitH = -1;
				atom.badConn = true;
			}
		}
	} else {
		atom.calcValence(conn);
	}
};