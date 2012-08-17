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

// Visel is a shorthand for VISual ELement
// It corresponds to a visualization (i.e. set of paths) of an atom or a bond.
if (!window.chem || !util.Vec2 || !chem.Struct || !window.rnd)
	throw new Error("Vec2 and Molecule, should be defined first");

rnd.Visel = function (type)
{
	this.type = type;
	this.paths = [];
	this.boxes = [];
	this.boundingBox = null;
};

rnd.Visel.TYPE = {
    'ATOM' : 1,
    'BOND' : 2,
    'LOOP' : 3,
    'ARROW' : 4,
    'PLUS' : 5,
    'SGROUP' : 6,
    'TMP' : 7, // [MK] TODO: do we still need it?
    'FRAGMENT' : 8,
    'RGROUP' : 9,
    'CHIRAL_FLAG' : 10
};

rnd.Visel.prototype.add = function (path, bb)
{
	this.paths.push(path);
	if (bb != null) {
		this.boxes.push(bb);
		this.boundingBox = this.boundingBox == null ? bb : util.Box2Abs.union(this.boundingBox, bb);
	}
};

rnd.Visel.prototype.clear = function ()
{
	this.paths = [];
	this.boxes = [];
	this.boundingBox = null;
};
