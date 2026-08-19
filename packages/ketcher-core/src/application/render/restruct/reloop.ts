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

import { Bond } from 'domain/entities/bond';
import { Vec2 } from 'domain/entities/vec2';
import { Scale } from 'domain/helpers';
import { toFixed } from 'utilities';

import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';

import type { Loop } from 'domain/entities/loop';
import type { Struct } from 'domain/entities/struct';
import type ReStruct from './restruct';
import type { RenderOptions } from '../render.types';

class ReLoop extends ReObject {
  loop: Loop;
  centre: Vec2;
  radius: number;

  constructor(loop: Loop) {
    super('loop');
    this.loop = loop;
    this.centre = new Vec2();
    this.radius = 0;
  }

  static isSelectable(): boolean {
    return false;
  }

  show(restruct: ReStruct, _rlid: number, options: RenderOptions): void {
    const { render, molecule } = restruct;
    const paper = render.paper;
    const { loop } = this;
    const halfBondIds = loop.hbs;

    this.centre = new Vec2();
    for (const halfBondId of halfBondIds) {
      const halfBond = molecule.halfBonds.get(halfBondId);
      if (!halfBond) {
        return;
      }
      const bond = restruct.bonds.get(halfBond.bid);
      if (!bond) {
        return;
      }
      const beginAtom = restruct.atoms.get(halfBond.begin);
      if (!beginAtom) {
        return;
      }
      const beginPosition = Scale.modelToCanvas(beginAtom.a.pp, options);
      if (bond.b.type !== Bond.PATTERN.TYPE.AROMATIC) {
        loop.aromatic = false;
      }
      this.centre = this.centre.add(beginPosition);
    }

    loop.convex = true;
    for (let index = 0; index < halfBondIds.length; ++index) {
      const currentHalfBond = molecule.halfBonds.get(halfBondIds[index]);
      const nextHalfBond = molecule.halfBonds.get(
        halfBondIds[(index + 1) % halfBondIds.length],
      );
      if (!currentHalfBond || !nextHalfBond) {
        return;
      }
      const angle = Math.atan2(
        Vec2.cross(currentHalfBond.dir, nextHalfBond.dir),
        Vec2.dot(currentHalfBond.dir, nextHalfBond.dir),
      );
      if (angle > 0) {
        loop.convex = false;
      }
    }

    this.centre = this.centre.scaled(1.0 / halfBondIds.length);
    this.radius = -1;
    for (const halfBondId of halfBondIds) {
      const halfBond = molecule.halfBonds.get(halfBondId);
      if (!halfBond) {
        return;
      }
      const beginAtom = restruct.atoms.get(halfBond.begin);
      const endAtom = restruct.atoms.get(halfBond.end);
      if (!beginAtom || !endAtom) {
        return;
      }
      const beginPosition = Scale.modelToCanvas(beginAtom.a.pp, options);
      const endPosition = Scale.modelToCanvas(endAtom.a.pp, options);
      const normal = Vec2.diff(endPosition, beginPosition)
        .rotateSC(1, 0)
        .normalized();
      const distance = Vec2.dot(Vec2.diff(beginPosition, this.centre), normal);
      this.radius =
        this.radius < 0 ? distance : Math.min(this.radius, distance);
    }
    this.radius *= 0.7;
    if (!loop.aromatic) {
      return;
    }

    // Skip rendering the aromatic circle when the loop sits entirely inside one contracted sgroup
    const atomIds = new Set<number>();
    for (const halfBondId of halfBondIds) {
      const halfBond = molecule.halfBonds.get(halfBondId);
      if (!halfBond) {
        return;
      }
      atomIds.add(halfBond.begin);
      atomIds.add(halfBond.end);
    }

    const firstAtomId = atomIds.values().next().value;
    // An atom id can legitimately be 0 (falsy but meaningful), so this stays an
    // explicit undefined check rather than a truthiness check.
    if (firstAtomId === undefined) {
      return;
    }
    const sgroup = molecule.getGroupFromAtomId(firstAtomId);
    if (sgroup?.isContracted()) {
      const allInSameSgroup = [...atomIds].every(
        (atomId) => molecule.getGroupFromAtomId(atomId) === sgroup,
      );
      if (allInSameSgroup) {
        return;
      }
    }

    let path = null;
    if (loop.convex && options.aromaticCircle) {
      path = paper.circle(this.centre.x, this.centre.y, this.radius).attr({
        stroke: '#000',
        'stroke-width': options.lineattr['stroke-width'],
      });
    } else {
      let pathString = '';
      for (let index = 0; index < halfBondIds.length; ++index) {
        const currentHalfBond = molecule.halfBonds.get(halfBondIds[index]);
        const nextHalfBond = molecule.halfBonds.get(
          halfBondIds[(index + 1) % halfBondIds.length],
        );
        if (!currentHalfBond || !nextHalfBond) {
          return;
        }
        const angle = Math.atan2(
          Vec2.cross(currentHalfBond.dir, nextHalfBond.dir),
          Vec2.dot(currentHalfBond.dir, nextHalfBond.dir),
        );
        const halfAngle = (Math.PI - angle) / 2;
        const direction = nextHalfBond.dir.rotate(halfAngle);
        const nextBeginAtom = restruct.atoms.get(nextHalfBond.begin);
        if (!nextBeginAtom) {
          return;
        }
        const atomPosition = Scale.modelToCanvas(nextBeginAtom.a.pp, options);
        let sin = Math.sin(halfAngle);
        const minSin = 0.1;
        if (Math.abs(sin) < minSin) {
          sin = (sin * minSin) / Math.abs(sin);
        }
        const offset = options.bondSpace / sin;
        const innerPosition = atomPosition.addScaled(direction, -offset);
        pathString += index === 0 ? 'M' : 'L';
        pathString += toFixed(innerPosition.x) + ',' + toFixed(innerPosition.y);
      }
      pathString += 'Z';
      path = paper.path(pathString).attr({
        stroke: '#000',
        'stroke-width': options.lineattr['stroke-width'],
        'stroke-dasharray': '- ',
      });
    }
    restruct.addReObjectPath(LayerMap.data, this.visel, path, null, true);
  }

  isValid(struct: Struct, rlid: number): boolean {
    const { halfBonds } = struct;
    return this.loop.hbs.every((halfBondId) => {
      const halfBond = halfBonds.get(halfBondId);
      return halfBond !== undefined && halfBond.loop === rlid;
    });
  }
}

export default ReLoop;
