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
ReSimpleObject.prototype.calcDistance = function (p) {
  const point = new Vec2(p.x, p.y)
  let dist = 0
  switch (this.item.mode) {
    case 'circle': {
      const dist1 = Vec2.dist(point, this.item.pos[0])
      const dist2 = Vec2.dist(this.item.pos[0], this.item.pos[1])
      dist = Math.max(dist1, dist2) - Math.min(dist1, dist2)
      break
    }
    case 'rectangle': {
      const diffX = Math.min(
        Math.max(this.item.pos[0].x, point.x) -
          Math.min(this.item.pos[0].x, point.x),
        Math.max(this.item.pos[1].x, point.x) -
          Math.min(this.item.pos[1].x, point.x)
      )
      const diffY = Math.min(
        Math.max(this.item.pos[0].y, point.y) -
          Math.min(this.item.pos[0].y, point.y),
        Math.max(this.item.pos[1].y, point.y) -
          Math.min(this.item.pos[1].y, point.y)
      )
      dist = Math.min(diffX, diffY)
      break
    }
    case 'line': {
      if (
        (point.x < Math.min(this.item.pos[0].x, this.item.pos[1].x) ||
          point.x > Math.max(this.item.pos[0].x, this.item.pos[1].x)) &&
        (point.y < Math.min(this.item.pos[0].y, this.item.pos[1].y) ||
          point.y > Math.max(this.item.pos[0].y, this.item.pos[1].y))
      )
        dist = Math.min(
          Vec2.dist(this.item.pos[0], point),
          Vec2.dist(this.item.pos[1], point)
        )
      else {
        const a = Vec2.dist(this.item.pos[0], this.item.pos[1])
        const b = Vec2.dist(this.item.pos[0], point)
        const c = Vec2.dist(this.item.pos[1], point)
        const per = (a + b + c) / 2
        dist = (2 / a) * Math.sqrt(per * (per - a) * (per - b) * (per - c))
      }
      break
    }

    default: {
      throw new Error('Unsupported shape type')
    }
  }

  return dist
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

  return path
}

ReSimpleObject.prototype.drawHighlight = function (render) {
  const paths = this.highlightPath(render).map(path =>
    path.attr(render.options.highlightStyle)
  )
  render.ctab.addReObjectPath('highlighting', this.visel, paths)
  return paths
}

ReSimpleObject.prototype.makeSelectionPlate = function (
  restruct,
  paper,
  styles
) {
  const s = restruct.render.options.scale
  const pos = []
  this.item.pos.forEach((p, index) => {
    pos[index] = scale.obj2scaled(p, restruct.render.options) || new Vec2()
  })

  let path = null
  switch (this.item.mode) {
    case 'circle': {
      path = draw.circle(paper, pos)
      break
    }
    case 'rectangle': {
      path = draw.rectangle(paper, pos)
      break
    }
    case 'line': {
      path = draw.line(paper, pos)
      break
    }
    default: {
      throw new Error('Unsupported shape type')
    }
  }

  return path.attr(styles.highlightStyleSimpleObject)
}

ReSimpleObject.prototype.show = function (restruct, id, options) {
  const render = restruct.render
  const s = render.options.scale
  const pos = []
  this.item.pos.forEach((p, index) => {
    pos[index] = scale.obj2scaled(p, options) || new Vec2()
  })

  let path = null
  switch (this.item.mode) {
    case 'circle': {
      path = draw.circle(render.paper, pos, options)
      break
    }
    case 'rectangle': {
      path = draw.rectangle(render.paper, pos, options)
      break
    }
    case 'line': {
      path = draw.line(render.paper, pos, options)
      break
    }
    default: {
      throw new Error('Unsupported shape type')
    }
  }
  var offset = options.offset
  if (offset != null) path.translateAbs(offset.x, offset.y)
  this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())))
}

export default ReSimpleObject
