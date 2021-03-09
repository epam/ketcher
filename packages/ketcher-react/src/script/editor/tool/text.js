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
import { fromTextAddition, fromTextDeletion } from '../actions/text'
import { fromMultipleMove } from '../actions/fragment'

function TextTool(editor) {
  if (!(this instanceof TextTool)) {
    return new TextTool(editor)
  }

  this.editor = editor
  this.editor.selection(null)

  TextTool.prototype.mousedown = function (event) {
    const render = this.editor.render
    const initialPosition = render.page2obj(event)
    const currentItem = this.editor.findItem(event, ['texts'])

    this.dragCtx = { initialPosition }

    if (currentItem && currentItem.map === 'texts') {
      this.editor.hover(null)
      this.editor.selection({ texts: [currentItem.id] })
      this.dragCtx.currentItem = currentItem
    } else {
      this.dragCtx.isNew = true
      this.editor.selection(null)
    }
  }

  TextTool.prototype.mousemove = function (event) {
    const render = this.editor.render

    if (this.dragCtx) {
      const currentPosition = render.page2obj(event)
      const positionDifference = currentPosition.sub(
        this.dragCtx.initialPosition
      )

      this.dragCtx.previousPosition = currentPosition

      if (this.dragCtx.currentItem) {
        if (this.dragCtx.action) {
          this.dragCtx.action.perform(render.ctab)
        }

        if (!this.dragCtx.currentItem.ref) {
          this.dragCtx.action = fromMultipleMove(
            render.ctab,
            this.editor.selection() || {},
            positionDifference
          )
        }
      } else {
        if (!this.dragCtx.action) {
          const action = fromTextAddition()
        }
      }
    }
  }

  TextTool.prototype.click = function (event) {
    const render = this.editor.render
    // const currentItem = null
    const currentItem = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    if (!currentItem) {
      propsDialog(this.editor, null, render.page2obj(event))
    } else if (currentItem.map === 'texts') {
      propsDialog(this.editor, currentItem.id)
    }

    return true
  }

  TextTool.prototype.mouseup = function (event) {
    const render = this.editor.render
    const currentItem = this.editor.findItem(event, ['texts'])
    this.editor.hover(null)

    this.editor.update(fromTextDeletion(render.ctab, currentItem.id))
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
      editor.update(fromTextAddition(editor.render.ctab, elem))
    })
    .catch(() => null)
}

export default TextTool
