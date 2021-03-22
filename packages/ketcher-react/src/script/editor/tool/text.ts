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

import { fromTextCreation, fromTextUpdating } from '../actions/text'
import { fromMultipleMove } from '../actions/fragment'
import Action from '../shared/action'

class TextTool {
  editor: any
  dragCtx: any

  constructor(editor) {
    this.editor = editor
    this.editor.selection(null)
  }

  mousedown(event) {
    const render = this.editor.render
    const ci = this.editor.findItem(event, ['texts'])

    if (ci && ci.map === 'texts') {
      this.editor.hover(null)
      this.editor.selection({ texts: [ci.id] })
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
    const ci = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    if (!ci) {
      propsDialog(this.editor, null, render.page2obj(event))
    }

    return true
  }

  dblclick(event) {
    const ci = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    if (ci.map === 'texts') {
      propsDialog(this.editor, ci.id, ci.position)
    }

    return true
  }
}

function propsDialog(editor, id, position) {
  const struct = editor.render.ctab.molecule
  const text = id || id === 0 ? struct.texts.get(id) : null
  const label = text ? text.label : ''

  const res = editor.event.elementEdit.dispatch({
    type: 'text',
    label,
    id,
    position
  })

  Promise.resolve(res)
    .then(elem => {
      elem = Object.assign({ previousLabel: label }, elem)

      if (!id && id !== 0 && elem.label) {
        editor.update(fromTextCreation(editor.render.ctab, elem))
      } else if (label !== elem.label) {
        editor.update(fromTextUpdating(editor.render.ctab, id, elem))
      }
    })
    .catch(() => null)
}

export default function TextToolWrapper(editor) {
  return new TextTool(editor)
}
