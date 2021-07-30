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

import { Box2Abs, Scale, Vec2 } from 'ketcher-core'

import { LayerMap } from './GeneralEnumTypes'
import ReObject from './ReObject'
import ReStruct from './ReStruct'
import Render from '..'
import draw from '../draw'
import util from '../util'

type Arrow = {
  pp: Vec2
  mode: string
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
  highlightPath(render: Render) {
    const p = Scale.obj2scaled(this.item.pp, render.options)
    const s = render.options.scale
    return render.paper.rect(p.x - s, p.y - s / 4, 2 * s, s / 2, s / 8) // eslint-disable-line no-mixed-operators
  }
  drawHighlight(render: Render) {
    const ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath(LayerMap.highlighting, this.visel, ret)
    return ret
  }
  makeSelectionPlate(restruct: ReStruct, _paper, styles) {
    return this.highlightPath(restruct.render).attr(styles.selectionStyle)
  }
  show(restruct: ReStruct, _id, options) {
    const render: Render = restruct.render
    const centre = Scale.obj2scaled(this.item.pp, options)
    const startPoint = new Vec2(centre.x - options.scale, centre.y)
    const endPoint = new Vec2(centre.x + options.scale, centre.y)

    const path = draw.arrow(
      render.paper,
      startPoint,
      endPoint,
      options,
      this.item.mode
    )

    const offset = options.offset
    if (offset != null) path.translateAbs(offset.x, offset.y)
    this.visel.add(
      path,

      Box2Abs.fromRelBox(util.relBox(path.getBBox()))
    )
  }
}
export default ReRxnArrow
