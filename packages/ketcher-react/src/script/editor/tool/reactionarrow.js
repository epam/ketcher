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
  fromArrowAddition,
  fromArrowDeletion,
  fromArrowResizing
} from '../actions/reaction'

import Action from '../shared/action'
import Raphael from '../../raphael-ext'
import { fromMultipleMove } from '../actions/fragment'

function ReactionArrowTool(editor, mode) {
  if (!(this instanceof ReactionArrowTool))
    return new ReactionArrowTool(editor, mode)

  this.mode = mode
  this.editor = editor
  this.editor.selection(null)
}

ReactionArrowTool.prototype.mousedown = function (event) {
  var rnd = this.editor.render
  const p0 = rnd.page2obj(event)
  this.dragCtx = { p0 }

  var ci = this.editor.findItem(event, ['rxnArrows'])
  if (ci && ci.map === 'rxnArrows') {
    this.editor.hover(null)
    this.editor.selection({ rxnArrows: [ci.id] })
    this.dragCtx.ci = ci
  } else {
    this.dragCtx.isNew = true
    this.editor.selection(null)
  }
}

ReactionArrowTool.prototype.mousemove = function (event) {
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
        this.dragCtx.action = fromArrowResizing(
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
        const action = fromArrowAddition(
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

      this.dragCtx.action = fromArrowResizing(
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
    const items = this.editor.findItem(event, ['rxnArrows'])
    this.editor.hover(items)
  }
}

ReactionArrowTool.prototype.mouseup = function (event) {
  if (!this.dragCtx) return true
  const rnd = this.editor.render

  setMinLength(this.dragCtx.p0, this.dragCtx.previous)

  if (this.dragCtx.action) {
    if (this.dragCtx.isNew) {
      this.editor.update(fromArrowDeletion(rnd.ctab, this.dragCtx.itemId), true)
      this.dragCtx.action = fromArrowAddition(
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

function getArrowParams(x1, y1, x2, y2) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const angle = Raphael.angle(x1, y1, x2, y2)

  return { length, angle }
}

function setMinLength(pos1, pos2) {
  const minLength = 1.5
  const defaultLength = 2

  if (!pos2) {
    pos2 = pos1
  }

  const arrowParams = getArrowParams(pos1.x, pos1.y, pos2.x, pos2.y)

  if (arrowParams.length <= minLength) {
    pos2.x =
      pos1.x +
      defaultLength * Math.cos((Math.PI * (arrowParams.angle - 180)) / 180)

    pos2.y =
      pos1.y +
      defaultLength * Math.sin((Math.PI * (arrowParams.angle - 180)) / 180)
  }
}

export default ReactionArrowTool
