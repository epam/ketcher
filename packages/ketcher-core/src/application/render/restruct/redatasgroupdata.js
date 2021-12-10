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

import { LayerMap } from './generalEnumTypes'
import ReObject from './reobject'
import { Scale } from 'domain/helpers'

class ReDataSGroupData extends ReObject {
  constructor(sgroup) {
    super('sgroupData')
    this.sgroup = sgroup
  }

  static isSelectable() {
    return true
  }

  highlightPath(render) {
    const box = this.sgroup.dataArea
    const p0 = Scale.obj2scaled(box.p0, render.options)
    const sz = Scale.obj2scaled(box.p1, render.options).sub(p0)
    return render.paper.rect(p0.x, p0.y, sz.x, sz.y)
  }

  drawHighlight(render) {
    const ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath(LayerMap.highlighting, this.visel, ret)
    return ret
  }

  makeSelectionPlate(restruct, paper, styles) {
    // TODO [MK] review parameters
    return this.highlightPath(restruct.render).attr(styles.selectionStyle)
  }
}

export default ReDataSGroupData
