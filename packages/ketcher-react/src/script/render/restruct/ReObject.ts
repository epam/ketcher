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

import { Box2Abs, Scale } from 'ketcher-core'

import ReStruct from './ReStruct'
import Render from '..'
import Visel from './visel'

class ReObject {
  public visel: Visel
  public highlight: boolean = false
  public highlighting: any = null
  public selected: boolean = false
  public selectionPlate: any = null

  constructor(viselType: string) {
    this.visel = new Visel(viselType)
  }

  getVBoxObj(render: Render): Box2Abs | null {
    var vbox = this.visel.boundingBox
    if (vbox === null) return null
    if (render.options.offset)
      vbox = vbox.translate(render.options.offset.negated())
    return vbox.transform(Scale.scaled2obj, render.options)
  }

  setHighlight(highLight: boolean, render: Render): void {
    // TODO render should be field
    if (highLight) {
      let noredraw = 'highlighting' in this && this.highlighting !== null // && !this.highlighting.removed;
      if (noredraw) {
        if (this.highlighting.type === 'set') {
          if (!this.highlighting[0]) return
          noredraw = !this.highlighting[0].removed
        } else {
          noredraw = !this.highlighting.removed
        }
      }
      if (noredraw) {
        this.highlighting.show()
      } else {
        render.paper.setStart()
        this.drawHighlight(render)
        this.highlighting = render.paper.setFinish()
      }
    } else if (this.highlighting) {
      this.highlighting.hide()
    }

    this.highlight = highLight
  }

  // @ts-ignore
  drawHighlight(render: Render): any {
    console.assert(null, 'ReObject.drawHighlight is not overridden') // eslint-disable-line no-console
  }

  // @ts-ignore
  makeSelectionPlate(restruct: ReStruct, paper: any, styles: any): any {
    console.assert(null, 'ReObject.makeSelectionPlate is not overridden') // eslint-disable-line no-console
  }
}

export default ReObject
