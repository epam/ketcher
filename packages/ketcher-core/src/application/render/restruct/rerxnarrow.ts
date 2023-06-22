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

import { Box2Abs, RxnArrow, RxnArrowMode, Vec2 } from 'domain/entities'

import { LayerMap } from './generalEnumTypes'
import Raphael from '../raphael-ext'
import ReObject from './reobject'
import ReStruct from './restruct'
import { Render } from '../raphaelRender'
import { Scale } from 'domain/helpers'
import draw from '../draw'
import util from '../util'
import { tfx } from 'utilities'

type Arrow = {
  pos: Array<Vec2>
  mode: RxnArrowMode
  height?: number
}

type ArrowParams = {
  length: number
  angle: number
}
interface MinDistanceWithReferencePoint {
  minDist: number
  refPoint: Vec2 | null
}

class ReRxnArrow extends ReObject {
  item: Arrow
  isResizing = false

  constructor(/* chem.RxnArrow */ arrow: Arrow) {
    super('rxnArrow')
    this.item = arrow
  }

  static isSelectable(): boolean {
    return true
  }

  calcDistance(p: Vec2, s: any): MinDistanceWithReferencePoint {
    const point: Vec2 = new Vec2(p.x, p.y)
    const distRef: MinDistanceWithReferencePoint =
      this.getReferencePointDistance(p)
    const item = this.item
    const pos = item.pos

    let dist: number = calculateDistanceToLine(pos, point)

    if (RxnArrow.isElliptical(item)) {
      // currently an elliptical arrow is highlighted if a pointer is close to one of the 3 virtual lines
      // that form a triangle from the arrow's 3 reference points
      // TODO: make a better detection (maybe rectangular, so it's similar to visual highlight/selection)
      const [startPoint, endPoint, middlePoint] = this.getReferencePoints()
      dist = Math.min(
        dist,
        calculateDistanceToLine([startPoint, middlePoint], point),
        calculateDistanceToLine([middlePoint, endPoint], point)
      )
    }

    const refPoint: Vec2 | null =
      distRef.minDist <= 8 / s ? distRef.refPoint : null
    // distance is a smallest between dist to figure and it's reference points
    dist = Math.min(distRef.minDist, dist)
    return { minDist: dist, refPoint }
  }

  getReferencePointDistance(p: Vec2): MinDistanceWithReferencePoint {
    const dist: any = []
    const refPoints = this.getReferencePoints()
    refPoints.forEach((rp) => {
      dist.push({ minDist: Math.abs(Vec2.dist(p, rp)), refPoint: rp })
    })

    const minDist: MinDistanceWithReferencePoint = dist.reduce(
      (acc, current) =>
        !acc ? current : acc.minDist < current.minDist ? acc : current,
      null
    )

    return minDist
  }

  hoverPath(render: Render) {
    const path = this.generatePath(render, render.options, 'selection')

    return render.paper.path(path)
  }

