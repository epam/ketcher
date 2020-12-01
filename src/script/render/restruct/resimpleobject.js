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

ReSimpleObject.prototype.highlightPath = function (render) {
  // var p = scale.obj2scaled(this.item.center(), render.options)
  // var s = render.options.scale
  // return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8)

  const point = []
  this.item.pos.forEach((p, index) => {
    point[index] = scale.obj2scaled(p, render.options)
  })
  const s = render.options.scale

  const lineWidth = tfx(s / 2)
  let path = ['M', point[0].x, point[0].y]

  switch (this.item.mode) {
    case 'circle': {
      let rad = Math.sqrt(
        Math.pow(point[0].x - point[1].x, 2),
        Math.pow(point[0].y - point[1].y, 2)
      )
      return render.paper
        .circle(point[0].x, point[0].y, rad)
        .attr({
          stroke: 'blue',
          'stroke-dasharray': '- ',
          'stroke-width': lineWidth
        })
    }
    case 'rectangle': {
      render.paper
        .rect(
          tfx(Math.min(point[0].x, point[1].x)),
          tfx(Math.min(point[0].y, point[1].y)),
          tfx(Math.abs(point[1].x - point[0].x)),
          tfx(Math.abs(point[1].y - point[0].y))
        )
        .attr({
          stroke: 'blue',
          'stroke-dasharray': '- ',
          'stroke-width': lineWidth
        })
    }

    default: {
      for (let i = 1; i < point.length; i++)
        path.push('L', point[i].x, point[i].y)
      return render.paper
        .path(path)
        .attr({
          stroke: 'blue',
          'stroke-dasharray': '- ',
          'stroke-width': lineWidth
        })
    }
  }
}

ReSimpleObject.prototype.drawHighlight = function (render) {
  //var ret = this.highlightPath(render).attr(render.options.highlightStyle)
  var ret = this.highlightPath(render)
  render.ctab.addReObjectPath('highlighting', this.visel, ret)
  return ret
}

ReSimpleObject.prototype.makeSelectionPlate = function (
  restruct,
  paper,
  styles
) {
  // TODO [MK] review parameters
  return this.highlightPath(restruct.render).attr(styles.selectionStyle)
}

ReSimpleObject.prototype.show = function (restruct, id, options) {
  const render = restruct.render

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
    case 'polyline': {
      path = draw.polyline(render.paper, pos, options)
      break
    }
    case 'line': {
      path = draw.line(render.paper, pos, options)
      break
    }
    default: {
      path = draw.rectangle(render.paper, pos, options)
      break
    }
  }
  var offset = options.offset
  if (offset != null) path.translateAbs(offset.x, offset.y)
  this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())))
}

export default ReSimpleObject
