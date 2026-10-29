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
import { type RxnArrowMode, RxnArrow } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';

import { LayerMap } from './generalEnumTypes';
import Raphael from '../raphael-extension';
import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { RenderOptions } from '../render.types';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import utility from '../util';
import { toFixed } from 'utilities';
import type { RaphaelPaper, RaphaelSet } from 'raphael';

type Arrow = {
  pos: Array<Vec2>;
  mode: RxnArrowMode;
  height?: number;
  arrowId?: number;
};

type ArrowParameters = {
  length: number;
  angle: number;
};
interface MinDistanceWithReferencePoint {
  minDist: number;
  refPoint: Vec2 | null;
}

class ReRxnArrow extends ReObject {
  item: Arrow;
  isResizing = false;

  constructor(/* chem.RxnArrow */ arrow: Arrow) {
    super('rxnArrow');
    this.item = arrow;
  }

  static isSelectable(): boolean {
    return true;
  }

  calcDistance(p: Vec2, s: number): MinDistanceWithReferencePoint {
    const point: Vec2 = new Vec2(p.x, p.y);
    const distributionReference: MinDistanceWithReferencePoint =
      this.getReferencePointDistance(p);
    const item = this.item;
    const pos = item.pos;

    let distribution: number = point.calculateDistanceToLine([pos[0], pos[1]]);

    if (RxnArrow.isElliptical(item)) {
      // currently an elliptical arrow is highlighted if a pointer is close to one of the 3 virtual lines
      // that form a triangle from the arrow's 3 reference points
      // TODO: make a better detection (maybe rectangular, so it's similar to visual highlight/selection)
      const [startPoint, endPoint, middlePoint] = this.getReferencePoints();
      distribution = Math.min(
        distribution,
        point.calculateDistanceToLine([startPoint, middlePoint]),
        point.calculateDistanceToLine([middlePoint, endPoint]),
      );
    }

    const referencePoint: Vec2 | null =
      distributionReference.minDist <= 8 / s
        ? distributionReference.refPoint
        : null;
    // distance is a smallest between dist to figure and it's reference points
    distribution = Math.min(distributionReference.minDist, distribution);
    return { minDist: distribution, refPoint: referencePoint };
  }

  getReferencePointDistance(p: Vec2): MinDistanceWithReferencePoint {
    const distribution: MinDistanceWithReferencePoint[] = [];
    const referencePoints = this.getReferencePoints();
    referencePoints.forEach((rp) => {
      distribution.push({ minDist: Math.abs(Vec2.dist(p, rp)), refPoint: rp });
    });

    const minDistribution: MinDistanceWithReferencePoint = distribution.reduce(
      (accumulator, current) =>
        accumulator.minDist < current.minDist ? accumulator : current,
      { minDist: Infinity, refPoint: null },
    );

    return minDistribution;
  }

  hoverPath(render: Render) {
    const path = this.generatePath(render, render.options, 'selection');

    return render.paper.path(path);
  }

