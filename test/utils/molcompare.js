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

'use strict';

const defaultCmpOptions = {
	stripSpaces: false,
	skipCompare: [],
	eps: 0.00011
};

const numberPattern = /-?\d+[\.,]?\d*/g;

function epsEqu(x, y, eps) {
	eps = eps || Number.EPSILON * Math.max(Math.abs(x), Math.abs(y));
	return Math.abs(x - y) <= eps;
}

function arraysEquals(sArray, rArray, eqFunc) {
	return sArray === rArray ||
		(
			sArray.length === rArray.length &&
			sArray.every((elem, index) => eqFunc ? eqFunc(elem, rArray[index]) : elem === rArray[index])
		);
}

function extractNumbers(source) {
	const matches = source.match(numberPattern);
	return {
		numbers: matches ? matches.map(parseFloat) : [],
		characters: source.replace(numberPattern, '').split(/\s+/)
	};
}

function compareFile(source, dest, options) {
	const sourceStr = source.split(/\r?\n+/);
	const destStr = dest.split(/\r?\n+/);

	for (var i = 0; i < sourceStr.length; i++) {
		if (options.stripSpaces) {
			sourceStr[i] = sourceStr[i].trim();
			destStr[i] = destStr[i].trim();
		}

		const sDataSplitted = extractNumbers(sourceStr[i]);
		const rDataSplitted = extractNumbers(destStr[i]);

		const numberEquals = arraysEquals(sDataSplitted.numbers, rDataSplitted.numbers, (x, y) => epsEqu(x, y, options.eps));
		const characterEquals = arraysEquals(sDataSplitted.characters, rDataSplitted.characters);

		if (!numberEquals || !characterEquals)
			throw new Error(`\nsource: '${sourceStr[i]}'\ndest: '${destStr[i]}'`);
	}

	return true;
}

function compareRaw(source, dest, options) {
	const sDataMols = source.split('M  END');
	const rDataMols = dest.split('M  END');
	let newSdata, newRdata;

	if (sDataMols.length !== rDataMols.length)
		throw new Error(`\nCount of content blocks are not equal: source = ${sDataMols.length}, dest = ${rDataMols.length}`);

	options = Object.assign({}, defaultCmpOptions, options);

	for (let i = 0; i < sDataMols.length - 1; i++) {
		const sV2000DataIndex = sDataMols[i].indexOf('V2000\n');
		const sV3000DataIndex = sDataMols[i].indexOf('V3000\n');

		const rV2000DataIndex = rDataMols[i].indexOf('V2000\n');
		const rV3000DataIndex = rDataMols[i].indexOf('V3000\n');

		newSdata = sDataMols[i].substring(6 + (sV3000DataIndex === -1 ? sV2000DataIndex : sV3000DataIndex));
		newRdata = rDataMols[i].substring(6 + (rV3000DataIndex === -1 ? rV2000DataIndex : rV3000DataIndex));

		if (!compareFile(newSdata, newRdata, options))
			return false;
	}
	return true;
}

function compareObjects(source, dest, options, parentKey) {
	if (typeof source !== typeof dest)
		throw new Error(`\ntypes not equal: type ${typeof source} of ${source} vs type ${typeof dest} of ${dest} in ${parentKey}`);

	if (typeof source !== 'object')
		return source === dest;

	return Object.keys(source)
		.filter(prop => !options.skipCompare.includes(prop))
		.every(key => {
			if (dest[key] === undefined)
				throw new Error(`\nDest object has no key ${key}`);

			if (!compareObjects(source[key], dest[key], options, key))
				throw new Error(`\nsource: '${source[key]}'\ndest: '${dest[key]}' in ${key}`);

			return true;
		});
}

function unicodeLiteral(str) {
	function fixedHex(number, length) {
		let str = number.toString(16).toUpperCase();
		while (str.length < length)
			str = "0" + str;
		return str;
	}
	let result = "";
	for (var i = 0; i < str.length; ++i) {
		if (str.charCodeAt(i) > 126 || str.charCodeAt(i) < 32)
			result += "\\u" + fixedHex(str.charCodeAt(i), 4);
		else
			result += str[i];
	}
	return result;
}

module.exports = {
	raw: compareRaw,
	objects: compareObjects,
	unicodeLiteral: unicodeLiteral
};
