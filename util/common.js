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

var EventMap =
{
    mousemove: 'mousemove',
    mousedown: 'mousedown',
    mouseup  : 'mouseup'
};

Array.prototype.swap = function (i1, i2)
{
	var tmp = this[i1];
	this[i1] = this[i2];
	this[i2] = tmp;
};

// "each" function for an array
util.each = function (array, func, context) {
    for (var i = 0; i < array.length; ++i)
        func.call(context, array[i], i)
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

util.setElementTextContent = function (element, text)
{
    if ('textContent' in element) // Mozilla, Opera, Safari
        element.textContent = text;
    else if ('innerText' in element) // IE and others (except Mozilla)
        element.innerText = text;
    else
        throw Error("Browser unrecognized");
};

util.getElementTextContent = function (element)
{
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

util.apply = function (array, func) {
	for (var i = 0; i < array.length; ++i)
		array[i] = func(array[i]);
};

util.ifDef = function (dst, src, prop, def)
{
	dst[prop] = !Object.isUndefined(src[prop]) ? src[prop] : def;
};

util.ifDefList = function (dst, src, prop, def)
{
	dst[prop] = !Object.isUndefined(src[prop]) && src[prop] != null ? util.array(src[prop]) : def;
};

util.identityMap = function (array) {
	var map = {};
	for (var i = 0; i < array.length; ++i)
		map[array[i]] = array[i];
	return map;
};

util.stripRight = function (src) {
	var i;
	for (i = 0; i < src.length; ++i)
		if (src[src.lenght - i - 1] != ' ')
			break;
	return src.slice(0, src.length - i);
};

util.stripQuotes = function (str) {
       if (str[0] == '"' && str[str.length - 1] == '"')
               return str.substr(1,str.length-2);
       return str;
}

util.paddedFloat = function (number, width, precision)
{
	var numStr = number.toFixed(precision).replace(',', '.');
	if (numStr.length > width)
		throw new Error("number does not fit");
	return util.stringPadded(numStr, width);
};

util.paddedInt = function (number, width)
{
	var numStr = number.toFixed(0);
	if (numStr.length > width) {
		throw new Error("number does not fit");
	}
	return util.stringPadded(numStr, width);
};

util.arrayAddIfMissing = function (array, item)
{
	for (var i = 0; i < array.length; ++i)
		if (array[i] == item)
			return false;
	array.push(item);
	return true;
};
