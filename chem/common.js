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

if (!window.chem)
    chem = {};

Array.prototype.swap = function (i1, i2)
{
	var tmp = this[i1];
	this[i1] = this[i2];
	this[i2] = tmp;
}

// piece of browser detection code from prototype.js
chem.isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
chem.isIE = !!window.attachEvent && !chem.isOpera;
chem.isWebKit = navigator.userAgent.indexOf('AppleWebKit/') > -1;
chem.isGecko = navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1;
chem.isMobileSafari = /Apple.*Mobile.*Safari/.test(navigator.userAgent);

// "each" function for an array
chem.each = function (array, func, context) {
    for (var i = 0; i < array.length; ++i)
        func.call(context, array[i], i)
}

chem.array = function (arrayLike) {
    var a = [], i = arrayLike.length;
    while (--i >= 0)
        a[i] = arrayLike[i];
    return a;
}

chem.isEmpty = function (obj) {
    for (var v in obj)
        return false;
    return true;
}

chem.stopEventPropagation = function (event) {
    if ('stopPropagation' in event) // Mozilla, Opera, Safari
        event.stopPropagation();
    else if ('cancelBubble' in event) // IE
        event.cancelBubble = true;
    else
        throw Error("Browser unrecognized");
}

chem.preventDefault = function (event) {
    if ('preventDefault' in event)
        event.preventDefault();
    if (Prototype.Browser.IE)
    {
        event.returnValue = false;
        event.keyCode = 0;
    }
    return false;
}

chem.setElementTextContent = function (element, text)
{
    if ('textContent' in element) // Mozilla, Opera, Safari
        element.textContent = text;
    else if ('innerText' in element) // IE and others (except Mozilla)
        element.innerText = text;
    else
        throw Error("Browser unrecognized");
}

chem.getElementTextContent = function (element)
{
    if ('textContent' in element) // Mozilla, Opera, Safari
        return element.textContent;
    else if ('innerText' in element) // IE and others (except Mozilla)
        return element.innerText;
    else
        throw Error("Browser unrecognized");
}
