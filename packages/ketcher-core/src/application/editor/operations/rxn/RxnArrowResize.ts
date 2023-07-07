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

import { ReStruct } from 'application/render';
import assert from 'assert';
import { RxnArrow, Vec2 } from 'domain/entities';
import { Scale } from 'domain/helpers';
import { tfx } from 'utilities';
import { OperationType } from '../OperationType';
import Base from '../base';

export const ARROW_MAX_SNAPPING_ANGLE = Math.PI / 12; // 15°

interface RxnArrowResizeData {
  id: number;
  d: Vec2;
  current: Vec2;
  anchor: Vec2 | null;
  noinvalidate: boolean;
}
export class RxnArrowResize extends Base {
  data: RxnArrowResizeData;
  isSnappingEnabled: boolean;

  constructor(
    id: number,
    d: Vec2,
    current: Vec2,
    anchor: Vec2 | null,
    noinvalidate: boolean,
    isSnappingEnabled: boolean
  ) {
    super(OperationType.RXN_ARROW_RESIZE);
    this.data = { id, d, current, anchor, noinvalidate };
    this.isSnappingEnabled = isSnappingEnabled;
  }

  execute(restruct: ReStruct): void {
    const struct = restruct.molecule;
    const id = this.data.id;
    let d = this.data.d;
    const current = this.data.current;
    const item = struct.rxnArrows.get(id);
    const reItem = restruct.rxnArrows.get(id);
    assert(item != null && reItem != null);
    const anchor = this.data.anchor;
    if (anchor) {
      const previousPos0 = item.pos[0].get_xy0();
      const previousPos1 = item.pos[1].get_xy0();
      let middlePoint;

      if (RxnArrow.isElliptical(item)) {
        [, , middlePoint] = reItem.getReferencePoints();
      }

      if (
        /**
         *          (anchor)
         *   (pos[1])   ^
         *              |  ↘ (d)
         *   (pos[0])   o —— > (current)
         *
         * more details: ./RxnArrowResize.doc.png
         */
        tfx(anchor.x) === tfx(item.pos[1].x) &&
        tfx(anchor.y) === tfx(item.pos[1].y)
      ) {
        if (this.isSnappingEnabled) {
          const currentArrowVector = current.sub(item.pos[0]);
          const snappedArrowVector = getSnappedArrowVector(currentArrowVector);
          const snappedCurrent = item.pos[0].add(snappedArrowVector);
          current.x = snappedCurrent.x;
          current.y = snappedCurrent.y;
        }
        item.pos[1].x = anchor.x = current.x;
        current.x = previousPos1.x;
        item.pos[1].y = anchor.y = current.y;
        current.y = previousPos1.y;
      }

      if (
        /**
         *          (anchor)
         *   (pos[0])   o
         *              |  ↘ (d)
         *   (pos[1])   x —— o  (current)
         *
         * more details: ./RxnArrowResize.doc.png
         */
        tfx(anchor.x) === tfx(item.pos[0].x) &&
        tfx(anchor.y) === tfx(item.pos[0].y)
      ) {
        if (this.isSnappingEnabled) {
          const currentArrowVector = current.sub(item.pos[1]);
          const snappedArrowVector = getSnappedArrowVector(currentArrowVector);
          const snappedCurrent = item.pos[1].add(snappedArrowVector);
          current.x = snappedCurrent.x;
          current.y = snappedCurrent.y;
        }
        item.pos[0].x = anchor.x = current.x;
        current.x = previousPos0.x;
        item.pos[0].y = anchor.y = current.y;
        current.y = previousPos0.y;
      }

      if (
        tfx(anchor.x) === tfx(middlePoint?.x) &&
        tfx(anchor.y) === tfx(middlePoint?.y)
      ) {
        const { angle } = reItem.getArrowParams(
          item.pos[0].x,
          item.pos[0].y,
          item.pos[1].x,
          item.pos[1].y
        );
        const angleInRadians = (angle * Math.PI) / 180;
        const cosAngle = Math.cos(angleInRadians);
        const sinAngle = Math.sin(angleInRadians);

        const diffX = current.x - anchor.x;
        const diffY = current.y - anchor.y;

        const diff = diffY * cosAngle - diffX * sinAngle;
        if (item.height !== undefined) {
          item.height -= diff;
        }

        const [, , newMiddlePoint] = reItem.getReferencePoints();

        anchor.y = newMiddlePoint.y;
        anchor.x = newMiddlePoint.x;
      }
    } else {
      if (this.isSnappingEnabled) {
        d = getSnappedArrowVector(d);
      }
      item.pos[1].add_(d);
    }

    reItem.visel.translate(Scale.obj2scaled(d, restruct.render.options));
    this.data.d = d.negated();

    if (!this.data.noinvalidate) {
      Base.invalidateItem(restruct, 'rxnArrows', id, 1);
    }
  }

  invert(): Base {
    return new RxnArrowResize(
      this.data.id,
      this.data.d,
      this.data.current,
      this.data.anchor,
      this.data.noinvalidate,
      this.isSnappingEnabled
    );
  }
}

export function getSnappedArrowVector(arrow: Vec2) {
  const AXIS = {
    POSITIVE_X: 0,
    POSITIVE_Y: Math.PI / 2,
    NEGATIVE_X: [Math.PI, -Math.PI],
    NEGATIVE_Y: -Math.PI / 2,
  };
  const oxAngle = arrow.oxAngle();
  const arrowLength = arrow.length();
  const isSnappingToPositiveXAxis =
    Math.abs(oxAngle - AXIS.POSITIVE_X) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToPositiveXAxis) {
    return new Vec2(arrowLength, 0);
  }
  const isSnappingToPositiveYAxis =
    Math.abs(oxAngle - AXIS.POSITIVE_Y) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToPositiveYAxis) {
    return new Vec2(0, arrowLength);
  }
  const isSnappingToNegativeXAxis =
    Math.abs(oxAngle - AXIS.NEGATIVE_X[0]) <= ARROW_MAX_SNAPPING_ANGLE ||
    Math.abs(oxAngle - AXIS.NEGATIVE_X[1]) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToNegativeXAxis) {
    return new Vec2(-arrowLength, 0);
  }
  const isSnappingToNegativeYAxis =
    Math.abs(oxAngle - AXIS.NEGATIVE_Y) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToNegativeYAxis) {
    return new Vec2(0, -arrowLength);
  }
  return arrow;
}
