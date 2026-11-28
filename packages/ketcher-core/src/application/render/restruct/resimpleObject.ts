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
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';

import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { RenderOptions } from '../render.types';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { toFixed } from 'utilities';
import type { Element, RaphaelPaper, RaphaelSet } from 'raphael';
import {
  getHandles,
  getHandlesOnOutline,
  hitTest as hitTestShape,
} from 'domain/staticObjects/geometry';
import type { ShapeGeometry } from 'domain/staticObjects/types';

interface StyledPath {
  path: Element;
  stylesApplied: boolean;
}
interface SimpleObjectItem {
  mode: SimpleObjectMode;
  pos: Array<Vec2>;
}
class ReSimpleObject extends ReObject {
  static isSelectable(): boolean {
    return true;
  }

  private readonly item: SimpleObjectItem;
  private selectionSet: RaphaelSet;
  private selectionPointsSet: RaphaelSet;

  constructor(simpleObject: SimpleObjectItem) {
    super('simpleObject');
    this.item = simpleObject;
  }

  private get geometry(): ShapeGeometry {
    return {
      kind: this.item.mode,
      start: this.item.pos[0],
      end: this.item.pos[1],
    };
  }

  hitTest(point: Vec2, scale: number, outlineTolerance: number) {
    return hitTestShape(this.geometry, point, {
      outline: outlineTolerance,
      handle: 8 / scale,
    });
  }

  getReferencePoints(): Array<Vec2> {
    return [...getHandles(this.geometry).values()];
  }

  getReferencePointsOnObject(): Array<Vec2> {
    return [...getHandlesOnOutline(this.geometry).values()];
  }

  getBorderHoverPath(path: Element, render: Render) {
    return path.attr({ ...render.options.hoverStyle, fill: 'none' });
  }

  getFillHoverPath(path: Element, render: Render) {
    return path.attr(render.options.innerHoverStyle);
  }

  hoverPath(render: Render): Array<StyledPath> {
    const point: Array<Vec2> = [];

    this.item.pos.forEach((p, index) => {
      point[index] = Scale.modelToCanvas(p, render.options);
    });
    const scaleFactor = render.options.microModeScale;

    const paths: Array<StyledPath> = [];

    // TODO: It seems that inheritance will be the better approach here
    const lineOffset = scaleFactor / 8;
    switch (this.item.mode) {
      case SimpleObjectMode.ellipse: {
        const rad = Vec2.diff(point[1], point[0]);
        const rx = rad.x / 2;
        const ry = rad.y / 2;
        const centerX = toFixed(point[0].x + rx);
        const centerY = toFixed(point[0].y + ry);
        const outerBorderEllipse = render.paper.ellipse(
          centerX,
          centerY,
          toFixed(Math.abs(rx) + lineOffset),
          toFixed(Math.abs(ry) + lineOffset),
        );
        paths.push({
          path: this.getBorderHoverPath(outerBorderEllipse, render),
          stylesApplied: true,
        });

        const fillEllipse = render.paper.ellipse(
          centerX,
          centerY,
          toFixed(Math.abs(rx)),
          toFixed(Math.abs(ry)),
        );
        paths.push({
          path: this.getFillHoverPath(fillEllipse, render),
          stylesApplied: true,
        });
        if (
          Math.abs(rx) - scaleFactor / 8 > 0 &&
          Math.abs(ry) - scaleFactor / 8 > 0
        ) {
          const innerBorderEllipse = render.paper.ellipse(
            centerX,
            centerY,
            toFixed(Math.abs(rx) - lineOffset),
            toFixed(Math.abs(ry) - lineOffset),
          );
          paths.push({
            path: this.getBorderHoverPath(innerBorderEllipse, render),
            stylesApplied: true,
          });
        }
        break;
      }

      case SimpleObjectMode.rectangle: {
        const leftX = Math.min(point[0].x, point[1].x);
        const topY = Math.min(point[0].y, point[1].y);
        const rightX = Math.max(point[0].x, point[1].x) - leftX;
        const bottomY = Math.max(point[0].y, point[1].y) - topY;

        const outerBorderRect = render.paper.rect(
          toFixed(leftX - lineOffset),
          toFixed(topY - lineOffset),
          toFixed(rightX + 2 * lineOffset),
          toFixed(bottomY + 2 * lineOffset),
        );
        paths.push({
          path: this.getBorderHoverPath(outerBorderRect, render),
          stylesApplied: true,
        });
        const fillRect = render.paper.rect(
          toFixed(leftX),
          toFixed(topY),
          toFixed(rightX),
          toFixed(bottomY),
        );
        paths.push({
          path: this.getFillHoverPath(fillRect, render),
          stylesApplied: true,
        });
        if (rightX - 2 * lineOffset > 0 && bottomY - 2 * lineOffset > 0) {
          const innerRect = render.paper.rect(
            toFixed(leftX + lineOffset),
            toFixed(topY + lineOffset),
            toFixed(rightX - 2 * lineOffset),
            toFixed(bottomY - 2 * lineOffset),
          );
          paths.push({
            path: this.getBorderHoverPath(innerRect, render),
            stylesApplied: true,
          });
        }

        break;
      }
      case SimpleObjectMode.line: {
        // TODO: reuse this code for polyline
        const poly: Array<string | number> = [];

        const angle = Math.atan(
          (point[1].y - point[0].y) / (point[1].x - point[0].x),
        );

        const p0 = { x: 0, y: 0 };
        const p1 = { x: 0, y: 0 };

        const k = point[0].x > point[1].x ? -1 : 1;

        p0.x = point[0].x - k * ((scaleFactor / 8) * Math.cos(angle));
        p0.y = point[0].y - k * ((scaleFactor / 8) * Math.sin(angle));
        p1.x = point[1].x + k * ((scaleFactor / 8) * Math.cos(angle));
        p1.y = point[1].y + k * ((scaleFactor / 8) * Math.sin(angle));

        poly.push(
          'M',
          p0.x + ((k * scaleFactor) / 8) * Math.sin(angle),
          p0.y - ((k * scaleFactor) / 8) * Math.cos(angle),
          'L',
          p1.x + ((k * scaleFactor) / 8) * Math.sin(angle),
          p1.y - ((k * scaleFactor) / 8) * Math.cos(angle),
          'L',
          p1.x - ((k * scaleFactor) / 8) * Math.sin(angle),
          p1.y + ((k * scaleFactor) / 8) * Math.cos(angle),
          'L',
          p0.x - ((k * scaleFactor) / 8) * Math.sin(angle),
          p0.y + ((k * scaleFactor) / 8) * Math.cos(angle),
          'L',
          p0.x + ((k * scaleFactor) / 8) * Math.sin(angle),
          p0.y - ((k * scaleFactor) / 8) * Math.cos(angle),
        );
        paths.push({
          path: render.paper.path(poly).attr(render.options.hoverStyle),
          stylesApplied: true,
        });
        break;
      }
      default: {
        throw new Error('Unsupported shape type');
      }
    }

    return paths;
  }

