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

/* eslint-disable */

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
	id = parseInt(id, 10);
	this._map.set(id, obj);
};

Pool.prototype.get = function (id) {
	id = parseInt(id, 10);
	return this._map.get(id);
};

Pool.prototype.has = function (id) {
	id = parseInt(id, 10);
	return this._map.has(id);
};

Pool.prototype.remove = function (id) {
	id = parseInt(id, 10);
	const value = this._map.get(id);
	this._map.delete(id);
	return value;
};

Pool.prototype.clear = function () {
	this._map.clear();
};

Pool.prototype.keys = function () {
	return Array.from(this._map.keys());
};

Pool.prototype.values = function () {
	return Array.from(this._map.values());
};

Pool.prototype.each = function (func) {
	const fn = (value, key) => func(key, value);
	this._map.forEach(fn);
};

Pool.prototype.count = function () {
	return this._map.size;
};

Pool.prototype.entries = function () {
	return this._map.entries();
};

Pool.prototype.keyOf = function (value) { // eslint-disable-line
	for (let [key, val] of this._map.entries()) {
		if (val === value)
			return key;
	}
};

module.exports = Pool;
