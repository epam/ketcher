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
import { Loop } from 'domain/entities/loop';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import ReStruct from './restruct';
import { RenderOptions } from '../render.types';
import { Scale } from 'domain/helpers';
import { toFixed } from 'utilities';

function getFromMap<T>(map: Map<number, T>, key: number): T {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`Map entry not found for key ${key}`);
  }
  return value;
}

class ReLoop extends ReObject {
  public loop: Loop;
  public centre: Vec2;
  public radius: number;

  constructor(loop: Loop) {
    super('loop');
    this.loop = loop;
    this.centre = new Vec2();
    this.radius = 0;
  }

  static isSelectable(): boolean {
    return false;
  }

  private isInsideContractedSgroup(molecule: Struct): boolean {
    const atomIds = new Set<number>();
    this.loop.hbs.forEach((hbid) => {
      const hb = getFromMap(molecule.halfBonds, hbid);
      atomIds.add(hb.begin);
      atomIds.add(hb.end);
    });

    const firstAtomId = atomIds.values().next().value;
    const sgroup = molecule.getGroupFromAtomId(firstAtomId);

    if (!sgroup?.isContracted()) {
      return false;
    }

    return Array.from(atomIds).every((atomId) => {
      return molecule.getGroupFromAtomId(atomId) === sgroup;
    });
  }

  private buildDashedAromaticPath(
    restruct: ReStruct,
    molecule: Struct,
    options: RenderOptions,
  ): string {
    let pathStr = '';
    for (let k = 0; k < this.loop.hbs.length; ++k) {
      const hba = getFromMap(molecule.halfBonds, this.loop.hbs[k]);
      const hbb = getFromMap(
        molecule.halfBonds,
        this.loop.hbs[(k + 1) % this.loop.hbs.length],
      );
      const angle = Math.atan2(
        Vec2.cross(hba.dir, hbb.dir),
        Vec2.dot(hba.dir, hbb.dir),
      );
      const halfAngle = (Math.PI - angle) / 2;
      const dir = hbb.dir.rotate(halfAngle);
      const pi = Scale.modelToCanvas(
        getFromMap(restruct.atoms, hbb.begin).a.pp,
        options,
      );
      let sin = Math.sin(halfAngle);
      const minSin = 0.1;
      if (Math.abs(sin) < minSin) {
        sin = (sin * minSin) / Math.abs(sin);
      }
      const offset = options.bondSpace / sin;
      const qi = pi.addScaled(dir, -offset);
      pathStr += k === 0 ? 'M' : 'L';
      pathStr += toFixed(qi.x) + ',' + toFixed(qi.y);
    }
    return pathStr + 'Z';
  }

  show(restruct: ReStruct, _rlid: number, options: RenderOptions) {
    const render = restruct.render;
    const paper = render.paper;
    const molecule = restruct.molecule;
    const loop = this.loop;
    this.centre = new Vec2();
    loop.hbs.forEach((hbid) => {
      const hb = getFromMap(molecule.halfBonds, hbid);
      const bond = getFromMap(restruct.bonds, hb.bid);
      const apos = Scale.modelToCanvas(
        getFromMap(restruct.atoms, hb.begin).a.pp,
        options,
      );
      if (bond.b.type !== Bond.PATTERN.TYPE.AROMATIC) {
        loop.aromatic = false;
      }
      this.centre.add_(apos); // eslint-disable-line no-underscore-dangle
    });
    loop.convex = true;
    for (let k = 0; k < this.loop.hbs.length; ++k) {
      const hba = getFromMap(molecule.halfBonds, loop.hbs[k]);
      const hbb = getFromMap(
        molecule.halfBonds,
        loop.hbs[(k + 1) % loop.hbs.length],
      );
      const angle = Math.atan2(
        Vec2.cross(hba.dir, hbb.dir),
        Vec2.dot(hba.dir, hbb.dir),
      );
      if (angle > 0) {
        loop.convex = false;
      }
    }

    this.centre = this.centre.scaled(1.0 / loop.hbs.length);
    this.radius = -1;
    loop.hbs.forEach((hbid) => {
      const hb = getFromMap(molecule.halfBonds, hbid);
      const apos = Scale.modelToCanvas(
        getFromMap(restruct.atoms, hb.begin).a.pp,
        options,
      );
      const bpos = Scale.modelToCanvas(
        getFromMap(restruct.atoms, hb.end).a.pp,
        options,
      );
      const n = Vec2.diff(bpos, apos).rotateSC(1, 0).normalized();
      const dist = Vec2.dot(Vec2.diff(apos, this.centre), n);
      this.radius = this.radius < 0 ? dist : Math.min(this.radius, dist);
    });
    this.radius *= 0.7;
    if (!loop.aromatic || this.isInsideContractedSgroup(molecule)) {
      return;
    }

    let path = null;
    if (loop.convex && options.aromaticCircle) {
      path = paper.circle(this.centre.x, this.centre.y, this.radius).attr({
        stroke: '#000',
        'stroke-width': options.lineattr['stroke-width'],
      });
    } else {
      const pathStr = this.buildDashedAromaticPath(restruct, molecule, options);
      path = paper.path(pathStr).attr({
        stroke: '#000',
        'stroke-width': options.lineattr['stroke-width'],
        'stroke-dasharray': '- ',
      });
    }
    restruct.addReObjectPath(LayerMap.data, this.visel, path, null, true);
  }

  isValid(struct: Struct, rlid: number) {
    const halfBonds = struct.halfBonds;
    return this.loop.hbs.every(
      (hbid) =>
        halfBonds.has(hbid) && getFromMap(halfBonds, hbid).loop === rlid,
    );
  }
}

export default ReLoop;
