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
  fromArrowResizing,
  fromMultipleMove,
  Vec2
} from 'ketcher-core'
import Editor from '../Editor'

class ReactionArrowTool {
  mode: any
  editor: Editor
  dragCtx: any

  constructor(editor, mode) {
    this.mode = mode
    this.editor = editor
    this.editor.selection(null)
  }

  mousedown(event) {
    const rnd = this.editor.render
    const p0 = rnd.page2obj(event)
    this.dragCtx = { p0 }

    const ci = this.editor.findItem(event, ['rxnArrows'])

    if (ci && ci.map === 'rxnArrows') {
      this.editor.hover(null)
      this.editor.selection({ rxnArrows: [ci.id] })
      this.dragCtx.ci = ci
    } else {
      this.dragCtx.isNew = true
      this.editor.selection(null)
    }
  }

  mousemove(event) {
    const rnd = this.editor.render

    if (this.dragCtx) {
      const current = rnd.page2obj(event)
      const diff = current.sub(this.dragCtx.p0)
      this.dragCtx.previous = current

      if (this.dragCtx.ci) {
        if (this.dragCtx.action) {
          this.dragCtx.action.perform(rnd.ctab)
        }

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
            this.dragCtx.ci.ref
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
          // TODO: need to rework  actions/operations logic
          const addOperation = action.operations[0]
          // @ts-ignore
          this.dragCtx.itemId = addOperation.data.id
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
          null
        )
        this.editor.update(this.dragCtx.action, true)
      }
    } else {
      const items = this.editor.findItem(event, ['rxnArrows'])
      this.editor.hover(items)
    }
  }

  mouseup() {
    if (!this.dragCtx) {
      return true
    }

    const rnd = this.editor.render

    const p0 = this.dragCtx.p0
    const p1 = getDefaultLengthPos(p0, this.dragCtx.previous)

    if (this.dragCtx.action) {
      if (this.dragCtx.isNew) {
        this.editor.update(
          fromArrowDeletion(rnd.ctab, this.dragCtx.itemId),
          true
        )
        this.dragCtx.action = fromArrowAddition(rnd.ctab, [p0, p1], this.mode)
      }

      this.editor.update(this.dragCtx.action)
    }
    delete this.dragCtx
    return true
  }

  click(event) {
    const rnd = this.editor.render
    const ci = this.editor.findItem(event, ['rxnArrows'])
    const p0 = rnd.page2obj(event)

    if (!ci) {
      const pos = [p0, getDefaultLengthPos(p0, null)]
      this.editor.update(fromArrowAddition(rnd.ctab, pos, this.mode))
    }
  }
}

function getArrowParams(x1, y1, x2, y2) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const angle = calcAngle(x2, y2, x1, y1)
  return { length, angle }
}

function getDefaultLengthPos(pos1, pos2) {
  const minLength = 1.5
  const defaultLength = 2
  if (!pos2) {
    return new Vec2(pos1.x + defaultLength, pos1.y)
  }
  const arrowParams = getArrowParams(pos1.x, pos1.y, pos2.x, pos2.y)
  if (arrowParams.length <= minLength) {
    const newPos = new Vec2()
    newPos.x =
      pos1.x + defaultLength * Math.cos((Math.PI * arrowParams.angle) / 180)
    newPos.y =
      pos1.y + defaultLength * Math.sin((Math.PI * arrowParams.angle) / 180)
    return newPos
  }
  return pos2
}

function calcAngle(x1, y1, x2, y2) {
  const x = x1 - x2
  const y = y1 - y2
  if (!x && !y) {
    return 0
  }
  return (180 + (Math.atan2(-y, -x) * 180) / Math.PI + 360) % 360
}

export default ReactionArrowTool