  drawHover(render: Render): Array<Element> {
    const paths: Array<Element> = this.hoverPath(render).map((enhPath) => {
      return !enhPath.stylesApplied
        ? enhPath.path.attr(render.options.hoverStyle)
        : enhPath.path;
    });

    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, paths);
    return paths;
  }

  makeSelectionPlate(
    restruct: ReStruct,
    paper: RaphaelPaper,
    styles: RenderOptions,
  ): RaphaelSet {
    const pos = this.item.pos.map((p) => {
      return Scale.modelToCanvas(p, restruct.render.options) || new Vec2();
    });

    const refPoints = this.getReferencePoints();
    const scaleFactor = restruct.render.options.microModeScale;
    this.selectionSet = restruct.render.paper.set();
    this.selectionPointsSet = restruct.render.paper.set();
    this.selectionSet.push(
      generatePath(this.item.mode, paper, [pos[0], pos[1]]).attr(
        styles.selectionStyleSimpleObject,
      ),
    );
    refPoints.forEach((rp) => {
      const scaledRP = Scale.modelToCanvas(rp, restruct.render.options);
      this.selectionPointsSet.push(
        restruct.render.paper
          .circle(scaledRP.x, scaledRP.y, scaleFactor / 8)
          .attr({ fill: 'black' }),
      );
    });
    restruct.addReObjectPath(
      LayerMap.selectionPoints,
      this.visel,
      this.selectionPointsSet,
    );
    return this.selectionSet;
  }

  showPoints() {
    this.selectionPointsSet?.show();
  }

  hidePoints() {
    this.selectionPointsSet?.hide();
  }

  show(restruct: ReStruct, options: RenderOptions): void {
    const render = restruct.render;
    const pos = this.item.pos.map((p) => {
      return Scale.modelToCanvas(p, options) || new Vec2();
    });

    const path = generatePath(this.item.mode, render.paper, [pos[0], pos[1]]);

    const offset = options.offset;
    if (offset != undefined) path.translateAbs(offset.x, offset.y);

    this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
  }
}

function generatePath(
  mode: SimpleObjectMode,
  paper: RaphaelPaper,
  pos: [Vec2, Vec2],
): Element {
  let path: Element;
  switch (mode) {
    case SimpleObjectMode.ellipse: {
      path = draw.ellipse(paper, pos);
      break;
    }
    case SimpleObjectMode.rectangle: {
      path = draw.rectangle(paper, pos);
      break;
    }
    case SimpleObjectMode.line: {
      path = draw.line(paper, pos);
      break;
    }
    default: {
      throw new Error('Unsupported shape type');
    }
  }

  return path;
}

export default ReSimpleObject;
