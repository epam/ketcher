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

import Action from '../shared/action';
import utils from '../shared/utils';
import { fromBondsMerge } from './bond';
import { fromAtomMerge } from './atom';

export function fromItemsFuse(restruct, items) {
	let action = new Action();

	if (!items)
		return action;

	const usedAtoms = new Set();

	// merge single atoms
	items.atoms.forEach((dst, src) => {
		if (usedAtoms.has(dst) || usedAtoms.has(src))
			return;

		action = fromAtomMerge(restruct, src, dst).mergeWith(action);
		usedAtoms.add(dst).add(src);
	});

	// merge bonds
	action = fromBondsMerge(restruct, items.bonds).mergeWith(action);

	return action;
}

export function getItemsToFuse(editor, items) {
	const struct = editor.render.ctab.molecule;

	const mergeItems = items || (
		{
			atoms: Array.from(struct.atoms.keys()),
			bonds: Array.from(struct.bonds.keys())
		}
	);

	return closestToMerge(struct, editor.findMerge(mergeItems, ['atoms', 'bonds']));
}

export function getHoverToFuse(items) {
	if (!items) return null;

	const hoverItems = {
		atoms: Array.from(items.atoms.values()),
		bonds: Array.from(items.bonds.values())
	};

	return { map: 'merge', id: +Date.now(), items: hoverItems };
}

/**
 * @param struct
 * @param closestMap {{
 * 		atoms: Map<number, number>,
 * 		bonds: Map<number, number>
 * }}
 * @return {{
 * 		atoms: Map<number, number>,
 * 		bonds: Map<number, number>
 * }}
 */
function closestToMerge(struct, closestMap) {
	const mergeMap = {
		atoms: new Map(closestMap.atoms),
		bonds: new Map(closestMap.bonds)
	};

	closestMap.bonds.forEach((dstId, srcId) => {
		const bond = struct.bonds.get(srcId);
		const bondCI = struct.bonds.get(dstId);

		if (utils.mergeBondsParams(struct, bond, struct, bondCI).merged) {
			mergeMap.atoms.delete(bond.begin);
			mergeMap.atoms.delete(bond.end);
		} else {
			mergeMap.bonds.delete(srcId);
		}
	});

	if (mergeMap.atoms.size === 0 && mergeMap.bonds.size === 0)
		return null;

	return mergeMap;
}
