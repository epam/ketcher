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
  Vec2,
  fromBondAlign,
  fromFlip,
  fromItemsFuse,
  fromRotate,
  getHoverToFuse,
  getItemsToFuse
} from 'ketcher-core'

import utils from '../shared/utils'

function RotateTool(editor, dir) {
  if (!(this instanceof RotateTool)) {
    if (!dir) return new RotateTool(editor)

    const restruct = editor.render.ctab
    const selection = editor.selection()
    const singleBond =
      selection &&
      selection.bonds &&
      Object.keys(selection).length === 1 &&
      selection.bonds.length === 1
    const action = !singleBond
      ? fromFlip(restruct, selection, dir)
      : fromBondAlign(restruct, selection.bonds[0], dir)
    editor.update(action)
    return null
  }

  this.editor = editor

  if (!editor.selection() || !editor.selection().atoms)
    // otherwise, clear selection
    this.editor.selection(null)
}

RotateTool.prototype.mousedown = function (event) {
  var xy0 = new Vec2()
  var selection = this.editor.selection()
  var rnd = this.editor.render
  var struct = rnd.ctab.molecule

  if (selection && selection.atoms) {
    var rotId = null
    var rotAll = false

    selection.atoms.forEach((aid) => {
      var atom = struct.atoms.get(aid)

      xy0.add_(atom.pp) // eslint-disable-line no-underscore-dangle

      if (rotAll) return

      atom.neighbors.find((nei) => {
        var hb = struct.halfBonds.get(nei)

        if (selection.atoms.indexOf(hb.end) === -1) {
          if (hb.loop >= 0) {
            var neiAtom = struct.atoms.get(aid)
            if (
              !neiAtom.neighbors.find((neiNei) => {
                var neiHb = struct.halfBonds.get(neiNei)
                return (
                  neiHb.loop >= 0 && selection.atoms.indexOf(neiHb.end) !== -1
                )
              })
            ) {
              rotAll = true
              return true
            }
          }
          if (rotId == null) {
            rotId = aid
          } else if (rotId !== aid) {
            rotAll = true
            return true
          }
        }
        return false
      })
    })

    if (!rotAll && rotId !== null) xy0 = struct.atoms.get(rotId).pp
    else xy0 = xy0.scaled(1 / selection.atoms.length)
  } else if (struct.atoms?.size) {
    struct.atoms.forEach((atom) => {
      xy0.add_(atom.pp)
    }) // eslint-disable-line no-underscore-dangle, max-len
    // poor man struct center (without sdata, etc)
    xy0 = xy0.scaled(1 / struct.atoms.size)
  } else {
    xy0 = rnd.page2obj(event)
  }
  this.dragCtx = {
    xy0,
    angle1: utils.calcAngle(xy0, rnd.page2obj(event))
  }
  return true
}

RotateTool.prototype.mousemove = function (event) {
  // eslint-disable-line max-statements
  if (!this.dragCtx) return true

  const rnd = this.editor.render
  const dragCtx = this.dragCtx

  const pos = rnd.page2obj(event)
  let angle = utils.calcAngle(dragCtx.xy0, pos) - dragCtx.angle1
  if (!event.ctrlKey) angle = utils.fracAngle(angle)

  const degrees = utils.degrees(angle)

  if ('angle' in dragCtx && dragCtx.angle === degrees) return true
  if ('action' in dragCtx) dragCtx.action.perform(rnd.ctab)

  dragCtx.angle = degrees
  dragCtx.action = fromRotate(
    rnd.ctab,
    this.editor.selection(),
    dragCtx.xy0,
    angle
  )

  this.editor.event.message.dispatch({ info: degrees + 'º' })

  const expSel = this.editor.explicitSelected()
  dragCtx.mergeItems = getItemsToFuse(this.editor, expSel)
  this.editor.hover(getHoverToFuse(dragCtx.mergeItems))

  this.editor.update(dragCtx.action, true)
  return true
}

RotateTool.prototype.mouseup = function () {
  if (!this.dragCtx) return true
  const dragCtx = this.dragCtx
  const restruct = this.editor.render.ctab

  const action = dragCtx.action
    ? fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action)
    : fromItemsFuse(restruct, dragCtx.mergeItems)
  delete this.dragCtx

  this.editor.update(action)
  this.editor.hover(null)
  if (dragCtx.mergeItems) this.editor.selection(null)
  this.editor.event.message.dispatch({
    info: false
  })
  return true
}

RotateTool.prototype.cancel = RotateTool.prototype.mouseup
RotateTool.prototype.mouseleave = RotateTool.prototype.mouseup

export default RotateTool
