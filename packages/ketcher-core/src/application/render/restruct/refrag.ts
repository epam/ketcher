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

import { Box2Abs, Vec2 } from 'domain/entities';
import { Fragment } from 'domain/entities/fragment';

import ReObject from './reobject';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
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
    return Array.from(restruct.atoms.keys()).filter(
      (aid) => restruct.atoms.get(aid)?.a.fragment === fid,
    );
  }

  fragGetBonds(restruct: ReStruct, fid: number): number[] {
    return Array.from(restruct.bonds.keys()).filter((bid) => {
      const bond = restruct.bonds.get(bid)?.b;
      if (!bond) {
        return false;
      }

      const firstFrag = restruct.atoms.get(bond.begin)?.a.fragment;
      const secondFrag = restruct.atoms.get(bond.end)?.a.fragment;

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
      if (!bba) {
        bba = new Box2Abs(atom.a.pp, atom.a.pp);
        const ext = new Vec2(0.05 * 3, 0.05 * 3);
        bba = bba.extend(ext, ext);
      } else {
        if (!render) {
          render = (global as Record<string, unknown>)._ui_editor as Render; // eslint-disable-line
        }
        bba = bba
          .translate((render.options.offset || new Vec2()).negated())
          .transform(Scale.canvasToModel, render.options);
      }
      ret = ret ? Box2Abs.union(ret, bba) : bba;
    });

    return ret;
  }

  _draw(render: Render, fid: number, attrs: Record<string, unknown>) {
    // eslint-disable-line no-underscore-dangle
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

  setHover(hover: boolean, render: Render): void {
    let fid = render.ctab.frags.keyOf(this);

    if (!fid && fid !== 0) {
      console.warn('Fragment does not belong to the render');
      return;
    }

    fid = parseInt(String(fid), 10);

    render.ctab.atoms.forEach((atom) => {
      if (atom.a.fragment === fid) {
        atom.setHover(hover, render);
      }
    });

    render.ctab.bonds.forEach((bond) => {
      if (render.ctab.atoms.get(bond.b.begin)?.a.fragment === fid) {
        bond.setHover(hover, render);
      }
    });
  }
}
export default ReFrag;
