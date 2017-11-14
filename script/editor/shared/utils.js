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

import Vec2 from '../../util/vec2';
import { inRange } from 'lodash';

let FRAC = Math.PI / 12; // '15º'

function setFracAngle(angle) {
	FRAC = Math.PI / 180 * angle;
}

function calcAngle(pos0, pos1) {
	const v = Vec2.diff(pos1, pos0);
	return Math.atan2(v.y, v.x);
}

function fracAngle(angle) {
	if (arguments.length > 1)
		angle = calcAngle(arguments[0], arguments[1]);
	return Math.round(angle / FRAC) * FRAC;
}

function calcNewAtomPos(pos0, pos1) {
	const v = new Vec2(1, 0).rotate(fracAngle(pos0, pos1));
	v.add_(pos0); // eslint-disable-line no-underscore-dangle
	return v;
}

function degrees(angle) {
	return Math.round(angle / Math.PI * 180);
}

const BONDS_MERGE_ANGLE = 10; // 'º'
const BONDS_MERGE_SCALE = 0.2;

function mergeBondsParams(restruct, bond1, bond2) {
	const atoms = restruct.molecule.atoms;

	const begin1 = atoms.get(bond1.begin);
	const begin2 = atoms.get(bond2.begin);
	const end1 = atoms.get(bond1.end);
	const end2 = atoms.get(bond2.end);

	const angle = degrees(calcAngle(begin1.pp, end1.pp) - calcAngle(begin2.pp, end2.pp));
	const mergeAngle = Math.abs(angle % 180);

	const scale = Vec2.dist(begin1.pp, end1.pp) / Vec2.dist(begin2.pp, end2.pp);

	if (inRange(mergeAngle, BONDS_MERGE_ANGLE, 180 - BONDS_MERGE_ANGLE) ||
		!inRange(scale, 1 - BONDS_MERGE_SCALE, 1 + BONDS_MERGE_SCALE))
		return null;

	return { angle: mergeAngle, scale, cross: Math.abs(angle) > 90 };
}

export default {
	calcAngle,
	fracAngle,
	calcNewAtomPos,
	degrees,
	setFracAngle,
	mergeBondsParams
};
