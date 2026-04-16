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

import { Box2Abs } from 'domain/entities/box2Abs';
import { Vec2 } from 'domain/entities/vec2';
import { RGroup } from 'domain/entities/rgroup';
import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { RenderOptions } from '../render.types';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';

const BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);
const PADDING_VECTOR = new Vec2(0.2, 0.4);

class ReRGroup extends ReObject {
  public labelBox: Box2Abs | null;
  public item: RGroup;

  constructor(rgroup: RGroup) {
    super('rgroup');
    this.labelBox = null;
    this.item = rgroup;
  }

  static isSelectable(): boolean {
    return false;
  }

  getAtoms(render: Render): number[] {
    let ret: number[] = [];
    this.item.frags.forEach((fid) => {
      const frag = render.ctab.frags.get(fid);
      if (frag) {
        ret = ret.concat(frag.fragGetAtoms(render.ctab, fid));
      }
    });
    return ret;
  }

  getBonds(render: Render): number[] {
    let ret: number[] = [];
    this.item.frags.forEach((fid) => {
      const frag = render.ctab.frags.get(fid);
      if (frag) {
        ret = ret.concat(frag.fragGetBonds(render.ctab, fid));
      }
    });
    return ret;
  }

  calcBBox(render: Render): Box2Abs | null {
    let rGroupBoundingBox: Box2Abs | null = null;
    this.item.frags.forEach((fid) => {
      const frag = render.ctab.frags.get(fid);
      const fragBox = frag?.calcBBox(render.ctab, fid, render);
      if (fragBox) {
        rGroupBoundingBox = rGroupBoundingBox
          ? Box2Abs.union(rGroupBoundingBox, fragBox)
          : fragBox;
      }
    });

    const rGroupAttachmentPointsVBox =
      render.ctab.getRGroupAttachmentPointsVBoxByAtomIds(this.getAtoms(render));
    if (rGroupBoundingBox && rGroupAttachmentPointsVBox) {
      rGroupBoundingBox = Box2Abs.union(
        rGroupBoundingBox,
        rGroupAttachmentPointsVBox,
      );
    }

    rGroupBoundingBox = rGroupBoundingBox
      ? rGroupBoundingBox.extend(BORDER_EXT, BORDER_EXT)
      : rGroupBoundingBox;

    return rGroupBoundingBox;
  }

  draw(render: Render, options: RenderOptions): { data: unknown[] } {
    let bb = this.calcBBox(render);

    if (!bb) {
      console.error(
        'Abnormal situation, empty fragments must be destroyed by tools',
      );
      return { data: [] };
    } else {
      // add a little space between the attachment points and brackets
      bb = bb.extend(PADDING_VECTOR, PADDING_VECTOR);
    }

    const ret: { data: unknown[] } = { data: [] };
    const p0 = Scale.modelToCanvas(bb.p0, options);
    const p1 = Scale.modelToCanvas(bb.p1, options);
    const brackets = render.paper.set();

    rGroupdrawBrackets(brackets, render, bb); // eslint-disable-line new-cap

    ret.data.push(brackets);
    const key = render.ctab.rgroups.keyOf(this);
    const labelSet = render.paper.set();
    const label = render.paper
      .text(p0.x, (p0.y + p1.y) / 2, 'R' + key + '=')
      .attr({
        font: options.font,
        'font-size': options.fontRLabel,
        fill: 'black',
      });

    const labelBox = util.relBox(label.getBBox());
    label.translateAbs(-labelBox.width / 2 - options.lineWidth, 0);

    labelSet.push(label);
    const logicStyle = {
      font: options.font,
      'font-size': options.fontRLogic,
      fill: 'black',
    };

    const logic = [rLogicToString(key, this.item)];

    let shift = labelBox.height / 2 + options.lineWidth / 2;
    for (const logicItem of logic) {
      const logicPath = render.paper
        .text(p0.x, (p0.y + p1.y) / 2, logicItem)
        .attr(logicStyle);
      const logicBox = util.relBox(logicPath.getBBox());
      shift += logicBox.height / 2;
      logicPath.translateAbs(
        -logicBox.width / 2 - 6 * options.lineWidth,
        shift,
      );
      shift += logicBox.height / 2 + options.lineWidth / 2;
      ret.data.push(logicPath);
      labelSet.push(logicPath);
    }

    ret.data.push(label);
    this.labelBox = Box2Abs.fromRelBox(labelSet.getBBox()).transform(
      Scale.canvasToModel,
      render.options,
    );
    return ret;
  }

  _draw(render: Render, _rgid: number, attrs: Record<string, unknown>) {
    // eslint-disable-line no-underscore-dangle
    const vbox = this.getVBoxObj(render);
    if (!vbox) {
      return null;
    }
    const bb = vbox.extend(BORDER_EXT, BORDER_EXT);

    if (!bb) {
      return null;
    }

    const p0 = Scale.modelToCanvas(bb.p0, render.options);
    const p1 = Scale.modelToCanvas(bb.p1, render.options);
    return render.paper
      .rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0)
      .attr(attrs);
  }

  drawHover(render: Render) {
    const rgid = render.ctab.rgroups.keyOf(this);

    if (!rgid) {
      console.error(
        'Abnormal situation, fragment does not belong to the render',
      );
      return null;
    }

    const ret = this._draw(render, rgid, render.options.hoverStyle); // eslint-disable-line no-underscore-dangle
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);

    this.item.frags.forEach((_fnum, fid) => {
      render.ctab.frags.get(fid)?.drawHover(render);
    });

    return ret;
  }

  show(restruct: ReStruct, _id: number, options: RenderOptions): void {
    const drawing = this.draw(restruct.render, options);

    Object.keys(drawing).forEach((group) => {
      const items = drawing[group as keyof typeof drawing] as unknown[];
      while (items.length > 0) {
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          items.shift(),
          null,
          true,
        );
      }
    });
  }
}

function rGroupdrawBrackets(
  set: { push: (...args: unknown[]) => void },
  render: Render,
  bb: Box2Abs,
  d?: Vec2,
): void {
  const direction = Scale.modelToCanvas(d ?? new Vec2(1, 0), render.options);
  const bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
  const bracketHeight = bb.p1.y - bb.p0.y;
  const cy = 0.5 * (bb.p1.y + bb.p0.y);

  const leftBracket = draw.bracket(
    render.paper,
    direction.negated(),
    direction.negated().rotateSC(1, 0),
    Scale.modelToCanvas(new Vec2(bb.p0.x, cy), render.options),
    bracketWidth,
    bracketHeight,
    render.options,
  );

  const rightBracket = draw.bracket(
    render.paper,
    direction,
    direction.rotateSC(1, 0),
    Scale.modelToCanvas(new Vec2(bb.p1.x, cy), render.options),
    bracketWidth,
    bracketHeight,
    render.options,
  );

  set.push(leftBracket, rightBracket);
}

function rLogicToString(id: number | null, rLogic: RGroup): string {
  const ifThen = rLogic.ifthen > 0 ? 'IF ' : '';

  const rangeExists =
    rLogic.range.startsWith('>') ||
    rLogic.range.startsWith('<') ||
    rLogic.range.startsWith('=');

  let range: string;
  if (rLogic.range.length > 0) {
    range = rangeExists ? rLogic.range : '=' + rLogic.range;
  } else {
    range = '>0';
  }

  const restH = rLogic.resth ? ' (RestH)' : '';
  const nextRg = rLogic.ifthen > 0 ? '\nTHEN R' + rLogic.ifthen.toString() : '';

  return `${ifThen}R${String(id)}${range}${restH}${nextRg}`;
}

export default ReRGroup;
