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

import { Box2Abs } from 'domain/entities/box2Abs';
import { Vec2 } from 'domain/entities/vec2';
import type { Fragment } from 'domain/entities/fragment';

import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import { Scale } from 'domain/helpers';

class ReFrag extends ReObject {
  public item: Fragment;

  constructor(frag: Fragment) {
    super('frag');
    this.item = frag;
  }

  static isSelectable(): boolean {
    return false;
  }

  fragGetAtoms(restruct: ReStruct, fid: number): number[] {
    return [...restruct.atoms.keys()].filter(
      (aid) => restruct.atoms.get(aid)?.a.fragment === fid,
    );
  }

  fragGetBonds(restruct: ReStruct, fid: number): number[] {
    return [...restruct.bonds.keys()].filter((bid) => {
      const bond = restruct.bonds.get(bid)?.b;
      if (!bond) {
        return false;
      }

      const firstFrag = restruct.getBondEndpoint(bond.begin)?.a.fragment;
      const secondFrag = restruct.getBondEndpoint(bond.end)?.a.fragment;

      return firstFrag === fid && secondFrag === fid;
    });
  }

  calcBBox(
    restruct: ReStruct,
    fid: number,
    render?: Render,
  ): Box2Abs | undefined {
    let ret: Box2Abs | undefined;
    restruct.atoms.forEach((atom) => {
      if (atom.a.fragment !== fid) {
        return;
      }

      // TODO ReObject.calcBBox to be used instead
      let bba = atom.visel.boundingBox;
      if (bba) {
        if (!render) {
          render = (globalThis as Record<string, unknown>)._ui_editor as Render;
        }
        bba = bba
          .translate((render.options.offset ?? new Vec2()).negated())
          .transform(Scale.canvasToModel, render.options);
      } else {
        bba = new Box2Abs(atom.a.pp, atom.a.pp);
        const ext = new Vec2(0.05 * 3, 0.05 * 3);
        bba = bba.extend(ext, ext);
      }
      ret = ret ? Box2Abs.union(ret, bba) : bba;
    });

    return ret;
  }

  _draw(render: Render, fid: number, attrs: Record<string, unknown>) {
    const bb = this.calcBBox(render.ctab, fid, render);

    if (bb) {
      const p0 = Scale.modelToCanvas(
        new Vec2(bb.p0.x, bb.p0.y),
        render.options,
      );
      const p1 = Scale.modelToCanvas(
        new Vec2(bb.p1.x, bb.p1.y),
        render.options,
      );
      return render.paper
        .rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0)
        .attr(attrs);
    }

    // TODO abnormal situation, empty fragments must be destroyed by tools
  }

  draw(_render: Render): null {
    return null;
  }

  drawHover(_render: Render): void {
    // Do nothing. This method shouldn't actually be called.
  }

  setHover(isHovered: boolean, render: Render): void {
    let fid = render.ctab.frags.keyOf(this);

    if (!fid && fid !== 0) {
      console.warn('Fragment does not belong to the render');
      return;
    }

    fid = Number.parseInt(String(fid), 10);

    render.ctab.atoms.forEach((atom) => {
      if (atom.a.fragment === fid) {
        atom.setHover(isHovered, render);
      }
    });

    render.ctab.bonds.forEach((bond) => {
      if (render.ctab.getBondEndpoint(bond.b.begin)?.a.fragment === fid) {
        bond.setHover(isHovered, render);
      }
    });
  }
}
export default ReFrag;
