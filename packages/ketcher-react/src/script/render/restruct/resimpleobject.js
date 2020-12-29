/****************************************************************************
 * Copyright 2020 EPAM Systems
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

import ReObject from './reobject'
import Box2Abs from '../../util/box2abs'
import draw from '../draw'
import util from '../util'
import scale from '../../util/scale'
import Vec2 from 'src/script/util/vec2'

const tfx = util.tfx

function ReSimpleObject(simpleObject) {
  this.init('simpleObject')

  this.item = simpleObject
}
ReSimpleObject.prototype = new ReObject()
ReSimpleObject.isSelectable = function () {
  return true
}
ReSimpleObject.prototype.calcDistance = function (p, s) {
  const point = new Vec2(p.x, p.y)
  let dist = null
  let distRef = null
  const item = this.item
  const mode = item.mode
  const pos = item.pos

  switch (mode) {
    case 'circle': {
      const dist1 = Vec2.dist(point, pos[0])
      const dist2 = Vec2.dist(pos[0], pos[1])
      dist = Math.max(dist1, dist2) - Math.min(dist1, dist2)
      break
    }
    case 'rectangle': {
      const topX = Math.min(pos[0].x, pos[1].x)
      const topY = Math.min(pos[0].y, pos[1].y)
      const bottomX = Math.max(pos[0].x, pos[1].x)
      const bottomY = Math.max(pos[0].y, pos[1].y)

      const distances = []

      if (point.x >= topX && point.x <= bottomX) {
        if (point.y < topY) {
          distances.push(topY - point.y)
        } else if (point.y > bottomY) {
          distances.push(point.y - bottomY)
        } else {
          distances.push(point.y - topY, bottomY - point.y)
        }
      }
      if (point.x < topX && point.y < topY) {
        distances.push(Vec2.dist(new Vec2(topX, topY), point))
      }
      if (point.x > bottomX && point.y > bottomY) {
        distances.push(Vec2.dist(new Vec2(bottomX, bottomY), point))
      }
      if (point.x < topX && point.y > bottomY) {
        distances.push(Vec2.dist(new Vec2(topX, bottomY), point))
      }
      if (point.x > bottomX && point.y < topY) {
        distances.push(Vec2.dist(new Vec2(bottomX, topY), point))
      }
      if (point.y >= topY && point.y <= bottomY) {
        if (point.x < topX) {
          distances.push(topX - point.x)
        } else if (point.x > bottomX) {
          distances.push(point.x - bottomX)
        } else {
          distances.push(point.x - topX, bottomX - point.x)
        }
      }
      dist = Math.min(...distances)
      break
    }
    case 'line': {
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
      break
    }

    default: {
      throw new Error('Unsupported shape type')
    }
  }

  distRef = this.getReferencePointDistance(p)
  const refPoint = distRef.minDist <= 8 / s ? distRef.refPoint : null

  return { minDist: dist, refPoint: refPoint }
}

ReSimpleObject.prototype.getReferencePointDistance = function (p) {
  let dist = []
  const refPoints = this.getReferencePoints()
  refPoints.forEach(rp => {
    dist.push({ minDist: Math.abs(Vec2.dist(p, rp)), refPoint: rp })
  })

  const minDist = dist.reduce(
    (acc, current) =>
      !acc ? current : acc.minDist < current.minDist ? acc : current,
    null
  )

  return minDist
}

ReSimpleObject.prototype.getReferencePoints = function () {
  const refPoints = []
  switch (this.item.mode) {
    case 'circle': {
      const p0 = this.item.pos[0]
      const rad = Vec2.dist(this.item.pos[0], this.item.pos[1])
      refPoints.push(
        new Vec2(p0.x - rad, p0.y),
        new Vec2(p0.x, p0.y - rad),
        new Vec2(p0.x + rad, p0.y),
        new Vec2(p0.x, p0.y + rad)
      )

      break
    }
    case 'rectangle': {
      const p0 = new Vec2(
        tfx(Math.min(this.item.pos[0].x, this.item.pos[1].x)),
        tfx(Math.min(this.item.pos[0].y, this.item.pos[1].y))
      )
      const w = Math.abs(Vec2.diff(this.item.pos[0], this.item.pos[1]).x)
      const h = Math.abs(Vec2.diff(this.item.pos[0], this.item.pos[1]).y)

      refPoints.push(
        p0,
        new Vec2(p0.x + 0.5 * w, p0.y),
        new Vec2(p0.x + w, p0.y),
        new Vec2(p0.x + w, p0.y + 0.5 * h),
        new Vec2(p0.x + w, p0.y + h),
        new Vec2(p0.x + 0.5 * w, p0.y + h),
        new Vec2(p0.x, p0.y + h),
        new Vec2(p0.x, p0.y + 0.5 * h)
      )
      break
    }
    case 'line': {
      this.item.pos.forEach(i => refPoints.push(i))
      break
    }

    default: {
      throw new Error('Unsupported shape type')
    }
  }
  return refPoints
}

ReSimpleObject.prototype.highlightPath = function (render) {
  const point = []

  this.item.pos.forEach((p, index) => {
    point[index] = scale.obj2scaled(p, render.options)
  })
  const s = render.options.scale

  const path = []

  //TODO: It seems that inheritance will be the better approach here
  switch (this.item.mode) {
    case 'circle': {
      const rad = Vec2.dist(point[0], point[1])
      path.push(
        render.paper.circle(point[0].x, point[0].y, rad + s / 8),
        render.paper.circle(point[0].x, point[0].y, rad - s / 8)
      )
      break
    }

    case 'rectangle': {
      path.push(
        render.paper.rect(
          tfx(Math.min(point[0].x, point[1].x) - s / 8),
          tfx(Math.min(point[0].y, point[1].y) - s / 8),
          tfx(
            Math.max(point[0].x, point[1].x) -
              Math.min(point[0].x, point[1].x) +
              s / 4
          ),
          tfx(
            Math.max(point[0].y, point[1].y) -
              Math.min(point[0].y, point[1].y) +
              s / 4
          )
        )
      )

      path.push(
        render.paper.rect(
          tfx(Math.min(point[0].x, point[1].x) + s / 8),
          tfx(Math.min(point[0].y, point[1].y) + s / 8),
          tfx(
            Math.max(point[0].x, point[1].x) -
              Math.min(point[0].x, point[1].x) -
              s / 4
          ),
          tfx(
            Math.max(point[0].y, point[1].y) -
              Math.min(point[0].y, point[1].y) -
              s / 4
          )
        )
      )

      break
    }
    case 'line': {
      //TODO: reuse this code for polyline
      const poly = []

      let angle = Math.atan(
        (point[1].y - point[0].y) / (point[1].x - point[0].x)
      )

      const p0 = { x: 0, y: 0 }
      const p1 = { x: 0, y: 0 }

      const k = point[0].x > point[1].x ? -1 : 1

      p0.x = point[0].x - k * ((s / 8) * Math.cos(angle))
      p0.y = point[0].y - k * ((s / 8) * Math.sin(angle))
      p1.x = point[1].x + k * ((s / 8) * Math.cos(angle))
      p1.y = point[1].y + k * ((s / 8) * Math.sin(angle))

      poly.push(
        'M',
        p0.x + ((k * s) / 8) * Math.sin(angle),
        p0.y - ((k * s) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p1.x + ((k * s) / 8) * Math.sin(angle),
        p1.y - ((k * s) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p1.x - ((k * s) / 8) * Math.sin(angle),
        p1.y + ((k * s) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p0.x - ((k * s) / 8) * Math.sin(angle),
        p0.y + ((k * s) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p0.x + ((k * s) / 8) * Math.sin(angle),
        p0.y - ((k * s) / 8) * Math.cos(angle)
      )

      path.push(render.paper.path(poly))
      break
    }
    default: {
      throw new Error('Unsupported shape type')
    }
  }

  const enhPaths = path.map(p => {
    return { path: p, stylesApplied: false }
  })

  const refPoints = this.getReferencePoints()

  refPoints.forEach(rp => {
    const scaledRP = scale.obj2scaled(rp, render.options)
    enhPaths.push({
      path: render.paper
        .circle(scaledRP.x, scaledRP.y, s / 8)
        .attr({ fill: 'black' }),
      stylesApplied: true
    })
  })

  return enhPaths
}

ReSimpleObject.prototype.drawHighlight = function (render) {
  const paths = this.highlightPath(render).map(enhPath => {
    if (!enhPath.stylesApplied) {
      return enhPath.path.attr(render.options.highlightStyle)
    }
    return enhPath.path
  })

  render.ctab.addReObjectPath('highlighting', this.visel, paths)
  return paths
}

ReSimpleObject.prototype.makeSelectionPlate = function (
  restruct,
  paper,
  styles
) {
  const pos = this.item.pos.map(p => {
    return scale.obj2scaled(p, restruct.render.options) || new Vec2()
  })

  const path = generatePath(this.item.mode, paper, pos)

  return path.attr(styles.highlightStyleSimpleObject)
}

ReSimpleObject.prototype.show = function (restruct, id, options) {
  const render = restruct.render
  const pos = this.item.pos.map((p, index) => {
    return scale.obj2scaled(p, options) || new Vec2()
  })

  const path = generatePath(this.item.mode, render.paper, pos, options)

  var offset = options.offset
  if (offset != null) path.translateAbs(offset.x, offset.y)
  this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())))
}

function generatePath(mode, paper, pos, options) {
  let path = null
  switch (mode) {
    case 'circle': {
      path = draw.circle(paper, pos, options)
      break
    }
    case 'rectangle': {
      path = draw.rectangle(paper, pos, options)
      break
    }
    case 'line': {
      path = draw.line(paper, pos, options)
      break
    }
    default: {
      throw new Error('Unsupported shape type')
    }
  }

  return path
}

export default ReSimpleObject
