/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Bond } from 'domain/entities/bond';
import { AtomCIP } from 'domain/entities/types';
import type { Struct } from 'domain/entities/struct';

const MAX_DESCRIPTOR_DEPTH = 12;
const STEREO_SUBSTITUENT_COUNT = 4;

// Neutral atoms that can be tetrahedral stereocenters
const NEUTRAL_STEREO_ELEMENTS = new Set(['C', 'Si', 'Ge']);
// Atoms that can be tetrahedral stereocenters only when positively charged
const CHARGED_STEREO_ELEMENTS = new Set(['N', 'P', 'As']);

function canBeStereocenter(label: string, charge: number | null): boolean {
  const normalizedCharge = charge ?? 0;
  if (normalizedCharge === 0) return NEUTRAL_STEREO_ELEMENTS.has(label);
  if (normalizedCharge === 1) return CHARGED_STEREO_ELEMENTS.has(label);
  return false;
}

/**
 * Builds a string that describes the branch starting at `aid` (reached from `parent`).
 * Two branches have equal descriptors when they are constitutionally the same.
 */
function describeBranch(
  struct: Struct,
  aid: number,
  parent: number,
  viaBondType: number,
  path: Set<number>,
  depth: number,
): string {
  const atom = struct.atoms.get(aid);
  if (!atom) return '?';

  const head = `${viaBondType}:${atom.label}${atom.isotope ?? ''}${
    atom.charge ?? ''
  }`;

  if (depth >= MAX_DESCRIPTOR_DEPTH) return head;

  const nextPath = new Set(path).add(aid);
  const children: string[] = [];
  struct.atomGetNeighbors(aid)?.forEach((nei) => {
    if (nei.aid === parent) return;
    const bond = struct.bonds.get(nei.bid);
    const bondType = bond?.type ?? Bond.PATTERN.TYPE.SINGLE;
    if (nextPath.has(nei.aid)) {
      // ring closure: do not descend again
      children.push(`ring:${bondType}:${struct.atoms.get(nei.aid)?.label}`);
      return;
    }
    children.push(
      describeBranch(struct, nei.aid, aid, bondType, nextPath, depth + 1),
    );
  });
  const implicitH = Math.max(atom.implicitH ?? 0, 0);
  for (let i = 0; i < implicitH; i++) children.push(`1:H`);

  return `${head}(${children.sort().join(',')})`;
}

/**
 * Finds atoms that are tetrahedral stereocenters (four different substituents)
 * but have no stereo bond, so their configuration is not defined.
 */
export function findUndefinedStereocenters(struct: Struct): number[] {
  // neighbors are required; a freshly deserialized struct does not have them yet
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.setImplicitHydrogen(undefined, true);

  const result: number[] = [];

  struct.atoms.forEach((atom, aid) => {
    if (atom.cip || !canBeStereocenter(atom.label, atom.charge)) return;
    if (atom.rglabel || atom.atomList || atom.pseudo) return;

    const neighbors = struct.atomGetNeighbors(aid) ?? [];
    const implicitH = Math.max(atom.implicitH ?? 0, 0);
    if (neighbors.length + implicitH !== STEREO_SUBSTITUENT_COUNT) return;

    const bonds = neighbors.map((nei) => struct.bonds.get(nei.bid));
    const allSingleNoStereo = bonds.every(
      (bond) =>
        bond?.type === Bond.PATTERN.TYPE.SINGLE &&
        bond.stereo === Bond.PATTERN.STEREO.NONE,
    );
    if (!allSingleNoStereo) return;

    const descriptors = neighbors.map((nei) =>
      describeBranch(
        struct,
        nei.aid,
        aid,
        Bond.PATTERN.TYPE.SINGLE,
        new Set([aid]),
        1,
      ),
    );
    for (let i = 0; i < implicitH; i++) descriptors.push('1:H');

    if (new Set(descriptors).size === STEREO_SUBSTITUENT_COUNT) {
      result.push(aid);
    }
  });

  return result;
}

/**
 * Marks every stereocenter without stereo bonds with the "(?)" CIP label.
 */
export function markUndefinedStereocenters(struct: Struct): Struct {
  findUndefinedStereocenters(struct).forEach((aid) => {
    const atom = struct.atoms.get(aid);
    if (atom) atom.cip = AtomCIP.Undefined;
  });
  return struct;
}
