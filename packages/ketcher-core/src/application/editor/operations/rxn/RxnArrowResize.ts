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
import { Vec2 } from 'domain/entities'
import { tfx } from 'utilities'
// import util from 'application/render/util'

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

      // if (item.height) {
      //   middlePoint = new Vec2(a.x + length / 2, a.y - item.height)
      // }

      if (item.height != null) {
        ;[, , middlePoint] = restruct.rxnArrows.get(id).getReferencePoints()
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
        // console.log(anchor, current, item.height, d)

        // console.log(current.y - anchor.y, current.x - anchor.x)
        // console.log(Math.hypot(current.y - anchor.y))
        // const prevCurrent = middlePoint.y
        const diffY = current.y - anchor.y
        // const diffX = current.x - anchor.x;
        // const minDiff = Math.min(diffX, diffY)
        if (item.pos[1].x >= item.pos[0].x) {
          item.height -= diffY
        } else {
          item.height += diffY
        }
        // item.height -= diffY

        console.log(item.height)
        // const hypot = Math.hypot(current.y - anchor.y, current.x - anchor.x)
        // item.height -= hypot
        const [, , newMP] = restruct.rxnArrows.get(id).getReferencePoints()
        // console.log(diff, hypot)
        // middlePoint.x = anchor.x = current.x
        // anchor.y = current.y
        anchor.y = newMP.y
        anchor.x = newMP.x
        // current.y = prevCurrent
        // console.log(anchor, current, item.height)
        // console.log(anchor, current, item.height, d)
      }
    } else {
      // item.height += d.x
      item.pos[1].add_(d)
    }

    restruct.rxnArrows
      .get(id)
      .visel.translate(Scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()

    if (!this.data.noinvalidate) {
      Base.invalidateItem(
        restruct,
        'rxnArrows',
        // @ts-ignore
        id,
        1
      )
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