  drawHover(render: Render) {
    const returnValue = this.hoverPath(render).attr(render.options.hoverStyle);
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, returnValue);
    return returnValue;
  }

  getReferencePoints(): Array<Vec2> {
    const referencePoints: Array<Vec2> = [];
    const item = this.item;
    const [a, b] = item.pos;
    const height = item.height;
    referencePoints.push(new Vec2(a.x, a.y), new Vec2(b.x, b.y));

    if (height !== undefined && RxnArrow.isElliptical(item)) {
      const middlePoint = findMiddlePoint(height, a, b);
      referencePoints.push(middlePoint);
    }
    return referencePoints;
  }

  makeAdditionalInfo(restruct: ReStruct) {
    const scaleFactor = restruct.render.options.microModeScale;
    const referencePoints = this.getReferencePoints();
    const selectionSet = restruct.render.paper.set();

    referencePoints.forEach((rp) => {
      const scaledRP = Scale.modelToCanvas(rp, restruct.render.options);
      selectionSet.push(
        restruct.render.paper
          .circle(scaledRP.x, scaledRP.y, scaleFactor / 8)
          .attr({ fill: 'black' }),
      );
    });

    return selectionSet;
  }

  makeSelectionPlate(
    restruct: ReStruct,
    _paper: RaphaelPaper,
    styles: RenderOptions,
  ): RaphaelSet {
    const render = restruct.render;
    const options = restruct.render.options;
    const selectionSet = restruct.render.paper.set();

    selectionSet.push(
      render.paper
        .path(this.generatePath(render, options, 'selection'))
        .attr(styles.selectionStyle),
    );
    return selectionSet;
  }

  generatePath(render: Render, options: RenderOptions, type: string) {
    let path;
    const item = this.item;
    const height =
      RxnArrow.isElliptical(item) && item.height
        ? item.height * options.microModeScale
        : 0;
    const pos = item.pos.map((p) => {
      return Scale.modelToCanvas(p, options) || new Vec2();
    });
    const { length, angle } = this.getArrowParams(
      pos[0].x,
      pos[0].y,
      pos[1].x,
      pos[1].y,
    );

    switch (type) {
      case 'selection':
        path = draw.rectangleArrowHighlightAndSelection(
          render.paper,
          { pos, height },
          length,
          angle,
        );
        break;
      case 'arrow':
        path = draw.arrow(
          render.paper,
          { ...item, pos, height },
          length,
          angle,
          options,
          this.isResizing,
        );
        break;
    }

    return path;
  }

  getArrowParams(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): ArrowParameters {
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Raphael.angle(x1, y1, x2, y2) - 180;

    return { length, angle };
  }

  show(restruct: ReStruct, _id: number, options: RenderOptions) {
    const path = this.generatePath(restruct.render, options, 'arrow');
    path.node?.setAttribute('data-testid', 'rxn-arrow');
    path.node?.setAttribute('data-arrowtype', this.item.mode + '-arrow');
    if (typeof this.item.arrowId === 'number') {
      path.node?.setAttribute('data-arrow-id', String(this.item.arrowId));
    }

    const offset = options.offset;
    if (offset != null) path.translateAbs(offset.x, offset.y);

    this.visel.add(path, Box2Abs.fromRelBox(utility.relBox(path.getBBox())));
  }
}

function findMiddlePoint(height: number, a: Vec2, b: Vec2) {
  if (+toFixed(height) === 0) {
    const minX = Math.min(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const x = minX + Math.abs(a.x - b.x) / 2;
    const y = minY + Math.abs(a.y - b.y) / 2;
    return new Vec2(x, y);
  }
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const lengthHyp = Math.hypot(length / 2, height);
  const coordinates1 = utility.calcCoordinates(a, b, lengthHyp).pos1;
  const coordinates2 = utility.calcCoordinates(a, b, lengthHyp).pos2;

  if (height > 0) {
    if (b.x < a.x) {
      return new Vec2(coordinates1?.x, coordinates1?.y);
    }
    if (b.x > a.x) {
      return new Vec2(coordinates2?.x, coordinates2?.y);
    }
    if (b.x === a.x) {
      if (b.y > a.y) {
        return new Vec2(coordinates2?.x, coordinates2?.y);
      }
      if (b.y < a.y) {
        return new Vec2(coordinates1?.x, coordinates1?.y);
      }
      if (b.y === a.y) {
        return new Vec2(a.x, a.y);
      }
    }
  } else {
    if (b.x > a.x) {
      return new Vec2(coordinates1?.x, coordinates1?.y);
    }
    if (b.x < a.x) {
      return new Vec2(coordinates2?.x, coordinates2?.y);
    }
    if (b.x === a.x) {
      if (b.y > a.y) {
        return new Vec2(coordinates1?.x, coordinates1?.y);
      }
      if (b.y < a.y) {
        return new Vec2(coordinates2?.x, coordinates2?.y);
      }
      if (b.y === a.y) {
        return new Vec2(a.x, a.y);
      }
    }
  }
  return new Vec2(a.x, a.y);
}

export default ReRxnArrow;
