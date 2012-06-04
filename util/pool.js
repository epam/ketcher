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

if (!window.util || !util.Map)
    throw new Error("Map should be defined first");

util.Pool = function ()
{
    this._map = new util.Map();
    this._nextId = 0;
};

util.Pool.prototype.newId = function ()
{
    return this._nextId++;
};

util.Pool.prototype.add = function (obj)
{
    var id = this._nextId++;
    this._map.set(id, obj);
    return id;
};

util.Pool.prototype.set = function (id, obj)
{
    this._map.set(id, obj);
};

util.Pool.prototype.get = function (id)
{
    return this._map.get(id);
};

util.Pool.prototype.has = function (id) {
    return this._map.has(id);
};

util.Pool.prototype.remove = function (id)
{
    return this._map.unset(id);
};

util.Pool.prototype.clear = function ()
{
    this._map.clear();
};

util.Pool.prototype.keys = function ()
{
	return this._map.keys();
};

util.Pool.prototype.ikeys = function ()
{
	return this._map.ikeys();
};

util.Pool.prototype.each = function (func, context)
{
    this._map.each(func, context);
};

util.Pool.prototype.find = function (func, context)
{
    return this._map.find(func, context);
};

util.Pool.prototype.count = function ()
{
    return this._map.count();
};

util.Pool.prototype.keyOf = function(value) {
    return this._map.keyOf(value);
};
