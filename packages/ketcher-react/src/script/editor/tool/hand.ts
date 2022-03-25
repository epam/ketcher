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
import {
    Vec2
} from 'ketcher-core'
import Editor from '../Editor'

class HandTool {
    editor: Editor
    begPos: any
    endPos: any
  
    constructor(editor) {
        this.editor = editor;
        this.editor.event.cursor.dispatch({status: 'enable'})
    }
  
    mousedown(event) {
        this.begPos = this.editor.render.page2obj(event)
        // this.editor.render.options.offset = new Vec2(-5, -5)
        // this.editor.render.ctab.translate(new Vec2(-5, -5))
        // this.editor.render.setScrollOffset(-5, -5)
    }

  
    mousemove(event) {
        this.editor.event.cursor.dispatch({status: 'move'})
        if (this.begPos === null) return
        const rnd = this.editor.render
        if (!this.begPos) return
        this.endPos = rnd.page2obj(event)
        const diff = Vec2.diff(this.begPos, this.endPos);
        const d = new Vec2(-diff.x, -diff.y)
        rnd.ctab.translate(d)
        rnd.options.offset = rnd.options.offset.add(d)
        
        if (diff.x >= 0){
            // if (rnd.clientArea.scrollLeft >= rnd.clientArea.scrollWidth - rnd.clientArea.clientWidth){
            //     rnd.setPaperSize(rnd.sz.add(new Vec2(diff.x, 0)))
            // }
            const awidth = rnd.clientArea.clientWidth
            const swidth = rnd.clientArea.scrollWidth
            const dscroll = diff.x * swidth / awidth
            rnd.clientArea.scrollLeft += dscroll
            
        }
        if (diff.x < 0){
            const awidth = rnd.clientArea.clientWidth
            const swidth = rnd.clientArea.scrollWidth
            const dscroll = diff.x * swidth / awidth
            rnd.clientArea.scrollLeft += dscroll            
        }
        if (diff.y >= 0){
            const awidth = rnd.clientArea.clientHeight
            const swidth = rnd.clientArea.scrollHeight
            const dscroll = diff.y * swidth / awidth
            rnd.clientArea.scrollTop += dscroll
        }
        if (diff.x < 0){
            const awidth = rnd.clientArea.clientHeight
            const swidth = rnd.clientArea.scrollHeight
            const dscroll = diff.y * swidth / awidth
            rnd.clientArea.scrollTop -= dscroll
        }
        // if (diff.x >= 0){
        //     rnd.setPaperSize(rnd.sz.add(new Vec2(diff.x, 0)))
        //     const awidth = rnd.clientArea.clientWidth
        //     const swidth = rnd.clientArea.scrollWidth
        //     const dscroll = diff.x * swidth / awidth
        //     rnd.clientArea.scrollLeft += dscroll
        // } 
        // else {
        //     const d = new Vec2(-diff.x, 0).scaled(
        //         1 / rnd.options.zoom
        //     )
        //     rnd.ctab.translate(d)
        //     rnd.setOffset(rnd.options.offset.add(d))
        //     const awidth = rnd.clientArea.clientWidth
        //     const swidth = rnd.clientArea.scrollWidth
        //     const dscroll = diff.x * swidth / awidth
        //     rnd.clientArea.scrollLeft += dscroll
        // }
        // if (diff.y >= 0){
        //     rnd.setPaperSize(rnd.sz.add(new Vec2(0, diff.y)))
        //     const awidth = rnd.clientArea.clientHeight
        //     const swidth = rnd.clientArea.scrollHeight
        //     const dscroll = diff.y * swidth / awidth
        //     rnd.clientArea.scrollTop += dscroll
        // } 
        // else {
        //     const d = new Vec2(0, -diff.y).scaled(
        //         1 / rnd.options.zoom
        //     )
        //     rnd.ctab.translate(d)
        //     rnd.setOffset(rnd.options.offset.add(d))
        //     const awidth = rnd.clientArea.clientHeight
        //     const swidth = rnd.clientArea.scrollHeight
        //     const dscroll = diff.y * swidth / awidth
        //     rnd.clientArea.scrollTop += dscroll
        // }
    }
  
    mouseup(event) {
        if (this.begPos ===  null) return
        const rnd = this.editor.render
        this.endPos = rnd.page2obj(event)
        const diff = Vec2.diff(this.begPos, this.endPos);
        this.begPos = null
        this.endPos = null
        if (diff.x < 0 && rnd.clientArea.scrollLeft === 0)
            rnd.update(false)
    }
  
    mouseover() {
        this.editor.event.cursor.dispatch({status: 'mouseover'})
    }
  
    mouseleave() {
        this.begPos = null
        this.endPos = null
        this.editor.event.cursor.dispatch({status: 'leave'})
    }
  
    cancel() {
        this.editor.event.cursor.dispatch({status: 'disable'})
    }
  }
  
  export default HandTool
  