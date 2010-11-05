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

if (!window.chem || !chem.Map)
    throw new Error("Map should be defined first")

chem.Pool = function ()
{
    this._map = new chem.Map();
    this._counter = 0;
}

chem.Pool.prototype.add = function (obj)
{
    var id = this._counter++;
    this._map.set(id, obj);
    return id;
}

chem.Pool.prototype.get = function (id)
{
    return this._map.get(id);
}

chem.Pool.prototype.has = function (id) {
    return this._map.has(id);
}

chem.Pool.prototype.remove = function (id)
{
    return this._map.unset(id);
}

chem.Pool.prototype.clear = function ()
{
    this._map.clear();
}

chem.Pool.prototype.each = function (func, context)
{
    this._map.each(func, context);
}

chem.Pool.prototype.find = function (func, context)
{
    return this._map.find(func, context);
}

chem.Pool.prototype.count = function ()
{
    return this._map.count();
}