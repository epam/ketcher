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

import Base from '../base'
import { OperationType } from '../OperationType'
import { Scale } from 'domain/helpers'
import { RxnArrow, Vec2 } from 'domain/entities'
import { tfx } from 'utilities'
interface RxnArrowResizeData {
  id: number
  d: any
  current: Vec2
  anchor: Vec2
  noinvalidate: boolean
}
export class RxnArrowResize extends Base {
  data: RxnArrowResizeData

  constructor(
    id: number,
    d: any,
    current: Vec2,
    anchor: any,
    noinvalidate: boolean
  ) {
    super(OperationType.RXN_ARROW_RESIZE)
    this.data = { id, d, current, anchor, noinvalidate }
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    const current = this.data.current
    const item = struct.rxnArrows.get(id)
    const anchor = this.data.anchor
    if (anchor) {
      const previousPos0 = item.pos[0].get_xy0()
      const previousPos1 = item.pos[1].get_xy0()
      let middlePoint
      let reItem

      if (RxnArrow.isElliptical(item)) {
        reItem = restruct.rxnArrows.get(id)
        ;[, , middlePoint] = reItem.getReferencePoints()
      }

      if (
        tfx(anchor.x) === tfx(item.pos[1].x) &&
        tfx(anchor.y) === tfx(item.pos[1].y)
      ) {
        item.pos[1].x = anchor.x = current.x
        current.x = previousPos1.x
        item.pos[1].y = anchor.y = current.y
        current.y = previousPos1.y
      }

      if (
        tfx(anchor.x) === tfx(item.pos[0].x) &&
        tfx(anchor.y) === tfx(item.pos[0].y)
      ) {
        item.pos[0].x = anchor.x = current.x
        current.x = previousPos0.x
        item.pos[0].y = anchor.y = current.y
        current.y = previousPos0.y
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
        )
        const angleInRadians = (angle * Math.PI) / 180
        const cosAngle = Math.cos(angleInRadians)
        const sinAngle = Math.sin(angleInRadians)

        const diffX = current.x - anchor.x
        const diffY = current.y - anchor.y

        const diff = diffY * cosAngle - diffX * sinAngle
        item.height -= diff

        const [, , newMiddlePoint] = reItem.getReferencePoints()

        anchor.y = newMiddlePoint.y
        anchor.x = newMiddlePoint.x
      }
    } else {
      item.pos[1].add_(d)
    }

    restruct.rxnArrows
      .get(id)
      .visel.translate(Scale.increaseBy(d, restruct.render.options))
    this.data.d = d.negated()

    if (!this.data.noinvalidate) {
      Base.invalidateItem(restruct, 'rxnArrows', id, 1)
    }
  }

  invert(): Base {
    return new RxnArrowResize(
      this.data.id,
      this.data.d,
      this.data.current,
      this.data.anchor,
      this.data.noinvalidate
    )
  }
}
