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
import ReObject from './ReObject'
import { Fragment, Box2Abs, Vec2, scale } from 'ketcher-core'

class ReEnhancedFlag extends ReObject {
  constructor(flag, pos) {
    super('enhancedFlag')
    this.flag = flag
    this.pp = pos
  }
  static isSelectable() {
    return true
  }
  highlightPath(render) {
    var box = Box2Abs.fromRelBox(this.path.getBBox())
    var sz = box.p1.sub(box.p0)
    var p0 = box.p0.sub(render.options.offset)
    return render.paper.rect(p0.x, p0.y, sz.x, sz.y)
  }
  drawHighlight(render) {
    if (!this.path) return null
    var ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath('highlighting', this.visel, ret)
    return ret
  }
  makeSelectionPlate(restruct, paper, options) {
    if (!this.path) return null
    return this.highlightPath(restruct.render).attr(options.selectionStyle)
  }
  show(restruct, id, options) {
    const render = restruct.render
    if (!this.flag) return

    if (!this.pp) {
      const bb = restruct.molecule.getFragment(id).getCoordBoundingBox()
      this.pp = new Vec2(bb.max.x, bb.min.y - 1)
    }

    const paper = render.paper
    const ps = scale.obj2scaled(this.pp, options)
    this.path = paper
      .text(ps.x, ps.y, Fragment.STEREO_FLAG[this.flag] || '')
      .attr({
        font: options.font,
        'font-size': options.fontsz,
        fill: '#000'
      })
    render.ctab.addReObjectPath('data', this.visel, this.path, null, true)
  }
}

export default ReEnhancedFlag
