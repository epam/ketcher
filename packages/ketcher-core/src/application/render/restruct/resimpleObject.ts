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

import { Box2Abs, SimpleObjectMode, Vec2 } from 'domain/entities';

import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { tfx } from 'utilities';

interface MinDistanceWithReferencePoint {
  minDist: number;
  refPoint: Vec2 | null;
}
interface StyledPath {
  path: any;
  stylesApplied: boolean;
}
class ReSimpleObject extends ReObject {
  private item: any;
  private selectionSet: any;
  private selectionPointsSet: any;

  constructor(simpleObject: any) {
    super('simpleObject');
    this.item = simpleObject;
  }

  static isSelectable(): boolean {
    return true;
  }

  calcDistance(p: Vec2, s: any): MinDistanceWithReferencePoint {
    const point: Vec2 = new Vec2(p.x, p.y);

    const distRef: MinDistanceWithReferencePoint =
      this.getReferencePointDistance(p);
    const item = this.item;
    const mode = item.mode;
    const pos = item.pos;
    let dist: number;

    switch (mode) {
      case SimpleObjectMode.ellipse: {
        const rad = Vec2.diff(pos[1], pos[0]);
        const rx = rad.x / 2;
        const ry = rad.y / 2;
        const center = Vec2.sum(pos[0], new Vec2(rx, ry));
        const pointToCenter = Vec2.diff(point, center);
        if (rx !== 0 && ry !== 0) {
          dist = Math.abs(
            1 -
              (pointToCenter.x * pointToCenter.x) / (rx * rx) -
              (pointToCenter.y * pointToCenter.y) / (ry * ry),
          );
        } else {
          // in case rx or ry is equal to 0 we have a line as a trivial case of ellipse
          // in such case distance need to be calculated as a distance between line and current point
          dist = point.calculateDistanceToLine([pos[0], pos[1]]);
        }
        break;
      }
      case SimpleObjectMode.rectangle: {
        const topX = Math.min(pos[0].x, pos[1].x);
        const topY = Math.min(pos[0].y, pos[1].y);
        const bottomX = Math.max(pos[0].x, pos[1].x);
        const bottomY = Math.max(pos[0].y, pos[1].y);

        const distances: Array<number> = [];

        if (point.x >= topX && point.x <= bottomX) {
          if (point.y < topY) {
            distances.push(topY - point.y);
          } else if (point.y > bottomY) {
            distances.push(point.y - bottomY);
          } else {
            distances.push(point.y - topY, bottomY - point.y);
          }
        }
        if (point.x < topX && point.y < topY) {
          distances.push(Vec2.dist(new Vec2(topX, topY), point));
        }
        if (point.x > bottomX && point.y > bottomY) {
          distances.push(Vec2.dist(new Vec2(bottomX, bottomY), point));
        }
        if (point.x < topX && point.y > bottomY) {
          distances.push(Vec2.dist(new Vec2(topX, bottomY), point));
        }
        if (point.x > bottomX && point.y < topY) {
          distances.push(Vec2.dist(new Vec2(bottomX, topY), point));
        }
        if (point.y >= topY && point.y <= bottomY) {
          if (point.x < topX) {
            distances.push(topX - point.x);
          } else if (point.x > bottomX) {
            distances.push(point.x - bottomX);
          } else {
            distances.push(point.x - topX, bottomX - point.x);
          }
        }
        dist = Math.min(...distances);
        break;
      }
      case SimpleObjectMode.line: {
        dist = point.calculateDistanceToLine([pos[0], pos[1]]);
        break;
      }

      default: {
        throw new Error('Unsupported shape type');
      }
    }

    const refPoint: Vec2 | null =
      distRef.minDist <= 8 / s ? distRef.refPoint : null;
    // distance is a smallest between dist to figure and it's reference points
    dist = Math.min(distRef.minDist, dist);
    return { minDist: dist, refPoint };
  }

  getReferencePointDistance(p: Vec2): MinDistanceWithReferencePoint {
    const dist: any = [];
    const refPoints = this.getReferencePoints();
    refPoints.forEach((rp) => {
      dist.push({ minDist: Math.abs(Vec2.dist(p, rp)), refPoint: rp });
    });

    const minDist: MinDistanceWithReferencePoint = dist.reduce(
      (acc, current) =>
        !acc ? current : acc.minDist < current.minDist ? acc : current,
      null,
    );

    return minDist;
  }

  getReferencePoints(onlyOnObject = false): Array<Vec2> {
    const refPoints: Array<Vec2> = [];
    switch (this.item.mode) {
      case SimpleObjectMode.ellipse:
      case SimpleObjectMode.rectangle: {
        const p0: Vec2 = new Vec2(
          Math.min(this.item.pos[0].x, this.item.pos[1].x),
          Math.min(this.item.pos[0].y, this.item.pos[1].y),
        );
        const w = Math.abs(Vec2.diff(this.item.pos[0], this.item.pos[1]).x);
        const h = Math.abs(Vec2.diff(this.item.pos[0], this.item.pos[1]).y);

        refPoints.push(
          new Vec2(p0.x + 0.5 * w, p0.y),
          new Vec2(p0.x + w, p0.y + 0.5 * h),
          new Vec2(p0.x + 0.5 * w, p0.y + h),
          new Vec2(p0.x, p0.y + 0.5 * h),
        );
        if (!onlyOnObject || this.item.mode === SimpleObjectMode.rectangle) {
          refPoints.push(
            p0,
            new Vec2(p0.x, p0.y + h),
            new Vec2(p0.x + w, p0.y + h),
            new Vec2(p0.x + w, p0.y),
          );
        }
        break;
      }
      case SimpleObjectMode.line: {
        this.item.pos.forEach((i) => refPoints.push(new Vec2(i.x, i.y, 0)));
        break;
      }

      default: {
        throw new Error('Unsupported shape type');
      }
    }
    return refPoints;
  }

