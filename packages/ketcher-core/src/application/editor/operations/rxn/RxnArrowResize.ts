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
    const [a, b] = item.pos

    if (anchor) {
      // const previousPos0 = a.get_xy0()
      // const previousPos1 = b.get_xy0()

      let length
      let middlePoint

      if (item.height != null) {
        length = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
        middlePoint = new Vec2(a.x + length / 2, a.y - item.height)
      }

      if (tfx(anchor.x) === tfx(a.x) && tfx(anchor.y) === tfx(a.y)) {
        a.x = anchor.x = current.x
        // current.x = previousPos0.x
        a.y = anchor.y = current.y
        // current.y = previousPos0.y
      }

      if (tfx(anchor.x) === tfx(b.x) && tfx(anchor.y) === tfx(b.y)) {
        b.x = anchor.x = current.x
        // current.x = previousPos1.x
        b.y = anchor.y = current.y
        // current.y = previousPos1.y
      }

      if (
        tfx(anchor.x) === tfx(middlePoint?.x) &&
        tfx(anchor.y) === tfx(middlePoint?.y)
      ) {
        item.height -= current.y - anchor.y
        anchor.y = current.y
      }
    } else {
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
