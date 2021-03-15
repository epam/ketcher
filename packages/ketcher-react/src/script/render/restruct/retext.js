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

import ReObject from './reobject'
import { Box2Abs, Vec2, scale } from 'ketcher-core'

class ReText extends ReObject {
  constructor(text) {
    super()
    this.visel = undefined
    this.init('text')
    this.item = text
    this.color = '#000000'
    this.component = -1
  }
  static isSelectable() {
    return true
  }

  highlightPath(render) {
    const box = Box2Abs.fromRelBox(this.path.getBBox())
    const sz = box.p1.sub(box.p0)
    const p0 = box.p0.sub(render.options.offset)
    return render.paper.rect(p0.x, p0.y, sz.x, sz.y, 5)
  }

  drawHighlight(render) {
    if (!this.path) return null
    const ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath('highlighting', this.visel, ret)
    return ret
  }

  makeSelectionPlate(restruct, paper, options) {
    if (!this.path) return null
    return this.highlightPath(restruct.render).attr(options.selectionStyle)
  }

  show(restruct, id, options) {
    const render = restruct.render
    const paper = render.paper

    if (!this.item.label) {
      return
    }

    if (!this.item.position) {
      const boundingBox = restruct.molecule.getText(id).getCoordBoundingBox()
      this.item.position = new Vec2(boundingBox.max.x, boundingBox.min.y - 1)
    }

    const paperScale = scale.obj2scaled(this.item.position, options)
    this.item.label = this.item.label.replace(/\s/g, '\u00a0')

    this.path = paper.text(paperScale.x, paperScale.y, this.item.label).attr({
      font: options.font,
      'font-size': options.fontsz,
      'text-anchor': 'start',
      fill: this.color
    })
    render.ctab.addReObjectPath('data', this.visel, this.path, null, true)
  }
}

export default ReText