  drawHover(render: Render) {
    const ret = this.hoverPath(render).attr(render.options.hoverStyle)
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret)
    return ret
  }

  getReferencePoints(): Array<Vec2> {
    const refPoints: Array<Vec2> = []
    const item = this.item
    const [a, b] = item.pos
    const height = item.height
    refPoints.push(new Vec2(a.x, a.y))
    refPoints.push(new Vec2(b.x, b.y))

    if (RxnArrow.isElliptical(item)) {
      const middlePoint = findMiddlePoint(height!, a, b)
      refPoints.push(middlePoint)
    }
    return refPoints
  }

  makeAdditionalInfo(restruct: ReStruct) {
    const scaleFactor = restruct.render.options.scale
    const refPoints = this.getReferencePoints()
    const selectionSet = restruct.render.paper.set()

    refPoints.forEach((rp) => {
      const scaledRP = Scale.obj2scaled(rp, restruct.render.options)
      selectionSet.push(
        restruct.render.paper
          .circle(scaledRP.x, scaledRP.y, scaleFactor / 8)
          .attr({ fill: 'black' })
      )
    })

    return selectionSet
  }

  makeSelectionPlate(restruct: ReStruct, _paper, styles) {
    const render = restruct.render
    const options = restruct.render.options
    const selectionSet = restruct.render.paper.set()

    selectionSet.push(
      render.paper
        .path(this.generatePath(render, options, 'selection'))
        .attr(styles.selectionStyle)
    )
    return selectionSet
  }

  generatePath(render: Render, options, type) {
    let path
    const item = this.item
    const height =
      RxnArrow.isElliptical(item) && item.height
        ? item.height * options.scale
        : 0
    const pos = item.pos.map((p) => {
      return Scale.obj2scaled(p, options) || new Vec2()
    })
    const { length, angle } = this.getArrowParams(
      pos[0].x,
      pos[0].y,
      pos[1].x,
      pos[1].y
    )

    switch (type) {
      case 'selection':
        path = draw.rectangleArrowHighlightAndSelection(
          render.paper,
          { pos, height },
          length,
          angle
        )
        break
      case 'arrow':
        path = draw.arrow(
          render.paper,
          { ...item, pos, height },
          length,
          angle,
          options,
          this.isResizing
        )
        break
    }

    return path
  }

  getArrowParams(x1, y1, x2, y2): ArrowParams {
    const length = Math.hypot(x2 - x1, y2 - y1)
    const angle = Raphael.angle(x1, y1, x2, y2) - 180

    return { length, angle }
  }

  show(restruct: ReStruct, _id, options) {
    const path = this.generatePath(restruct.render, options, 'arrow')

    const offset = options.offset
    if (offset != null) path.translateAbs(offset.x, offset.y)

    this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())))
  }
}

function calculateDistanceToLine(pos: Array<Vec2>, point: Vec2): number {
  let dist: number
  if (
    (point.x < Math.min(pos[0].x, pos[1].x) ||
      point.x > Math.max(pos[0].x, pos[1].x)) &&
    (point.y < Math.min(pos[0].y, pos[1].y) ||
      point.y > Math.max(pos[0].y, pos[1].y))
  ) {
    dist = Math.min(Vec2.dist(pos[0], point), Vec2.dist(pos[1], point))
  } else {
    const a = Vec2.dist(pos[0], pos[1])
    const b = Vec2.dist(pos[0], point)
    const c = Vec2.dist(pos[1], point)
    const per = (a + b + c) / 2
    dist = (2 / a) * Math.sqrt(per * (per - a) * (per - b) * (per - c))
  }
  return dist
}
function findMiddlePoint(height: number, a: Vec2, b: Vec2) {
  if (+tfx(height) === 0) {
    const minX = Math.min(a.x, b.x)
    const minY = Math.min(a.y, b.y)
    const x = minX + Math.abs(a.x - b.x) / 2
    const y = minY + Math.abs(a.y - b.y) / 2
    return new Vec2(x, y)
  }
  const length = Math.hypot(b.x - a.x, b.y - a.y)
  const lengthHyp = Math.hypot(length / 2, height)
  const coordinates1 = util.calcCoordinates(a, b, lengthHyp).pos1
  const coordinates2 = util.calcCoordinates(a, b, lengthHyp).pos2

  if (height > 0) {
    if (b.x < a.x) {
      return new Vec2(coordinates1?.x, coordinates1?.y)
    }
    if (b.x > a.x) {
      return new Vec2(coordinates2?.x, coordinates2?.y)
    }
    if (b.x === a.x) {
      if (b.y > a.y) {
        return new Vec2(coordinates2?.x, coordinates2?.y)
      }
      if (b.y < a.y) {
        return new Vec2(coordinates1?.x, coordinates1?.y)
      }
      if (b.y === a.y) {
        return new Vec2(a.x, a.y)
      }
    }
  } else {
    if (b.x > a.x) {
      return new Vec2(coordinates1?.x, coordinates1?.y)
    }
    if (b.x < a.x) {
      return new Vec2(coordinates2?.x, coordinates2?.y)
    }
    if (b.x === a.x) {
      if (b.y > a.y) {
        return new Vec2(coordinates1?.x, coordinates1?.y)
      }
      if (b.y < a.y) {
        return new Vec2(coordinates2?.x, coordinates2?.y)
      }
      if (b.y === a.y) {
        return new Vec2(a.x, a.y)
      }
    }
  }
  return new Vec2(a.x, a.y)
}

export default ReRxnArrow
