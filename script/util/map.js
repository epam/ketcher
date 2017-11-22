/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/* eslint-disable no-underscore-dangle*/

function Map(obj) {
	if (typeof (obj) !== 'undefined' && obj.constructor !== Object)
		throw Error('Passed object is not an instance of "Object"!');
	this._obj = obj || {};
	this._count = 0;
}

Map.prototype.each = function (func, context) {
	var v,
		value,
		vInt;

	for (v in this._obj) {
		vInt = parseInt(v, 10);
		value = this._obj[v];

		if (!isNaN(vInt)) // eslint-disable-line
			v = vInt;
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
	var v,
		vInt,
		value;

	for (v in this._obj) {
		vInt = parseInt(v, 10);
		value = this._obj[v];

		if (!isNaN(vInt)) // eslint-disable-line
			v = vInt;
		if (func.call(context, v, value))
			return v;
	}
};

Map.prototype.findAll = function (func, context) {
	var v,
		vInt,
		value,
		vv = [];

	for (v in this._obj) {
		vInt = parseInt(v, 10);
		value = this._obj[v];
		if (!isNaN(vInt)) // eslint-disable-line
			v = vInt;
		if (func.call(context, v, value))
			vv.push(v);
	}
	return vv;
};

Map.prototype.keys = function () {
	var keys = [],
		v;
	for (v in this._obj)
		keys.push(v);
	return keys;
};

Map.prototype.ikeys = function () {
	var keys = [];
	for (var v in this._obj)
		keys.push(v - 0);
	return keys;
};

Map.prototype.values = function () {
	var values = [];
	for (var v in this._obj)
		values.push(this._obj[v]);
	return values;
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
	if (this._obj[key] !== Object.prototype[key])
		return this._obj[key];
	return undefined;
};

Map.prototype.has = function (key) {
	return (this._obj[key] !== Object.prototype[key]);
};

Map.prototype.unset = function (key) {
	return this.set(key, undefined);
};

Map.prototype.update = function (object) {
	for (var v in object)
		this.set(v, object[v]);
};

Map.prototype.clear = function () {
	this._obj = {};
	this._count = 0;
};

Map.prototype.count = function () {
	return this._count;
};

Map.prototype.idList = function () {
	return Object.keys(this._obj);
};

Map.prototype.keyOf = function (value) {
	for (var key in this._obj) {
		if (this._obj[key] === value)
			return key;
	}
};

module.exports = Map;
