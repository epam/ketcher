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

// TODO: it's used only in dfs.js in one place in some strange way. Should be removed after dfs.js refactoring
Set.prototype.find = function (findFunc) {
	for (let item of this) {
		if (findFunc(item))
			return item;
	}

	return null;
};

Set.prototype.intersection = function (setB) {
	const intersection = new Set();

	for (let item of setB) {
		if (this.has(item))
			intersection.add(item);
	}

	return intersection;
};

Set.prototype.equals = function (setB) {
	return this.isSuperset(setB) && setB.isSuperset(this);
};

Set.prototype.isSuperset = function (subset) {
	for (let item of subset) {
		if (!this.has(item))
			return false;
	}

	return true;
};

Set.prototype.filter = function (filterFunc) {
	return new Set(Array.from(this).filter(filterFunc));
};

Set.prototype.union = function (setB) {
	const union = new Set(this);

	for (let item of setB)
		union.add(item);

	return union;
};
