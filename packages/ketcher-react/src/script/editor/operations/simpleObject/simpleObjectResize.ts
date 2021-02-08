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
import Base, {invalidateItem, OperationType} from "../base";
import {SimpleObjectMode} from "../../../chem/struct";
import Vec2 from "src/script/util/vec2";
import util from "../../../render/util";
import {makeCircleFromEllipse} from "./simpleObjectUtil";
import scale from "../../../util/scale";

const tfx = util.tfx

class SimpleObjectResizeData {
  id: string
  d: any
  current: Vec2
  anchor: Vec2
  noinvalidate: boolean
  toCircle: boolean


  constructor(id: string, d: any, current:Vec2, anchor:Vec2, noinvalidate: boolean, toCircle: boolean) {
    this.id = id;
    this.d = d;
    this.current = current;
    this.anchor = anchor;
    this.noinvalidate = noinvalidate;
    this.toCircle = toCircle;
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
    this.data = new SimpleObjectResizeData(id, d, current, anchor, noinvalidate, toCircle)
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    const current = this.data.current
    const item = struct.simpleObjects.get(id)
    const anchor = this.data.anchor
    console.log(1)
    if (item.mode === SimpleObjectMode.ellipse) {
      console.log(2)
      if (anchor) {
        console.log(3)
        const previousPos0 = item.pos[0].get_xy0()
        const previousPos1 = item.pos[1].get_xy0()

        if (tfx(anchor.x) === tfx(item.pos[1].x) ) {
          console.log(4)
          item.pos[1].x = anchor.x = current.x
          this.data.current.x = previousPos1.x
        }
        if (tfx(anchor.y) === tfx(item.pos[1].y)) {
          console.log(5)
          item.pos[1].y = anchor.y = current.y
          this.data.current.y = previousPos1.y
        }
        if (tfx(anchor.x) === tfx(item.pos[0].x)) {
          console.log(6)
          item.pos[0].x = anchor.x = current.x
          this.data.current.x = previousPos0.x
        }
        if (tfx(anchor.y) === tfx(item.pos[0].y)) {
          console.log(7)
          item.pos[0].y = anchor.y = current.y
          this.data.current.y = previousPos0.y
        }
        if (
          tfx(anchor.y) !== tfx(item.pos[0].y) &&
          tfx(anchor.x) !== tfx(item.pos[0].x) &&
          tfx(anchor.y) !== tfx(item.pos[1].y) &&
          tfx(anchor.x) !== tfx(item.pos[1].x)
        ) {
          console.log(8)
          const rad = Vec2.diff(item.pos[1], item.pos[0])
          const rx = Math.abs(rad.x / 2)
          const ry = Math.abs(rad.y / 2)
          const topLeftX =
            item.pos[0].x <= item.pos[1].x ? item.pos[0] : item.pos[1]
          const topLeftY =
            item.pos[0].y <= item.pos[1].y ? item.pos[0] : item.pos[1]
          const bottomRightX =
            item.pos[0].x <= item.pos[1].x ? item.pos[1] : item.pos[0]
          const bottomRightY =
            item.pos[0].y <= item.pos[1].y ? item.pos[1] : item.pos[0]
          if (anchor.x <= topLeftX.x + rx) {
              console.log(81)
              topLeftX.x = current.x
          } else {
            console.log(82)
              bottomRightX.x = current.x
          }
          if (anchor.y <= topLeftY.y + ry) {
            console.log(83)
              topLeftY.y = current.y
          } else {
            console.log(84)
              bottomRightY.y = current.y
          }
        }
      } else if (this.data.toCircle) {
        console.log(9)
        const previousPos1 = item.pos[1].get_xy0()
        const circlePoint = makeCircleFromEllipse(item.pos[0], current)
        item.pos[1].x = circlePoint.x
        item.pos[1].y = circlePoint.y
        this.data.current = previousPos1
      } else {
        console.log(10)
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
      const previousPos0 = item.pos[0].get_xy0()
      const previousPos1 = item.pos[1].get_xy0()

      if (tfx(anchor.x) === tfx(item.pos[1].x)) {
        item.pos[1].x = anchor.x = current.x
        this.data.current.x = previousPos1.x
      }
      if (tfx(anchor.y) === tfx(item.pos[1].y)) {
        item.pos[1].y = anchor.y = current.y
        this.data.current.y = previousPos1.y
      }
      if (tfx(anchor.x) === tfx(item.pos[0].x)) {
        item.pos[0].x = anchor.x = current.x
        this.data.current.x = previousPos0.x
      }
      if (tfx(anchor.y) === tfx(item.pos[0].y)) {
        item.pos[0].y = anchor.y = current.y
        this.data.current.y = previousPos0.y
      }
    } else item.pos[1].add_(d)

    restruct.simpleObjects
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate)
      invalidateItem(restruct, 'simpleObjects', id, 1)
  }
}