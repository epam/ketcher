/*global require, module*/

/*eslint-disable guard-for-in */
var util = require('./index');

var Map = function (obj) {
	if (typeof (obj) !== 'undefined' && obj.constructor !== Object) {
		throw Error('Passed object is not an instance of "Object"!');
	}
	this._obj = obj || {};
	this._count = 0;
};

Map.prototype.each = function (func, context) {
	var v;
	var value;
	var vInt;

	for (v in this._obj) {
		vInt = parseInt(v, 10);
		value = this._obj[v];

		if (!isNaN(vInt)) {
			v = vInt;
		}
		func.call(context, v, value);
	}
};

Map.prototype.map = function (func, context) {
	var ret = new Map();
	this.each(function (v, value) {
		ret.set(v, func.call(context, v, value));
	}, this);
	return ret;
};

Map.prototype.find = function (func, context) {
	var v;
	var vInt;
	var value;

	for (v in this._obj) {
		vInt = parseInt(v, 10);
		value = this._obj[v];

		if (!isNaN(vInt)) {
			v = vInt;
		}
		if (func.call(context, v, value)) {
			return v;
		}
	}
};

Map.prototype.findAll = function (func, context) {
	var v;
	var vInt;
	var value;
	var vv = [];

	for (v in this._obj) {
		vInt = parseInt(v, 10);
		value = this._obj[v];
		if (!isNaN(vInt)) {
			v = vInt;
		}
		if (func.call(context, v, value)) {
			vv.push(v);
		}
	}
	return vv;
};

Map.prototype.keys = function () {
	var keys = [];
	var v;
	for (v in this._obj) {
		keys.push(v);
	}
	return keys;
};

Map.prototype.ikeys = function () {
	var keys = [];
	for (var v in this._obj) {
		keys.push(v - 0);
	}
	return keys;
};

Map.prototype.set = function (key, value) {
	var val;
	this._count += (typeof value !== 'undefined' ? 1 : 0) - (typeof this._obj[key] !== 'undefined' ? 1 : 0);

	if (typeof value === 'undefined') {
		val = this._obj[key];
		delete this._obj[key];
		return val;
	}

	this._obj[key] = value;
	return value;
};

Map.prototype.get = function (key) {
	if (this._obj[key] !== Object.prototype[key]) {
		return this._obj[key];
	}
	return undefined;
};

Map.prototype.has = function (key) {
	return (this._obj[key] !== Object.prototype[key]);
};

Map.prototype.unset = function (key) {
	return this.set(key, undefined);
};

Map.prototype.update = function (object) {
	for (var v in object) {
		this.set(v, object[v]);
	}
};

Map.prototype.clear = function () {
	this._obj = {};
	this._count = 0;
};

Map.prototype.count = function () {
	return this._count;
};

Map.prototype.idList = function () {
	return util.idList(this._obj);
};

Map.prototype.keyOf = function (value) {
	for (var key in this._obj) {
		if (this._obj[key] === value) {
			return key;
		}
	}
};

module.exports = Map;
