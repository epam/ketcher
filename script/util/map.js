/*global global:false, util:false*/

/*eslint-disable guard-for-in */

var util = global.util = global.util || {}; // jshint ignore:line

util.Map = function (obj) {
	if (typeof (obj) !== 'undefined' && obj.constructor !== Object) {
		throw Error('Passed object is not an instance of "Object"!');
	}
	this._obj = obj || {};
	this._count = 0;
};

util.Map.prototype.each = function (func, context) {
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

util.Map.prototype.map = function (func, context) {
	var ret = new util.Map();
	this.each(function (v, value) {
		ret.set(v, func.call(context, v, value));
	}, this);
	return ret;
};

util.Map.prototype.find = function (func, context) {
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

util.Map.prototype.findAll = function (func, context) {
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

util.Map.prototype.keys = function () {
	var keys = [];
	var v;
	for (v in this._obj) {
		keys.push(v);
	}
	return keys;
};

util.Map.prototype.ikeys = function () {
	var keys = [];
	for (var v in this._obj) {
		keys.push(v - 0);
	}
	return keys;
};

util.Map.prototype.set = function (key, value) {
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

util.Map.prototype.get = function (key) {
	if (this._obj[key] !== Object.prototype[key]) {
		return this._obj[key];
	}
	return undefined;
};

util.Map.prototype.has = function (key) {
	return (this._obj[key] !== Object.prototype[key]);
};

util.Map.prototype.unset = function (key) {
	return this.set(key, undefined);
};

util.Map.prototype.update = function (object) {
	for (var v in object) {
		this.set(v, object[v]);
	}
};

util.Map.prototype.clear = function () {
	this._obj = {};
	this._count = 0;
};

util.Map.prototype.count = function () {
	return this._count;
};

util.Map.prototype.idList = function () {
	return util.idList(this._obj);
};

util.Map.prototype.keyOf = function (value) {
	for (var key in this._obj) {
		if (this._obj[key] === value) {
			return key;
		}
	}
};
