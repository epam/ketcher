/****************************************************************************
 * Copyright 2020 EPAM Systems
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
import { fromMultipleMove } from '../actions/fragment'
import {
  fromSimpleObjectAddition,
  fromSimpleObjectResizing,
  fromSimpleObjectDeletion
} from '../actions/simpleobject'

function SimpleObjectTool(editor, mode) {
  if (!(this instanceof SimpleObjectTool))
    return new SimpleObjectTool(editor, mode)

  this.mode = mode
  this.editor = editor
  this.editor.selection(null)
}

SimpleObjectTool.prototype.mousedown = function (event) {
  var rnd = this.editor.render
  const p0 = rnd.page2obj(event)
  this.dragCtx = { p0 }

  var ci = this.editor.findItem(event, ['simpleObjects'])
  if (ci && ci.map === 'simpleObjects') {
    this.editor.hover(null)
    this.editor.selection({ simpleObjects: [ci.id] })
    this.dragCtx.ci = ci
  } else {
    this.dragCtx.isNew = true
    this.editor.selection(null)
  }
}

SimpleObjectTool.prototype.mousemove = function (event) {
  var rnd = this.editor.render
  if (this.dragCtx) {
    const current = rnd.page2obj(event)
    const diff = current.sub(this.dragCtx.p0)
    this.dragCtx.previous = current
    if (this.dragCtx.ci) {
      if (this.dragCtx.action) this.dragCtx.action.perform(rnd.ctab)
      if (!this.dragCtx.ci.ref) {
        this.dragCtx.action = fromMultipleMove(
          rnd.ctab,
          this.editor.selection() || {},
          diff
        )
      } else {
        this.dragCtx.action = fromSimpleObjectResizing(
          rnd.ctab,
          this.dragCtx.ci.id,
          diff,
          current,
          this.dragCtx.ci.ref,
          event.shiftKey
        )
      }
      this.editor.update(this.dragCtx.action, true)
    } else {
      if (!this.dragCtx.action) {
        const action = fromSimpleObjectAddition(
          rnd.ctab,
          [this.dragCtx.p0, this.dragCtx.p0],
          this.mode
        )
        //TODO: need to rework  actions/operations logic
        const addOperation = action.operations[0]
        const itemId = addOperation.data.id
        this.dragCtx.itemId = itemId
        this.dragCtx.action = action
        this.editor.update(this.dragCtx.action, true)
      } else {
        this.dragCtx.action.perform(rnd.ctab)
      }

      this.dragCtx.action = fromSimpleObjectResizing(
        rnd.ctab,
        this.dragCtx.itemId,
        diff,
        current,
        null,
        event.shiftKey
      )
      this.editor.update(this.dragCtx.action, true)
    }
  } else {
    const items = this.editor.findItem(event, ['simpleObjects'])
    this.editor.hover(items)
  }
}

SimpleObjectTool.prototype.mouseup = function (event) {
  if (!this.dragCtx) return true

  if (this.dragCtx.action) {
    if (this.dragCtx.isNew) {
      const rnd = this.editor.render
      this.editor.update(
        fromSimpleObjectDeletion(rnd.ctab, this.dragCtx.itemId),
        true
      )
      this.dragCtx.action = fromSimpleObjectAddition(
        rnd.ctab,
        [this.dragCtx.p0, this.dragCtx.previous],
        this.mode,
        event.shiftKey
      )
    }
    this.editor.update(this.dragCtx.action)
  }

  delete this.dragCtx
  return true
}

export default SimpleObjectTool
