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

import { Text } from 'ketcher-core'
import { fromTextCreation, fromTextUpdating } from '../actions/text'
import { fromMultipleMove } from '../actions/fragment'
import Action from '../shared/action'

function TextTool(editor) {
  if (!(this instanceof TextTool)) {
    return new TextTool(editor)
  }

  this.editor = editor
  this.editor.selection(null)

  TextTool.prototype.mousedown = function (event) {
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

  TextTool.prototype.mousemove = function (event) {
    const render = this.editor.render

    if ('dragCtx' in this) {
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

  TextTool.prototype.mouseup = function (event) {
    if (this.dragCtx) {
      this.editor.update(this.dragCtx.action)
      delete this.dragCtx
    }
    return true
  }

  TextTool.prototype.click = function (event) {
    const render = this.editor.render
    const ci = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    if (!ci) {
      propsDialog(this.editor, null, render.page2obj(event))
    }

    return true
  }

  TextTool.prototype.dblclick = function (event) {
    const ci = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    if (ci.map === 'texts') {
      propsDialog(this.editor, ci.id)
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
      elem = Object.assign({}, Text.attrlist, elem)

      if (!id && id !== 0 && elem.label) {
        editor.update(fromTextCreation(editor.render.ctab, elem))
      } else if (label !== elem.label) {
        editor.update(fromTextUpdating(editor.render.ctab, id, elem))
      }
    })
    .catch(() => null)
}

export default TextTool
