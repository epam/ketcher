var tfx = function (v) {
	return (v - 0).toFixed(8);
};

var relBox = function (box) {
	return {
		x: box.x,
		y: box.y,
		width: box.width,
		height: box.height
	};
};

var stopEventPropagation = function (event) {
	if ('stopPropagation' in event) {// Mozilla, Opera, Safari
		event.stopPropagation();
	} else if ('cancelBubble' in event) {// IE
		event.cancelBubble = true;
	} else {
		throw Error('Browser unrecognized');
	}
};

var preventDefault = function (event) {
	if ('preventDefault' in event) {
		event.preventDefault();
	}
	if (Prototype.Browser.IE) {
		event.returnValue = false;
		event.keyCode = 0;
	}
	return false;
};

function unicodeLiteral(str){
	function fixedHex(number, length){
		var str = number.toString(16).toUpperCase();
		while(str.length < length)
			str = "0" + str;
		return str;
	}
	var i;
	var result = "";
	for( i = 0; i < str.length; ++i){
		if(str.charCodeAt(i) > 126 || str.charCodeAt(i) < 32)
			result += "\\u" + fixedHex(str.charCodeAt(i),4);
		else
			result += str[i];
	}
	return result;
}

var ifDef = function (dst, src, prop, def) {
	dst[prop] = !Object.isUndefined(src[prop]) ? src[prop] : def;
};

var identityMap = function (array) {
	var map = {};
	for (var i = 0; i < array.length; ++i) {
		map[array[i]] = array[i];
	}
	return map;
};

var arrayAddIfMissing = function (array, item) {
	for (var i = 0; i < array.length; ++i) {
		if (array[i] === item) {
			return false;
		}
	}
	array.push(item);
	return true;
};

var assert = function (condition, comment) {
	if (!condition) {
		throw new Error(comment ? ('Assertion failed: ' + comment) : 'Assertion failed');
	}
};

var assertDefined = function(v) {
	assert(!isNullOrUndefined(v));
};

var isEmpty = function (obj) {
	for (var v in obj) {
		if (obj.hasOwnProperty(v)) {
			return false;
		}
	}
	return true;
};

var isUndefined = function (variable) {
	return Object.isUndefined(variable); // use prototype.js method for now
};

var isNull = function (variable) {
	return variable === null;
};

var isNullOrUndefined = function (v) {
	return isUndefined(v) || isNull(v);
};

var isObject = function (obj) {
	return obj === Object(obj);
};

module.exports = {
	tfx: tfx,
	isEmpty: isEmpty,
	stopEventPropagation: stopEventPropagation,
	preventDefault: preventDefault,
	unicodeLiteral: unicodeLiteral,
	ifDef: ifDef,
	identityMap: identityMap,
	arrayAddIfMissing: arrayAddIfMissing,
	assert: assert,
	assertDefined: assertDefined,
	isUndefined: isUndefined,
	isNull: isNull,
	isNullOrUndefined: isNullOrUndefined,
	isObject: isObject,
	relBox: relBox
};
