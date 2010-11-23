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

if (!window.chem || !chem.Vec2 || !chem.Pool)
    throw new Error("Vec2, Pool should be defined first")
chem.SGroup = function (type, id)
{
    if (!type || !(type in chem.SGroup.TYPES))
        throw new Error("Invalid or unsupported s-group type");
    if (typeof(id) != 'number' || id < 0)
        throw new Error("Id should be a non-negative number");

    this.type = type;
    this.id = id;
    this.data = new chem.SGroup.TYPES[type]();
    this.visel = new rnd.Visel(rnd.Visel.TYPE.SGROUP);
}

chem.SGroup.GroupMul = function () {
	this.brackets = new chem.Box2Abs();
	this.mul = -1; // multiplication count
}

chem.SGroup.GroupMul.prototype = function (ctab) {
	var paper = ctab.paper;
	var set = paper.set();
	// TODO: find the bounding box for the atoms within the group
	//	draw the box, draw the index
	return set;
}

chem.SGroup.TYPES = {
	MUL: chem.SGroup.GroupMul
};