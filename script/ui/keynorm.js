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

import keyName from 'w3c-keyname';

const mac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;

function normalizeKeyName(name) {
	let parts = name.split(/\+(?!$)/);
	let result = parts[parts.length - 1];
	if (result === 'Space') result = ' ';
	let alt;
	let	ctrl;
	let	shift;
	let	meta;

	for (let i = 0; i < parts.length - 1; i++) {
		let mod = parts[i];
		if (/^(cmd|meta|m)$/i.test(mod)) meta = true;
		else if (/^a(lt)?$/i.test(mod)) alt = true;
		else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
		else if (/^s(hift)?$/i.test(mod)) shift = true;
		else if (/^mod$/i.test(mod)) if (mac) meta = true; else ctrl = true;
		else throw new Error('Unrecognized modifier name: ' + mod);
	}

	if (alt) result = 'Alt+' + result;
	if (ctrl) result = 'Ctrl+' + result;
	if (meta) result = 'Meta+' + result;
	if (shift) result = 'Shift+' + result;

	return result;
}

function normalizeKeyMap(map) {
	const copy = Object.create(null);

	Object.keys(map).forEach((prop) => {
		copy[normalizeKeyName(prop)] = map[prop];
	});

	return copy;
}

function modifiers(name, event, shift) {
	if (event.altKey) name = 'Alt+' + name;
	if (event.ctrlKey) name = 'Ctrl+' + name;
	if (event.metaKey) name = 'Meta+' + name;
	if (shift !== false && event.shiftKey) name = 'Shift+' + name;

	return name;
}

function normalizeKeyEvent(event, base = false) {
	const name = keyName(event);
	const isChar = name.length === 1 && name !== ' ';

	return isChar && !base ? modifiers(name, event, !isChar) :
	    modifiers(keyName.base[event.keyCode], event, true);
}

function keyNorm(obj) {
	if (obj instanceof KeyboardEvent)
		return normalizeKeyEvent(...arguments); // eslint-disable-line prefer-rest-params

	return typeof obj === 'object' ? normalizeKeyMap(obj) :
		normalizeKeyName(obj);
}

function lookup(map, event) {
	const name = keyName(event);
	const isChar = name.length === 1 && name !== ' ';
	let res = map[modifiers(name, event, !isChar)];
	let baseName;

	if (event.shiftKey && isChar && (baseName = keyName.base[event.keyCode]))
		res = map[modifiers(baseName, event, true)] || res;

	return res;
}

keyNorm.lookup = lookup;

export default keyNorm;
