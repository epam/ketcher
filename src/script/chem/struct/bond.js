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

import Vec2 from '../../util/vec2';

function Bond(params) { // eslint-disable-line max-statements
	console.assert(params && 'begin' in params && 'end' in params && 'type' in params,
		'\'begin\', \'end\' and \'type\' properties must be specified!');

	this.begin = params.begin;
	this.end = params.end;
	this.type = params.type;
	this.xxx = params.xxx || '';
	this.stereo = Bond.PATTERN.STEREO.NONE;
	this.topology = Bond.PATTERN.TOPOLOGY.EITHER;
	this.reactingCenterStatus = 0;
	this.hb1 = null; // half-bonds
	this.hb2 = null;
	this.len = 0;
	this.sb = 0;
	this.sa = 0;
	this.angle = 0;

	if (params.stereo)
		this.stereo = params.stereo;
	if (params.topology)
		this.topology = params.topology;
	if (params.reactingCenterStatus)
		this.reactingCenterStatus = params.reactingCenterStatus;

	this.center = new Vec2();
}

Bond.PATTERN =
{
	TYPE:
	{
		SINGLE: 1,
		DOUBLE: 2,
		TRIPLE: 3,
		AROMATIC: 4,
		SINGLE_OR_DOUBLE: 5,
		SINGLE_OR_AROMATIC: 6,
		DOUBLE_OR_AROMATIC: 7,
		ANY: 8
	},

	STEREO:
	{
		NONE: 0,
		UP: 1,
		EITHER: 4,
		DOWN: 6,
		CIS_TRANS: 3
	},

	TOPOLOGY:
	{
		EITHER: 0,
		RING: 1,
		CHAIN: 2
	},

	REACTING_CENTER:
	{
		NOT_CENTER: -1,
		UNMARKED: 0,
		CENTER: 1,
		UNCHANGED: 2,
		MADE_OR_BROKEN: 4,
		ORDER_CHANGED: 8,
		MADE_OR_BROKEN_AND_CHANGED: 12
	}
};

Bond.attrlist = {
	type: Bond.PATTERN.TYPE.SINGLE,
	stereo: Bond.PATTERN.STEREO.NONE,
	topology: Bond.PATTERN.TOPOLOGY.EITHER,
	reactingCenterStatus: Bond.PATTERN.REACTING_CENTER.UNMARKED
};

Bond.getAttrHash = function (bond) {
	var attrs = {};
	for (var attr in Bond.attrlist) {
		if (typeof (bond[attr]) !== 'undefined')
			attrs[attr] = bond[attr];
	}
	return attrs;
};

Bond.attrGetDefault = function (attr) {
	if (attr in Bond.attrlist)
		return Bond.attrlist[attr];
	return console.error('Attribute unknown');
};

Bond.prototype.hasRxnProps = function () {
	return !!this.reactingCenterStatus;
};

Bond.prototype.getCenter = function (struct) {
	var p1 = struct.atoms.get(this.begin).pp;
	var p2 = struct.atoms.get(this.end).pp;
	return Vec2.lc2(p1, 0.5, p2, 0.5);
};

Bond.prototype.getDir = function (struct) {
	var p1 = struct.atoms.get(this.begin).pp;
	var p2 = struct.atoms.get(this.end).pp;
	return p2.sub(p1).normalized();
};

/**
 * @param aidMap { Map<number, number> }
 * @returns {Bond}
 */
Bond.prototype.clone = function (aidMap) {
	const cp = new Bond(this);
	if (aidMap) {
		cp.begin = aidMap.get(cp.begin);
		cp.end = aidMap.get(cp.end);
	}
	return cp;
};

export default Bond;
