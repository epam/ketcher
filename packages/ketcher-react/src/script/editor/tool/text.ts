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
  Action,
  Text,
  Vec2,
  fromMultipleMove,
  fromTextCreation,
  fromTextDeletion,
  fromTextUpdating
} from 'ketcher-core'

interface Result {
  content: string
}

class TextTool {
  editor: any
  dragCtx: any

  constructor(editor) {
    this.editor = editor
    this.editor.selection(null)
  }

  mousedown(event) {
    const render = this.editor.render
    const closestItem = this.editor.findItem(event, ['texts'])

    this.editor.selection(null)

    if (closestItem && closestItem.map === 'texts') {
      this.editor.hover(null)
      this.editor.selection({ texts: [closestItem.id] })
      this.dragCtx = {
        xy0: render.page2obj(event),
        action: new Action()
      }
    }
  }

  mousemove(event) {
    const render = this.editor.render

    if (this.dragCtx) {
      if (this.dragCtx.action) {
        this.dragCtx.action.perform(render.ctab)
      }

      this.dragCtx.action = fromMultipleMove(
        render.ctab,
        this.editor.selection() || {},
        render.page2obj(event).sub(this.dragCtx.xy0)
      )
      this.editor.update(this.dragCtx.action, true)
    } else {
      this.editor.hover(this.editor.findItem(event, ['texts']))
    }
  }

  mouseup() {
    if (this.dragCtx) {
      this.editor.update(this.dragCtx.action)
      delete this.dragCtx
    }
    return true
  }

  click(event) {
    const render = this.editor.render
    const closestItem = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    if (!closestItem) {
      propsDialog(this.editor, null, render.page2obj(event), closestItem.pos)
    }

    return true
  }

  dblclick(event) {
    const closestItem = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    if (closestItem.map === 'texts') {
      propsDialog(
        this.editor,
        closestItem.id,
        closestItem.position,
        closestItem.pos
      )
    }

    return true
  }
}

function propsDialog(
  editor: any,
  id: number | null,
  pos: Array<Vec2> | [],
  position: Vec2
) {
  const struct = editor.render.ctab.molecule
  const text: Text | null = id || id === 0 ? struct.texts.get(id) : null
  const origilContent = text ? text.content : ''

  const res = editor.event.elementEdit.dispatch({
    content: origilContent,
    id,
    position,
    pos,
    type: 'text'
  })

  res
    .then(({ content }: Result) => {
      if (!id && id !== 0 && content) {
        editor.update(
          fromTextCreation(editor.render.ctab, content, position, pos)
        )
      } else if (!content) {
        editor.update(fromTextDeletion(editor.render.ctab, id!))
      } else if (content !== origilContent) {
        editor.update(fromTextUpdating(editor.render.ctab, id!, content))
      }
    })
    .catch(() => null)
}

export default TextTool
