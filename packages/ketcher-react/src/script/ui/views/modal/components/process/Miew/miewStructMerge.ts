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

import {
  type Struct,
  SGroup,
  Vec2,
  MonomerMicromolecule,
  KetcherLogger,
} from 'ketcher-core';

function cloneMeta<T extends { clone(): T; resetInitiallySelected(): void }>(
  item: T,
): T {
  const clone = item.clone();
  clone.resetInitiallySelected();
  return clone;
}

export function needsMetaPreservation(struct: Struct): boolean {
  return !!(
    struct.rxnArrows.size ||
    struct.rxnPluses.size ||
    struct.texts.size ||
    struct.simpleObjects.size ||
    struct.images.size ||
    struct.multitailArrows.size
  );
}

export function needsStructurePreservation(struct: Struct): boolean {
  return struct.sgroups.size > 0 || struct.rgroups.size > 0;
}

export function mergeCoordinatesFromResult(
  result: Struct,
  original: Struct,
): boolean {
  if (original.atoms.size !== result.atoms.size) {
    KetcherLogger.warn(
      `[Miew] Cannot merge coordinates: atom counts differ ` +
        `(original: ${original.atoms.size}, result: ${result.atoms.size}).`,
    );

    return false;
  }

  for (const [atomId, originalAtom] of original.atoms) {
    const resultAtom = result.atoms.get(atomId);

    if (!resultAtom) {
      KetcherLogger.warn(
        `[Miew] Cannot merge coordinates: atom "${atomId}" is missing in result.`,
      );

      return false;
    }

    if (originalAtom.label !== resultAtom.label) {
      KetcherLogger.warn(
        `[Miew] Cannot merge coordinates: atom labels differ for atom "${atomId}" ` +
          `(original: "${originalAtom.label}", result: "${resultAtom.label}").`,
      );

      return false;
    }
  }

  for (const [atomId, originalAtom] of original.atoms) {
    const resultAtom = result.atoms.get(atomId);

    if (!resultAtom) {
      return false;
    }

    const { x, y, z } = resultAtom.pp;
    originalAtom.pp = new Vec2(x, y, z);
  }

  return true;
}

function getAtomCentroid(struct: Struct): Vec2 {
  if (struct.atoms.size === 0) {
    return new Vec2(0, 0);
  }

  let sum = new Vec2(0, 0);
  struct.atoms.forEach((atom) => {
    sum = sum.add(atom.pp);
  });

  return sum.scaled(1 / struct.atoms.size);
}

export function alignToCentroid(result: Struct, original: Struct): void {
  const offset = getAtomCentroid(original).sub(getAtomCentroid(result));

  if (offset.length() === 0) {
    return;
  }

  result.atoms.forEach((atom) => {
    atom.pp.add_(offset);
  });

  result.sgroups.forEach((sgroup) => {
    sgroup.pp?.add_(offset);
  });
}

export function collapseExpandedSuperatoms(struct: Struct): void {
  struct.sgroups.forEach((sgroup) => {
    if (sgroup.type !== SGroup.TYPES.SUP) {
      return;
    }

    if (sgroup instanceof MonomerMicromolecule) {
      const { monomerItem } = sgroup.monomer;

      if (!Object.isFrozen(monomerItem)) {
        monomerItem.expanded = false;
      }
    }

    sgroup.data.expanded = false;
  });
}

export function mergeMetaObjects(result: Struct, original: Struct): void {
  if (original.rxnArrows.size || original.rxnPluses.size) {
    result.isReaction = true;
  }

  original.rxnArrows.forEach((item) => result.addRxnArrow(cloneMeta(item)));
  original.rxnPluses.forEach((item) => result.rxnPluses.add(cloneMeta(item)));
  original.texts.forEach((item) => result.texts.add(cloneMeta(item)));
  original.simpleObjects.forEach((item) =>
    result.simpleObjects.add(cloneMeta(item)),
  );
  original.images.forEach((item) => result.images.add(cloneMeta(item)));
  original.multitailArrows.forEach((item) =>
    result.addMultitailArrow(cloneMeta(item)),
  );
}
