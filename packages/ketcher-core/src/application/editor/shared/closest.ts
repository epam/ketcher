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

import { FunctionalGroup, Pool, Vec2 } from 'domain/entities';
import { ReStruct } from 'application/render';

const SELECTION_DISTANCE_COEFFICIENT = 0.4;

/**
 * Finds the closest atom to the given position, respecting skip filters
 * and contracted functional groups.
 * @param restruct Rendered structure to search within.
 * @param pos Cursor position in model coordinates.
 * @param skip Optional atom reference to ignore when map is 'atoms'.
 * @param minDist Optional maximum search radius in model units.
 * @returns Closest atom id with distance or null when nothing is found.
 */
function findClosestAtom(
  restruct: ReStruct,
  pos: Vec2,
  skip?: { map: 'atoms'; id: number } | null,
  minDist?: number,
): { id: number; dist: number } | null {
  let closestAtom: number | null = null;
  const maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
  const skipId = skip?.map === 'atoms' ? skip.id : null;
  const sGroups = restruct.sgroups;
  const functionalGroups: Pool<FunctionalGroup> =
    restruct.molecule.functionalGroups;

  minDist = Math.min(minDist ?? maxMinDist, maxMinDist);

  restruct.visibleAtoms.forEach((atom, aid) => {
    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom.a,
        sGroups,
        functionalGroups,
      )
    ) {
      return;
    }

    const isSkippedAtom = aid === skipId || atom.a.isPreview;
    if (isSkippedAtom) {
      return;
    }

    const dist = Vec2.dist(pos, atom.a.pp);

    if (dist < minDist) {
      closestAtom = aid;
      minDist = dist;
    }
  });

  if (closestAtom !== null) {
    return {
      id: closestAtom,
      dist: minDist,
    };
  }

  return null;
}

export default {
  atom: findClosestAtom, // used in Actions
};
