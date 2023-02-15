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

import Editor from '../Editor'
import { Vec2 } from 'ketcher-core'

class HandTool {
  editor: Editor
  begPos: Vec2 | null = null
  endPos: Vec2 | null = null

  constructor(editor) {
    this.editor = editor
    const { clientX, clientY } = this.editor.lastEvent || {
      clientX: 0,
      clientY: 0
    }
    this.editor.event.cursor.dispatch({
      status: 'enable',
      cursorPosition: { clientX, clientY }
    })
  }

  mousedown(event) {
    const { clientX, clientY } = event
    this.begPos = new Vec2(clientX, clientY)
  }

  mousemove(event) {
    this.editor.event.cursor.dispatch({ status: 'move' })
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds'], null),
      null,
      event
    )

    if (this.begPos == null) {
      return
    }
    const { clientX, clientY } = event
    this.endPos = new Vec2(clientX, clientY)

    const rnd = this.editor.render
    const diff = Vec2.diff(this.endPos, this.begPos).scaled(
      1 / this.editor.zoom()
    )
    this.begPos = this.endPos

    rnd.ctab.translate(diff)
    rnd.options.offset = rnd.options.offset.add(diff)
    rnd.update(false)
  }

  mouseup(event) {
    if (this.begPos === null) return
    const rnd = this.editor.render
    this.endPos = rnd.page2obj(event)
    this.begPos = null
    this.endPos = null
    rnd.update(false)
  }

  mouseover() {
    this.editor.event.cursor.dispatch({ status: 'mouseover' })
  }

  mouseLeaveClientArea() {
    this.begPos = null
    this.endPos = null
    this.editor.event.cursor.dispatch({ status: 'leave' })
  }

  cancel() {
    this.editor.event.cursor.dispatch({ status: 'disable' })
  }
}

export default HandTool
