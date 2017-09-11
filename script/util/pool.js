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

var Map = require('./map.js');

function Pool() {
	this._map = new Map();
	this._nextId = 0;
}

Pool.prototype.newId = function () {
	return this._nextId++;
};

Pool.prototype.add = function (obj) {
	var id = this._nextId++;
	this._map.set(id, obj);
	return id;
};

Pool.prototype.set = function (id, obj) {
	this._map.set(id, obj);
};

Pool.prototype.get = function (id) {
	return this._map.get(id);
};

Pool.prototype.has = function (id) {
	return this._map.has(id);
};

Pool.prototype.remove = function (id) {
	return this._map.unset(id);
};

Pool.prototype.clear = function () {
	this._map.clear();
};

Pool.prototype.keys = function () {
	return this._map.keys();
};

Pool.prototype.ikeys = function () {
	return this._map.ikeys();
};

Pool.prototype.values = function () {
	return this._map.values();
};

Pool.prototype.each = function (func, context) {
	this._map.each(func, context);
};

Pool.prototype.map = function (func, context) {
	return this._map.map(func, context);
};

Pool.prototype.find = function (func, context) {
	return this._map.find(func, context);
};

Pool.prototype.count = function () {
	return this._map.count();
};

Pool.prototype.keyOf = function (value) {
	return this._map.keyOf(value);
};

module.exports = Pool;
