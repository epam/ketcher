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

import { type Struct, Vec2 } from 'ketcher-core';

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