  getFigureHoverPath(path: any, render: Render, isBorder = true) {
    if (isBorder) {
      return path.attr({ ...render.options.hoverStyle, fill: 'none' });
    } else {
      return path.attr(render.options.innerHoverStyle);
    }
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
        const centerX = tfx(point[0].x + rx);
        const centerY = tfx(point[0].y + ry);
        const outerBorderEllipse = render.paper.ellipse(
          centerX,
          centerY,
          tfx(Math.abs(rx) + lineOffset),
          tfx(Math.abs(ry) + lineOffset),
        );
        paths.push({
          path: this.getFigureHoverPath(outerBorderEllipse, render),
          stylesApplied: true,
        });

        const fillEllipse = render.paper.ellipse(
          centerX,
          centerY,
          tfx(Math.abs(rx)),
          tfx(Math.abs(ry)),
        );
        paths.push({
          path: this.getFigureHoverPath(fillEllipse, render, false),
          stylesApplied: true,
        });
        if (
          Math.abs(rx) - scaleFactor / 8 > 0 &&
          Math.abs(ry) - scaleFactor / 8 > 0
        ) {
          const innerBorderEllipse = render.paper.ellipse(
            centerX,
            centerY,
            tfx(Math.abs(rx) - lineOffset),
            tfx(Math.abs(ry) - lineOffset),
          );
          paths.push({
            path: this.getFigureHoverPath(innerBorderEllipse, render),
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
          tfx(leftX - lineOffset),
          tfx(topY - lineOffset),
          tfx(rightX + 2 * lineOffset),
          tfx(bottomY + 2 * lineOffset),
        );
        paths.push({
          path: this.getFigureHoverPath(outerBorderRect, render),
          stylesApplied: true,
        });
        const fillRect = render.paper.rect(
          tfx(leftX),
          tfx(topY),
          tfx(rightX),
          tfx(bottomY),
        );
        paths.push({
          path: this.getFigureHoverPath(fillRect, render, false),
          stylesApplied: true,
        });
        if (rightX - 2 * lineOffset > 0 && bottomY - 2 * lineOffset > 0) {
          const innerRect = render.paper.rect(
            tfx(leftX + lineOffset),
            tfx(topY + lineOffset),
            tfx(rightX - 2 * lineOffset),
            tfx(bottomY - 2 * lineOffset),
          );
          paths.push({
            path: this.getFigureHoverPath(innerRect, render),
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
        );
        poly.push(
          'L',
          p1.x + ((k * scaleFactor) / 8) * Math.sin(angle),
          p1.y - ((k * scaleFactor) / 8) * Math.cos(angle),
        );
        poly.push(
          'L',
          p1.x - ((k * scaleFactor) / 8) * Math.sin(angle),
          p1.y + ((k * scaleFactor) / 8) * Math.cos(angle),
        );
        poly.push(
          'L',
          p0.x - ((k * scaleFactor) / 8) * Math.sin(angle),
          p0.y + ((k * scaleFactor) / 8) * Math.cos(angle),
        );
        poly.push(
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

  drawHover(render: Render): Array<any> {
    const paths: Array<any> = this.hoverPath(render).map((enhPath) => {
      if (!enhPath.stylesApplied) {
        return enhPath.path.attr(render.options.hoverStyle);
      }
      return enhPath.path;
    });

    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, paths);
    return paths;
  }

  makeSelectionPlate(restruct: ReStruct, paper: any, styles: any): any {
    const pos = this.item.pos.map((p) => {
      return Scale.modelToCanvas(p, restruct.render.options) || new Vec2();
    });

    const refPoints = this.getReferencePoints();
    const scaleFactor = restruct.render.options.microModeScale;
    this.selectionSet = restruct.render.paper.set();
    this.selectionPointsSet = restruct.render.paper.set();
    this.selectionSet.push(
      generatePath(this.item.mode, paper, pos).attr(
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

  togglePoints(displayFlag: boolean) {
    displayFlag
      ? this.selectionPointsSet?.show()
      : this.selectionPointsSet?.hide();
  }

  show(restruct: ReStruct, options: any): void {
    const render = restruct.render;
    const pos = this.item.pos.map((p) => {
      return Scale.modelToCanvas(p, options) || new Vec2();
    });

    const path = generatePath(this.item.mode, render.paper, pos);

    const offset = options.offset;
    if (offset != null) path.translateAbs(offset.x, offset.y);

    this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
  }
}

function generatePath(mode: SimpleObjectMode, paper, pos: [Vec2, Vec2]): any {
  let path: any;
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
