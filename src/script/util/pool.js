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

class Pool extends Map {
	constructor(arg) {
		super(arg);
		this._nextId = 0;
	}

	add(item) {
		const id = this._nextId++;
		super.set(id, item);
		return id;
	}

	newId() {
		return this._nextId++;
	}

	keyOf(item) {
		for (const [key, value] of this.entries()) {
			if (value === item)
				return key;
		}

		return null;
	}

	find(predicate) {
		for (const [key, value] of this.entries()) {
			if (predicate(key, value))
				return key;
		}

		return null;
	}

	filter(predicate) {
		return new Pool(Array.from(this).filter(([key, value]) => predicate(key, value)));
	}
}

export default Pool;
