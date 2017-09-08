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

/* local storage */
const storage = {
	getItem: function (key) {
		let item = null;
		try {
			item = JSON.parse(localStorage.getItem(key));
		} catch (ex) {
			console.info('LocalStorage:', ex.name);
		}
		return item;
	},
	setItem: function (key, data) {
		let isSet = null;
		try {
			localStorage.setItem(key, JSON.stringify(data));
			isSet = true;
		} catch (ex) {
			console.info('LocalStorage:', ex.name);
			isSet = false;
		}
		return isSet;
	}
};

/* schema utils */
function constant(schema, prop) {
	let desc = schema.properties[prop];
	return desc.constant || desc.enum[0]; // see https://git.io/v6hyP
}

function mapOf(schema, prop) {
	console.assert(schema.oneOf);
	return schema.oneOf.reduce((res, desc) => {
		res[constant(desc, prop)] = desc;
		return res;
	}, {});
}

function selectListOf(schema, prop) {
	let desc = schema.properties && schema.properties[prop];
	if (desc)
		return desc.enum.map((value, i) => {
			let title = desc.enumNames && desc.enumNames[i];
			return title ? { title, value } : value;
		});
	return schema.oneOf.map(desc => (
		!desc.title ? constant(desc, prop) : {
			title: desc.title,
			value: constant(desc, prop)
		}
	));
}

module.exports = {
	mapOf: mapOf,
	selectListOf: selectListOf,
	storage: storage
};
