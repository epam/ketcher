/****************************************************************************
 * Copyright 2018 EPAM Systems
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

class Pile extends Set {
	// TODO: it's used only in dfs.js in one place in some strange way.
	// Should be removed after dfs.js refactoring
	find(predicate) {
		for (const item of this) {
			if (predicate(item))
				return item;
		}

		return null;
	}

	intersection(setB) {
		const intersection = new Pile();

		for (const item of setB) {
			if (this.has(item))
				intersection.add(item);
		}

		return intersection;
	}

	equals(setB) {
		return this.isSuperset(setB) && setB.isSuperset(this);
	}

	isSuperset(subset) {
		for (const item of subset) {
			if (!this.has(item))
				return false;
		}

		return true;
	}

	filter(filterFunc) {
		return new Pile(Array.from(this).filter(filterFunc));
	}

	union(setB) {
		const union = new Pile(this);

		for (const item of setB)
			union.add(item);

		return union;
	}
}

export default Pile;
