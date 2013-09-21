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

var EventMap = {
    mousemove: 'mousemove',
    mousedown: 'mousedown',
    mouseup  : 'mouseup'
};

Array.prototype.swap = function (i1, i2) {
	var tmp = this[i1];
	this[i1] = this[i2];
	this[i2] = tmp;
};

// "each" function for an array
util.each = function (array, func, context) {
    util.assert(!util.isNullOrUndefined(array), "array must be defined");
    for (var i = 0; i < array.length; ++i)
        func.call(context, array[i], i);
};

util.map_each = function (map, func, context) {
    util.assert(!util.isNullOrUndefined(map), "map must be defined");
    for (var key in map)
        func.call(context, key, map[key]);
};

util.find = function (array, func, context) {
    for (var i = 0; i < array.length; ++i)
        if (func.call(context, array[i], i))
            return i;
    return -1;
};

util.findAll = function (array, func, context) {
    var ret = [];
    for (var i = 0; i < array.length; ++i)
        if (func.call(context, array[i], i))
            ret.push(array[i]);
    return ret;
};

util.array = function (arrayLike) {
    var a = [], i = arrayLike.length;
    while (--i >= 0)
        a[i] = arrayLike[i];
    return a;
};

util.isEmpty = function (obj) {
    for (var v in obj)
        return false;
    return true;
};

util.stopEventPropagation = function (event) {
    if ('stopPropagation' in event) // Mozilla, Opera, Safari
        event.stopPropagation();
    else if ('cancelBubble' in event) // IE
        event.cancelBubble = true;
    else
        throw Error("Browser unrecognized");
};

util.preventDefault = function (event) {
    if ('preventDefault' in event)
        event.preventDefault();
    if (Prototype.Browser.IE)
    {
        event.returnValue = false;
        event.keyCode = 0;
    }
    return false;
};

util.setElementTextContent = function (element, text) {
    if ('textContent' in element) // Mozilla, Opera, Safari
        element.textContent = text;
    else if ('innerText' in element) // IE and others (except Mozilla)
        element.innerText = text;
    else
        throw Error("Browser unrecognized");
};

util.getElementTextContent = function (element) {
    if ('textContent' in element) // Mozilla, Opera, Safari
        return element.textContent;
    else if ('innerText' in element) // IE and others (except Mozilla)
        return element.innerText;
    else
        throw Error("Browser unrecognized");
};

util.stringPadded = function (string, width, leftAligned) {
	string += '';
	var space = '';
	while (string.length + space.length < width)
		space += ' ';
	if (leftAligned)
		return string + space;
	else
		return space + string;
};

util.idList = function (object) {
	var list = [];
	for (var aid in object) {
		list.push(aid);
	}
	return list;
};

util.mapArray = function (src, map) {
	var dst = [];
	for (var i = 0; i < src.length; ++i) {
		dst.push(map[src[i]]);
	}
	return dst;
};

util.arrayMax = function (array) {
    return Math.max.apply( Math, array );
};

util.arrayMin = function (array) {
    return Math.min.apply( Math, array );
};

util.map = function (src, func, context) {
	var dst = [];
	for (var i = 0; i < src.length; ++i) {
		dst.push(func.call(context, src[i]));
	}
	return dst;
};

util.apply = function (array, func) {
	for (var i = 0; i < array.length; ++i)
		array[i] = func(array[i]);
};

util.ifDef = function (dst, src, prop, def) {
	dst[prop] = !Object.isUndefined(src[prop]) ? src[prop] : def;
};

util.ifDefList = function (dst, src, prop, def) {
	dst[prop] = !Object.isUndefined(src[prop]) && src[prop] !== null ? util.array(src[prop]) : def;
};

util.identityMap = function (array) {
	var map = {};
	for (var i = 0; i < array.length; ++i)
		map[array[i]] = array[i];
	return map;
};

util.strip = function(src) {
    return src.replace(/\s*$/, '').replace(/^\s*/, '');
};

util.stripRight = function (src) {
        return src.replace(/\s*$/,'');
};

util.stripQuotes = function (str) {
       if (str[0] === '"' && str[str.length - 1] === '"')
               return str.substr(1,str.length-2);
       return str;
};

util.paddedFloat = function (number, width, precision) {
	var numStr = number.toFixed(precision).replace(',', '.');
	if (numStr.length > width)
		throw new Error("number does not fit");
	return util.stringPadded(numStr, width);
};

util.paddedInt = function (number, width) {
	var numStr = number.toFixed(0);
	if (numStr.length > width) {
		throw new Error("number does not fit");
	}
	return util.stringPadded(numStr, width);
};

util.arrayAddIfMissing = function (array, item) {
	for (var i = 0; i < array.length; ++i)
		if (array[i] === item)
			return false;
	array.push(item);
	return true;
};

util.assert = function (condition, comment) {
    if (!condition)
        throw new Error(comment ? ("Assertion failed: " + comment) : "Assertion failed");
};

util.isUndefined = function (variable) {
    return Object.isUndefined(variable); // use prototype.js method for now
};

util.isNull = function (variable) {
    return variable === null;
};

util.isNullOrUndefined = function (v) {
    return util.isUndefined(v) || util.isNull(v);
};

util.arrayRemoveByValue = function(array, item) {
    util.assert(!util.isUndefined(array) && !util.isNull(array), "array must be defined");
    var idx = array.indexOf(item);
    var cnt = 0;
    while (idx >= 0) {
        array.splice(idx, 1);
        cnt += 1;
        idx = array.indexOf(item);
    }
    return cnt;
};

util.listNextRotate = function(list, value) {
    return list[(list.indexOf(value) + 1) % list.length];
}