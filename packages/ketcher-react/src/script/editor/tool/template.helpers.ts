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

import { type Bond, type Struct, Vec2, vectorUtils } from 'ketcher-core';

export function getSign(molecule, bond, v) {
  const begin = molecule.atoms.get(bond.begin).pp;
  const end = molecule.atoms.get(bond.end).pp;

  const sign = Vec2.cross(Vec2.diff(begin, end), Vec2.diff(v, end));

  if (sign > 0) {
    return 1;
  }

  if (sign < 0) {
    return -1;
  }

  return 0;
}

export function getBondFlipSign(struct: Struct, bond: Bond): number {
  const xy0 = new Vec2();
  const frid = struct.atoms.get(bond.begin)?.fragment;
  const frIds = struct.getFragmentIds(frid as number);
  let count = 0;

  let loop = struct.halfBonds.get(bond?.hb1 as number)?.loop;

  if (loop && loop < 0) {
    loop = struct.halfBonds.get(bond?.hb2 as number)?.loop;
  }

  if (loop && loop >= 0) {
    const loopHbs = struct.loops.get(loop)?.hbs;
    loopHbs?.forEach((hb) => {
      const halfBondBegin = struct.halfBonds.get(hb)?.begin;

      if (halfBondBegin) {
        const hbbAtom = struct.atoms.get(halfBondBegin);

        if (hbbAtom) {
          xy0.add_(hbbAtom.pp); // eslint-disable-line no-underscore-dangle
          count++;
        }
      }
    });
  } else {
    frIds.forEach((id) => {
      const atomById = struct.atoms.get(id);

      if (atomById) {
        xy0.add_(atomById.pp); // eslint-disable-line no-underscore-dangle
        count++;
      }
    });
  }

  const v0 = xy0.scaled(1 / count);
  return getSign(struct, bond, v0) || 1;
}

export function getAngleFromEvent(event, ci, restruct) {
  const degree = restruct.atoms.get(ci.id)?.a.neighbors.length;
  let angle;
  if (degree && degree > 1) {
    // common case
    angle = null;
  } else if (degree === 1) {
    // on chain end
    const atom = restruct.molecule.atoms.get(ci.id);
    const neiId =
      atom && restruct.molecule.halfBonds.get(atom.neighbors[0])?.end;
    const nei = (neiId || neiId === 0) && restruct.molecule.atoms.get(neiId);

    angle = event.ctrlKey
      ? vectorUtils.calcAngle(nei?.pp, atom?.pp)
      : vectorUtils.fracAngle(vectorUtils.calcAngle(nei.pp, atom?.pp), null);
  } else {
    // on single atom
    angle = 0;
  }
  return angle;
}
