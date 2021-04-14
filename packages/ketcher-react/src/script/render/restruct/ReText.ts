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
import { Box2Abs, scale, Vec2 } from 'ketcher-core'
import { LayerMap } from './GeneralEnumTypes'

class ReText extends ReObject {
  private item: any
  path: any

  constructor(text: any) {
    super('text')
    this.item = text
  }
  static isSelectable() {
    return true
  }

  getReferencePoints(): Array<Vec2> {
    const { p0, p1 } = Box2Abs.fromRelBox(this.path.getBBox())

    const p = this.item.position
    const w = Math.abs(Vec2.diff(p0, p1).x) / 40
    const h = Math.abs(Vec2.diff(p0, p1).y) / 40

    const refPoints: Array<Vec2> = []

    refPoints.push(
      this.item.position,
      new Vec2(p.x, p.y + h),
      new Vec2(p.x + w, p.y + h),
      new Vec2(p.x + w, p.y)
    )

    return refPoints
  }

  highlightPath(render: any): any {
    const { p0, p1 } = Box2Abs.fromRelBox(this.path.getBBox())
    const topLeft = p0.sub(render.options.offset)
    const bottomRight = p1.sub(p0)

    return render.paper.rect(
      topLeft.x,
      topLeft.y,
      bottomRight.x,
      bottomRight.y,
      5
    )
  }

  drawHighlight(render: any): any {
    if (!this.path) return null
    const ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath(LayerMap.highlighting, this.visel, ret)
    return ret
  }

  makeSelectionPlate(restruct: any, paper: any, options: any): any {
    if (!this.path || !paper) return null
    return this.highlightPath(restruct.render).attr(options.selectionStyle)
  }

  show(restruct: any, _id: any, options: any): void {
    const render = restruct.render
    const paper = render.paper

    const paperScale = scale.obj2scaled(this.item.position, options)
    this.item.label = this.item.label.replace(/[^\S\r\n]/g, '\u00a0')

    this.path = paper.text(paperScale.x, paperScale.y, this.item.label).attr({
      font: options.font,
      'font-size': options.fontsz,
      'text-anchor': 'start',
      fill: '#000000'
    })
    render.ctab.addReObjectPath(
      LayerMap.data,
      this.visel,
      this.path,
      null,
      true
    )
  }
}

export default ReText
