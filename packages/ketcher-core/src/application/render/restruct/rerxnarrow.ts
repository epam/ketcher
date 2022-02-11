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

import { Box2Abs, Vec2 } from 'domain/entities'

import { LayerMap } from './generalEnumTypes'
import Raphael from '../raphael-ext'
import ReObject from './reobject'
import ReStruct from './restruct'
import { Render } from '../raphaelRender'
import { Scale } from 'domain/helpers'
import draw from '../draw'
import util from '../util'

type Arrow = {
  pos: Array<Vec2>
  mode: string
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

  constructor(/* chem.RxnArrow*/ arrow: Arrow) {
    super('rxnArrow')
    this.item = arrow
  }
  static isSelectable(): boolean {
    return true
  }

  calcDistance(p: Vec2, s: any): MinDistanceWithReferencePoint {
    const point: Vec2 = new Vec2(p.x, p.y)
    let dist: number
    let distRef: MinDistanceWithReferencePoint
    const item = this.item

    const pos = item.pos

    dist = calculateDistanceToLine(pos, point)

    distRef = this.getReferencePointDistance(p)
    const refPoint: Vec2 | null =
      distRef.minDist <= 8 / s ? distRef.refPoint : null
    // distance is a smallest between dist to figure and it's reference points
    dist = Math.min(distRef.minDist, dist)
    return { minDist: dist, refPoint }
  }

  getReferencePointDistance(p: Vec2): MinDistanceWithReferencePoint {
    let dist: any = []
    const refPoints = this.getReferencePoints()
    refPoints.forEach(rp => {
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

    this.item.pos.forEach(i => refPoints.push(new Vec2(i.x, i.y, 0)))

    return refPoints
  }

  makeSelectionPlate(restruct: ReStruct, _paper, styles) {
    const render = restruct.render
    const options = restruct.render.options

    const refPoints = this.getReferencePoints()
    const scaleFactor = options.scale
    const selectionSet = restruct.render.paper.set()
    selectionSet.push(
      render.paper
        .path(this.generatePath(render, options, 'selection'))
        .attr(styles.selectionStyle)
    )

    refPoints.forEach(rp => {
      const scaledRP = Scale.obj2scaled(rp, restruct.render.options)
      selectionSet.push(
        restruct.render.paper
          .circle(scaledRP.x, scaledRP.y, scaleFactor / 8)
          .attr({ fill: 'black' })
      )
    })
    return selectionSet
  }

  generatePath(render: Render, options, type) {
    let path

    const pos = this.item.pos.map(p => {
      return Scale.obj2scaled(p, options) || new Vec2()
    })

    const arrowParams: ArrowParams = this.getArrowParams(
      pos[0].x,
      pos[0].y,
      pos[1].x,
      pos[1].y
    )

    const startPoint = new Vec2(pos[0].x, pos[0].y)
    const endPoint = new Vec2(pos[1].x, pos[1].y)

    switch (type) {
      case 'selection':
        path = draw.rectangleWithAngle(
          render.paper,
          startPoint,
          endPoint,
          arrowParams.length,
          arrowParams.angle,
          options
        )
        break
      case 'arrow':
        path = draw.arrow(
          render.paper,
          startPoint,
          endPoint,
          arrowParams.length,
          arrowParams.angle,
          options,
          this.item.mode
        )
        break
    }

    return path
  }

  getArrowParams(x1, y1, x2, y2): ArrowParams {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
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
  )
    dist = Math.min(Vec2.dist(pos[0], point), Vec2.dist(pos[1], point))
  else {
    const a = Vec2.dist(pos[0], pos[1])
    const b = Vec2.dist(pos[0], point)
    const c = Vec2.dist(pos[1], point)
    const per = (a + b + c) / 2
    dist = (2 / a) * Math.sqrt(per * (per - a) * (per - b) * (per - c))
  }
  return dist
}

export default ReRxnArrow
