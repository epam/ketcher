/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import { Vec2 } from 'domain/entities/vec2';
import type { ReStruct } from 'application/render';
import type {
  ClosestAtom,
  ClosestSkipItem,
  ClosestModule,
} from './closest.types';

const SELECTION_DISTANCE_COEFFICIENT = 0.4;

/**
 * Finds the closest atom to a given position within the rendered structure.
 *
 * @param restruct - The render structure containing visible atoms
 * @param pos - The position to search from
 * @param skip - Optional atom to skip (for excluding selection items)
 * @param minDist - Optional minimum distance threshold; will use default if not provided
 * @returns Object with atom ID and distance, or null if no atom found within threshold
 */
function findClosestAtom(
  restruct: ReStruct,
  pos: Vec2,
  skip: ClosestSkipItem | null,
  minDist: number | null,
): ClosestAtom | null {
  let closestAtom: number | null = null;
  const maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip && skip.map === 'atoms' ? skip.id : null;

  let effectiveMinDist = minDist || maxMinDist;
  effectiveMinDist = Math.min(effectiveMinDist, maxMinDist);

  restruct.visibleAtoms.forEach((atom, aid) => {
    if (aid === skipId) return;

    const dist = Vec2.dist(pos, atom.a.pp);

    if (dist < effectiveMinDist) {
      closestAtom = aid;
      effectiveMinDist = dist;
    }
  });

  if (closestAtom !== null) {
    return {
      id: closestAtom,
      dist: effectiveMinDist,
    };
  }

  return null;
}

const closest: ClosestModule = {
  atom: findClosestAtom, // used in Actions
};

export default closest;
