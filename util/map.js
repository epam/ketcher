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

if (!window.util)
    util = {};

util.Map = function (obj) {
    if (typeof(obj) != 'undefined' && obj.constructor != Object)
        throw Error("Passed object is not an instance of 'Object'!");
    this._obj = obj || {};
    this._count = 0;
};

util.Map.prototype.each = function(func, context) {
    for (var v in this._obj) {
        var v_int = parseInt(v);
        var value = this._obj[v];
        
        if (!isNaN(v_int))
            v = v_int;
        func.call(context, v, value)
    }
};

util.Map.prototype.find = function(func, context) {
    for (var v in this._obj) {
        var v_int = parseInt(v);
        var value = this._obj[v];
        
        if (!isNaN(v_int))
            v = v_int;
        if (func.call(context, v, value))
            return v;
    }
};

util.Map.prototype.findAll = function(func, context) {
    var vv = [];
    for (var v in this._obj) {
        var v_int = parseInt(v);
        var value = this._obj[v];
        if (!isNaN(v_int))
            v = v_int;
        if (func.call(context, v, value))
            vv.push(v);
    }
    return vv;
};

util.Map.prototype.keys = function() {
    var keys = [];
    for (var v in this._obj) {
        keys.push(v);
    }
    return keys;
};

util.Map.prototype.ikeys = function() {
    var keys = [];
    for (var v in this._obj) {
        keys.push(v - 0);
    }
    return keys;
};

util.Map.prototype.set = function (key, value) {
    this._count += (typeof(value) != 'undefined' ? 1 : 0)
        - (typeof(this._obj[key]) != 'undefined' ? 1 : 0);
    if (typeof(value) == 'undefined') {
        var val = this._obj[key];
        delete this._obj[key];
        return val;
    } else {
        return this._obj[key] = value;
    }
};

util.Map.prototype.get = function (key) {
    if (this._obj[key] !== Object.prototype[key])
        return this._obj[key];
    return undefined;
};

util.Map.prototype.has = function (key) {
    return (this._obj[key] !== Object.prototype[key]);
};

util.Map.prototype.unset = function (key) {
    return this.set(key, undefined);
};

util.Map.prototype.update = function (object) {
    for (var v in object)
        this.set(v, object[v]);
};

util.Map.prototype.clear = function () {
    this._obj = {};
};

util.Map.prototype.count = function () {
    return this._count;
};

util.Map.prototype.idList = function () {
    return util.idList(this._obj);
};

util.Map.prototype.keyOf = function(value) {
    for (var key in this._obj) if (this._obj[key] == value) return key;
};
