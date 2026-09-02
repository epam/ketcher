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

import { Atom, type AtomAttributes } from './atom';
import type { Pool } from './pool';
import { Vec2 } from './vec2';

export type AttachmentGroupAttributes = Pick<
  AtomAttributes,
  'fragment' | 'pp' | 'initiallySelected'
> & {
  atomIds: number[];
};

/**
 * A logical endpoint shared by all atoms in a KET attachment group.
 *
 * It extends Atom only to reuse the existing bond geometry and rendering
 * infrastructure. It is stored separately from chemical atoms and its
 * position is always derived from its member atoms.
 */
export class AttachmentGroup extends Atom {
  atomIds: number[];

  constructor(attributes: AttachmentGroupAttributes) {
    super({ ...attributes, label: '*' });
    this.atomIds = [...attributes.atomIds];
  }

  clone(
    fidMap?: Map<number, number>,
    atomIdMap?: Map<number, number>,
  ): AttachmentGroup {
    const fragmentId = fidMap?.get(this.fragment);
    return new AttachmentGroup({
      atomIds: atomIdMap
        ? this.atomIds
            .map((atomId) => atomIdMap.get(atomId))
            .filter((atomId): atomId is number => atomId !== undefined)
        : [...this.atomIds],
      fragment: fragmentId ?? this.fragment,
      pp: this.pp,
      initiallySelected: this.initiallySelected,
    });
  }

  recalculatePosition(atoms: Pool<Atom>): Vec2 {
    const firstAtom = atoms.get(this.atomIds[0]);
    if (firstAtom) {
      this.fragment = firstAtom.fragment;
    }

    const positions = this.atomIds
      .map((atomId) => atoms.get(atomId)?.pp)
      .filter((position): position is Vec2 => position !== undefined);

    if (positions.length === 0) {
      return this.pp;
    }

    const position = positions
      .reduce((sum, current) => sum.add(current), new Vec2())
      .scaled(1 / positions.length);

    this.pp = position;
    return position;
  }
}
