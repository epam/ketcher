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

function ReSimpleObject(simpleObject) {
  this.init('simpleObject')

  this.item = simpleObject
}
ReSimpleObject.prototype = new ReObject()
ReSimpleObject.isSelectable = function () {
  return true
}

ReSimpleObject.prototype.highlightPath = function (render) {
  var p = scale.obj2scaled(this.item.center(), render.options)
  var s = render.options.scale
  return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8)
}

ReSimpleObject.prototype.drawHighlight = function (render) {
  var ret = this.highlightPath(render).attr(render.options.highlightStyle)
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
  const p0 = scale.obj2scaled(this.item.p0, options)
  const p1 = scale.obj2scaled(this.item.p1, options)
  let path = null
  switch (this.item.mode) {
    case 'circle': {
      path = draw.circle(render.paper, p0, p1, options)
      break
    }
    default: {
      path = draw.rectangle(render.paper, p0, p1, options)
      break
    }
  }
  var offset = options.offset
  if (offset != null) path.translateAbs(offset.x, offset.y)
  this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())))
}

export default ReSimpleObject
