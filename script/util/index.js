function tfx(v) {
	return (v - 0).toFixed(8);
}

function relBox(box) {
	return {
		x: box.x,
		y: box.y,
		width: box.width,
		height: box.height
	};
}

function unicodeLiteral(str) {
	function fixedHex(number, length) {
		var str = number.toString(16).toUpperCase();
		while (str.length < length)
			str = "0" + str;
		return str;
	}
	var i,
		result = "";
	for (i = 0; i < str.length; ++i) {
		if (str.charCodeAt(i) > 126 || str.charCodeAt(i) < 32)
			result += "\\u" + fixedHex(str.charCodeAt(i), 4);
		else
			result += str[i];
	}
	return result;
}

function ifDef(dst, src, prop, def) {
	dst[prop] = !(typeof src[prop] === 'undefined') ? src[prop] : def;
}

function assert(condition, comment) {
	if (!condition)
		throw new Error(comment ? ('Assertion failed: ' + comment) : 'Assertion failed');
}

function assertDefined(v) {
	assert(!isNullOrUndefined(v));
}

function isUndefined(variable) {
	return (typeof variable === 'undefined');
}

function isNull(variable) {
	return variable === null;
}

function isNullOrUndefined(v) {
	return isUndefined(v) || isNull(v);
}

function isObject(obj) {
	return obj === Object(obj);
}

module.exports = {
	tfx: tfx,
	unicodeLiteral: unicodeLiteral,
	ifDef: ifDef,
	assert: assert,
	assertDefined: assertDefined,
	isUndefined: isUndefined,
	isNull: isNull,
	isNullOrUndefined: isNullOrUndefined,
	isObject: isObject,
	relBox: relBox
};
