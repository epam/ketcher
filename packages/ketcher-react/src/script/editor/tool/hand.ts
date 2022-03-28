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
import { Vec2 } from 'ketcher-core'
import Editor from '../Editor'
import {Box2Abs} from 'ketcher-core'
import {Scale} from 'ketcher-core'

class HandTool {
  editor: Editor
  begPos: any
  endPos: any

  constructor(editor) {
    this.editor = editor
    this.editor.event.cursor.dispatch({ status: 'enable' })
  }

  mousedown(event) {
    this.begPos = this.editor.render.page2obj(event)
    // this.editor.render.options.offset = new Vec2(-5, -5)
    // this.editor.render.ctab.translate(new Vec2(-5, -5))
    // this.editor.render.setScrollOffset(-5, -5)
  }

  mousemove(event) {
    this.editor.event.cursor.dispatch({ status: 'move' })
    if (this.begPos === null) return
    const rnd = this.editor.render
    if (!this.begPos) return
    this.endPos = rnd.page2obj(event)
    const diff = Vec2.diff(this.begPos, this.endPos)
    const d = new Vec2(-diff.x, -diff.y)
    if (diff.x <= 0 && diff.y <= 0){
        rnd.ctab.translate(d)
        rnd.options.offset = rnd.options.offset.add(d)
        const viewSz = new Vec2(
            rnd.clientArea.clientWidth || 100,
            rnd.clientArea.clientHeight || 100
        )
        const sf = rnd.options.scale
        const bb = rnd!.ctab!.getVBoxObj({})!.transform(Scale.obj2scaled, rnd.options).translate(rnd.options.offset || new Vec2())
        if (!rnd.options.autoScale) {
            const ext = Vec2.UNIT.scaled(sf)
            const eb = bb.sz().length() > 0 ? bb.extend(ext, ext) : bb
            const vb = new Box2Abs(
                rnd.scrollPos(),
                viewSz.scaled(1 / rnd.options.zoom).sub(Vec2.UNIT.scaled(20))
            )
            const cb = Box2Abs.union(vb, eb)
            if (!rnd.oldCb) rnd.oldCb = new Box2Abs()

            const sz = cb.sz().floor()
            rnd.oldBb = bb
            if (!rnd.sz || sz.x !== rnd.sz.x || sz.y !== rnd.sz.y) {
                rnd.setPaperSize(sz)
                const awidth = rnd.sz.x
                const swidth = rnd.clientArea.scrollWidth
                const dscroll = diff.x * swidth / awidth
                rnd.clientArea.scrollLeft += dscroll
            }
            if (cb.p0.x !== 0 && cb.p0.y!== 0){
                rnd.ctab.translate(d)
                rnd.options.offset = rnd.options.offset.add(d)
            }
            rnd.options.offset = rnd.options.offset || new Vec2()
    
        }
    }
  }

  mouseup(event) {
    if (this.begPos === null) return
    const rnd = this.editor.render
    this.endPos = rnd.page2obj(event)
    const diff = Vec2.diff(this.begPos, this.endPos)
    // const d = new Vec2(-diff.x, -diff.y)
    console.log(diff)
    this.begPos = null
    this.endPos = null
    rnd.update(false)
  }

  mouseover() {
    this.editor.event.cursor.dispatch({ status: 'mouseover' })
  }

  mouseleave() {
    this.begPos = null
    this.endPos = null
    this.editor.event.cursor.dispatch({ status: 'leave' })
  }

  cancel() {
    this.editor.event.cursor.dispatch({ status: 'disable' })
  }
}

export default HandTool
