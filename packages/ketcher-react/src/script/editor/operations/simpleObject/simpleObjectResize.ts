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
import Base, { invalidateItem, OperationType } from '../base'
import { SimpleObjectMode } from '../../../chem/struct'
import Vec2 from 'src/script/util/vec2'
import util from '../../../render/util'
import { makeCircleFromEllipse } from './simpleObjectUtil'
import scale from '../../../util/scale'

const tfx = util.tfx

interface SimpleObjectResizeData {
  id: string
  d: any
  current: Vec2
  anchor: Vec2
  noinvalidate: boolean
  toCircle: boolean
}

function handleEllipseChangeIfAnchorIsOnAxis(anchor, item, current) {
  const previousPos0 = item.pos[0].get_xy0()
  const previousPos1 = item.pos[1].get_xy0()
  if (tfx(anchor.x) === tfx(item.pos[1].x)) {
    item.pos[1].x = anchor.x = current.x
    current.x = previousPos1.x
  }
  if (tfx(anchor.y) === tfx(item.pos[1].y)) {
    item.pos[1].y = anchor.y = current.y
    current.y = previousPos1.y
  }
  if (tfx(anchor.x) === tfx(item.pos[0].x)) {
    item.pos[0].x = anchor.x = current.x
    current.x = previousPos0.x
  }
  if (tfx(anchor.y) === tfx(item.pos[0].y)) {
    item.pos[0].y = anchor.y = current.y
    current.y = previousPos0.y
  }
}

function handleEllipseChangeIfAnchorIsOnDiagonal(anchor, item, current) {
  const rad = Vec2.diff(item.pos[1], item.pos[0])
  const rx = Math.abs(rad.x / 2)
  const ry = Math.abs(rad.y / 2)
  const topLeftX = item.pos[0].x <= item.pos[1].x ? item.pos[0] : item.pos[1]
  const topLeftY = item.pos[0].y <= item.pos[1].y ? item.pos[0] : item.pos[1]
  const bottomRightX =
    item.pos[0].x <= item.pos[1].x ? item.pos[1] : item.pos[0]
  const bottomRightY =
    item.pos[0].y <= item.pos[1].y ? item.pos[1] : item.pos[0]
  //check in which quarter the anchor is placed
  const firstQuarter = anchor.x > topLeftX.x + rx && anchor.y <= topLeftY.y + ry
  const secondQuarter =
    anchor.x <= topLeftX.x + rx && anchor.y <= topLeftY.y + ry
  const thirdQuarter = anchor.x <= topLeftX.x + rx && anchor.y > topLeftY.y + ry
  const forthQuarter = anchor.x > topLeftX.x + rx && anchor.y > topLeftY.y + ry
  if (current.x >= topLeftX.x && (firstQuarter || forthQuarter))
    bottomRightX.x = current.x
  if (current.y <= bottomRightY.y && (firstQuarter || secondQuarter))
    topLeftY.y = current.y
  if (current.x <= bottomRightX.x && (secondQuarter || thirdQuarter))
    topLeftX.x = current.x
  if (current.y >= topLeftY.y && (thirdQuarter || forthQuarter))
    bottomRightY.y = current.y
}

function handleRectangleChangeWithAnchor(item, anchor, current) {
  const previousPos0 = item.pos[0].get_xy0()
  const previousPos1 = item.pos[1].get_xy0()

  if (tfx(anchor.x) === tfx(item.pos[1].x)) {
    item.pos[1].x = anchor.x = current.x
    current.x = previousPos1.x
  }
  if (tfx(anchor.y) === tfx(item.pos[1].y)) {
    item.pos[1].y = anchor.y = current.y
    current.y = previousPos1.y
  }
  if (tfx(anchor.x) === tfx(item.pos[0].x)) {
    item.pos[0].x = anchor.x = current.x
    current.x = previousPos0.x
  }
  if (tfx(anchor.y) === tfx(item.pos[0].y)) {
    item.pos[0].y = anchor.y = current.y
    current.y = previousPos0.y
  }
}

export class SimpleObjectResize extends Base {
  data: SimpleObjectResizeData

  constructor(
    id: string,
    d: any,
    current: Vec2,
    anchor: any,
    noinvalidate: boolean,
    toCircle: boolean
  ) {
    super(OperationType.SIMPLE_OBJECT_RESIZE)
    this.data = { id, d, current, anchor, noinvalidate, toCircle }
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    const current = this.data.current
    const item = struct.simpleObjects.get(id)
    const anchor = this.data.anchor
    if (item.mode === SimpleObjectMode.ellipse) {
      if (anchor) {
        if (
          tfx(anchor.y) !== tfx(item.pos[0].y) &&
          tfx(anchor.x) !== tfx(item.pos[0].x) &&
          tfx(anchor.y) !== tfx(item.pos[1].y) &&
          tfx(anchor.x) !== tfx(item.pos[1].x)
        ) {
          handleEllipseChangeIfAnchorIsOnDiagonal(anchor, item, current)
        } else {
          handleEllipseChangeIfAnchorIsOnAxis(anchor, item, current)
        }
      } else if (this.data.toCircle) {
        const previousPos1 = item.pos[1].get_xy0()
        const circlePoint = makeCircleFromEllipse(item.pos[0], current)
        item.pos[1].x = circlePoint.x
        item.pos[1].y = circlePoint.y
        this.data.current = previousPos1
      } else {
        const previousPos1 = item.pos[1].get_xy0()
        item.pos[1].x = current.x
        item.pos[1].y = current.y
        this.data.current = previousPos1
      }
    } else if (item.mode === SimpleObjectMode.line && anchor) {
      const previousPos1 = anchor.get_xy0()
      anchor.x = current.x
      anchor.y = current.y
      this.data.current = previousPos1
    } else if (item.mode === SimpleObjectMode.rectangle && anchor) {
      handleRectangleChangeWithAnchor.call(this, item, anchor, current)
    } else item.pos[1].add_(d)

    restruct.simpleObjects
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate)
      invalidateItem(restruct, 'simpleObjects', id, 1)
  }
  invert(): Base {
    return new SimpleObjectResize(
      this.data.id,
      this.data.d,
      this.data.current,
      this.data.anchor,
      this.data.noinvalidate,
      this.data.toCircle
    )
  }
}
