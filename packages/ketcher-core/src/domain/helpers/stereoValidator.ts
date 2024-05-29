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

import { Bond, Neighbor, Struct } from 'domain/entities';

function isCorrectStereoCenter(
  bond: Bond,
  beginNeighs: Array<Neighbor> | undefined,
  endNeighs: Array<Neighbor> | undefined,
  struct: Struct,
) {
  const beginAtom = struct.atoms.get(bond.begin);

  let EndAtomNeigh: number | undefined = NaN;

  if (endNeighs?.length === 2) {
    EndAtomNeigh =
      endNeighs[0].aid === bond.begin ? endNeighs[1].aid : endNeighs[0].aid;
  }

  if (bond.stereo > 0) {
    if (
      endNeighs?.length === 1 &&
      beginNeighs?.length === 2 &&
      Number(beginAtom?.implicitH) % 2 === 0
    ) {
      return false;
    }

    if (
      endNeighs?.length === 2 &&
      beginNeighs?.length === 2 &&
      Number(beginAtom?.implicitH) % 2 === 0 &&
      struct.atomGetNeighbors(EndAtomNeigh)?.length === 1
    ) {
      return false;
    }

    if (beginNeighs?.length === 1) {
      return false;
    }

    return true;
  } else {
    return false;
  }
}

export const StereoValidator = {
  isCorrectStereoCenter,
};
