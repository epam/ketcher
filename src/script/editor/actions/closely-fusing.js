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

import Action from '../shared/action';
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
