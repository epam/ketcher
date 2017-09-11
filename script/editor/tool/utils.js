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

var Vec2 = require('../../util/vec2');

var FRAC = Math.PI / 12; // '15º'

function setFracAngle(angle) {
	FRAC = Math.PI / 180 * angle;
}

function calcAngle(pos0, pos1) {
	var v = Vec2.diff(pos1, pos0);
	return Math.atan2(v.y, v.x);
}

function fracAngle(angle) {
	if (arguments.length > 1)
		angle = calcAngle(arguments[0], arguments[1]);
	return Math.round(angle / FRAC) * FRAC;
}

function calcNewAtomPos(pos0, pos1) {
	var v = new Vec2(1, 0).rotate(fracAngle(pos0, pos1));
	v.add_(pos0); // eslint-disable-line no-underscore-dangle
	return v;
}

function degrees(angle) {
	return Math.round(angle / Math.PI * 180);
}

module.exports = {
	calcAngle: calcAngle,
	fracAngle: fracAngle,
	calcNewAtomPos: calcNewAtomPos,
	degrees: degrees,
	setFracAngle: setFracAngle
};
