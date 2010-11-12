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

if (!window.chem || !window.rnd || !rnd.MolData)
    throw new Error("Include MolData.js first");

rnd.MolData.prototype.calcConn = function (aid)
{
    var conn = 0;
    var atom = this.atoms.get(aid);
    for (var i = 0; i < atom.neighbors.length; ++i) {
        var hb = this.halfBonds.get(atom.neighbors[i]);
        var bond = this.bonds.get(hb.bid);
        switch (bond.b.type) {
            case chem.Molecule.BOND.TYPE.SINGLE:
                conn += 1;
                break;
            case chem.Molecule.BOND.TYPE.DOUBLE:
                conn += 2;
                break;
            case chem.Molecule.BOND.TYPE.TRIPLE:
                conn += 3;
                break;
            case chem.Molecule.BOND.TYPE.AROMATIC:
                conn += 1.5;
                break;
            default:
                return -1;
        }
    }
    return conn;
}

rnd.AtomData.prototype.calcValence = function (conn)
{
    var atom = this.a;
    var charge = atom.charge;
    var label = atom.label;
	if (atom.isQuery()) {
		this.valence = -1;
        this.a.implicitH = -1;
        return true;
	}
    var elem = chem.Element.getElementByLabel(label);
    if (elem == null)
        throw new Error("Element \"" + label + "\" unknown");

    var groupno = chem.Element.elements.get(elem).group;
    var rad = chem.Molecule.radicalElectrons(atom.radical);

    this.valence = conn;
    this.a.implicitH = 0;

    if (groupno == 1)
    {
        if (label == 'H' || label == 'Li' || label == 'Na' || label == 'K' ||
             label == 'Rb' || label == 'Cs' || label == 'Fr')
        {
            this.valence = 1;
            this.a.implicitH = 1 - rad - conn - Math.abs(charge);
        }
    }
    else if (groupno == 3)
    {
        if (label == 'B' || label == 'Al' || label == 'Ga' || label == 'In')
        {
            if (charge == -1)
            {
                if (rad + conn <= 4)
                {
                    this.valence = 4;
                    this.a.implicitH = 4 - rad - conn;
                }
            }
            else if (rad + conn + Math.abs(charge) <= 3)
            {
                this.valence = 3;
                this.a.implicitH = 3 - rad - conn - Math.abs(charge);
            }
        }
        else if (label == 'Tl')
        {
            if (conn == 0 && rad == 0)
            {
                if (rad + Math.abs(charge) <= 1)
                {
                    this.valence = 1;
                    this.a.implicitH = 1 - rad - Math.abs(charge);
                }
                else
                {
                    this.valence = 3;
                    this.a.implicitH = 3 - Math.abs(charge);
                }
            }
        }
    }
    else if (groupno == 4)
    {
        if (label == 'C')
        {
            this.valence = 4;
            this.a.implicitH = 4 - rad - conn - Math.abs(charge);
        }
        else if (label == 'Si' || label == 'Sn' || label == 'Ge')
        {
            if (conn + rad + Math.abs(charge) <= 4)
            {
                this.valence = 4;
                this.a.implicitH = 4 - rad - conn - Math.abs(charge);
            }
        }
        else if (label == 'Pb')
        {
            if (rad + conn + Math.abs(charge) <= 2)
            {
                this.valence = 2;
                this.a.implicitH = 2 - rad - conn - Math.abs(charge);
            }
            else
            {
                this.valence = 4;
                this.a.implicitH = 4 - rad - conn - Math.abs(charge);
            }
        }
    }
    else if (groupno == 5)
    {
        if (label == 'N')
        {
            if (charge == 1)
            {
                this.valence = 4;
                this.a.implicitH = 4 - rad - conn;
            }
            else if (charge == 2)
            {
                this.valence = 3;
                this.a.implicitH = 3 - rad - conn;
            }
            else
            {
                this.valence = 3;
                this.a.implicitH = 3 - rad - conn - Math.abs(charge);
            }
        }
        else if (label == 'P' || label == 'Sb' || label == 'Bi')
        {
            if (conn < 4)
            {
                if (charge == 1)
                {
                    this.valence = 4;
                    this.a.implicitH = 4 - rad - conn;
                }
                else if (charge == 2)
                {
                    this.valence = 3;
                    this.a.implicitH = 3 - rad - conn;
                }
                else if (rad + conn + Math.abs(charge) <= 3)
                {
                    this.valence = 3;
                    this.a.implicitH = 3 - rad - conn - Math.abs(charge);
                }
            }
            else
            {
                if (charge == 0 && conn + rad <= 5)
                {
                    this.valence = 5;
                    this.a.implicitH = 5 - rad - conn;
                }
            }
        }
        else if (label == 'As')
        {
            if (conn < 4)
            {
                if (charge == 1)
                {
                    this.valence = 4;
                    this.a.implicitH = 4 - rad - conn;
                }
                else if (rad + conn + Math.abs(charge) <= 3)
                {
                    this.valence = 3;
                    this.a.implicitH = 3 - rad - conn - Math.abs(charge);
                }
            }
            else
            {
                if (charge == 0 && conn + rad <= 5)
                {
                    this.valence = 5;
                    this.a.implicitH = 5 - rad - conn;
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
                this.valence = 3;
                this.a.implicitH = 3 - rad - conn;
            }
            else
            {
                this.valence = 2;
                this.a.implicitH = 2 - rad - conn - Math.abs(charge);
            }
        }
        else if (label == 'S'  || label == 'Se' ||
                    label == 'Po')
        {
            if (charge == 1)
            {
                if (conn <= 3)
                {
                    this.valence = 3;
                    this.a.implicitH = 3 - rad - conn;
                }
            }
            else
            {
                if (conn + rad + Math.abs(charge) <= 2)
                {
                    this.valence = 2;
                    this.a.implicitH = 2 - rad - conn - Math.abs(charge);
                }
            }
        }
        else if (label == 'Te')
        {
            if (charge <= 0)
            {
                if (conn <= 2)
                {
                    this.valence = 2;
                    this.a.implicitH = 2 - rad - conn - Math.abs(charge);
                }
            }
            else
            {
                if (conn <= 4)
                {
                    this.valence = 4;
                    this.a.implicitH = 4 - rad - conn - Math.abs(charge);
                }
            }
        }
    }
    else if (groupno == 7)
    {
        if (label == 'F')
        {
            if (rad + conn + Math.abs(charge) <= 1)
            {
                this.valence = 1;
                this.a.implicitH = 1 - rad - conn - Math.abs(charge);
            }
        }
        else if (label == 'Cl' || label == 'Br' ||
                    label == 'I'  || label == 'At')
        {
            if (charge == 1)
            {
                if (conn <= 2)
                {
                    this.valence = 2;
                    this.a.implicitH = 2 - rad - conn;
                }
            }
            else if (charge == 0)
            {
                if (conn <= 1)
                {
                    this.valence = 1;
                    this.a.implicitH = 1 - rad - conn;
                }
                else if (conn <= 3)
                {
                    this.valence = 3;
                    this.a.implicitH = 3 - rad - conn;
                }
            }
        }
    }

    if (this.a.implicitH < 0)
    {
        this.valence = conn;
        this.a.implicitH = 0;
        this.badConn = true;
        return false;
    }
    return true;
}

rnd.AtomData.prototype.calcValenceMinusHyd = function (conn)
{
    var atom = this.a;
    var charge = atom.charge;
    var label = atom.label;
    var elem = chem.Element.getElementByLabel(label);
    if (elem == null)
        throw new Error("Element " + elem + " unknown");
    if (elem < 0) { // query atom, skip
        this.valence = -1;
        this.a.implicitH = -1;
        return null;
    }

    var groupno = chem.Element.elements.get(elem).group;
    var rad = chem.Molecule.radicalElectrons(atom.radical);

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
        if (label == 'N')
        {
            if (charge == 1)
                return rad + conn;
            if (charge == 2)
                return rad + conn;
        }
        else if (label == 'P' || label == 'Sb' || label == 'Bi')
        {
            if (conn < 4)
            {
                if (charge == 1)
                    return rad + conn;
                if (charge == 2)
                    return rad + conn;
            }
        }
        else if (label == 'As')
        {
            if (conn < 4)
            {
                if (charge == 1)
                    return rad + conn;
            }
        }
    }
    else if (groupno == 6)
    {
        if (label == 'O')
        {
            if (charge >= 1)
                return rad + conn;
        }
        else if (label == 'S'  || label == 'Se' ||
                    label == 'Po')
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
}

rnd.MolData.prototype.calcImplicitHydrogen = function (aid)
{
    var conn = this.calcConn(aid);
    var atom = this.atoms.get(aid);
    if (conn < 0) {
        atom.a.implicitH = -1;
        return;
    }
    if (atom.a.explicitValence) {
        atom.a.implicitH = atom.a.valence - atom.calcValenceMinusHyd(conn);
        if (atom.a.implicitH < 0) {
            atom.a.implicitH = -1;
            atom.badConn = true;
        }
    } else {
        atom.badConn = false;
        atom.calcValence(conn);
    }
}