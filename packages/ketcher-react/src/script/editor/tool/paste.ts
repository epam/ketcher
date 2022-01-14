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
  fromItemsFuse,
  fromPaste,
  FunctionalGroup,
  getHoverToFuse,
  getItemsToFuse
} from 'ketcher-core'

function PasteTool(editor, struct) {
  if (!(this instanceof PasteTool)) return new PasteTool(editor, struct)

  this.editor = editor
  this.editor.selection(null)
  this.struct = struct
  this.sgroups = editor.render.ctab.sgroups
  this.molecule = editor.render.ctab.molecule
  this.functionalGroups = this.molecule.functionalGroups

  const rnd = editor.render
  const { clientHeight, clientWidth } = rnd.clientArea
  const point = editor.lastEvent
    ? rnd.page2obj(editor.lastEvent)
    : rnd.page2obj({ pageX: clientWidth / 2, pageY: clientHeight / 2 })

  const [action, pasteItems] = fromPaste(rnd.ctab, this.struct, point)
  this.action = action
  this.editor.update(this.action, true)

  this.mergeItems = getItemsToFuse(this.editor, pasteItems)
  this.editor.hover(getHoverToFuse(this.mergeItems), this)
}

PasteTool.prototype.mousemove = function (event) {
  const rnd = this.editor.render

  if (this.action) this.action.perform(rnd.ctab)

  const [action, pasteItems] = fromPaste(
    rnd.ctab,
    this.struct,
    rnd.page2obj(event)
  )
  this.action = action
  this.editor.update(this.action, true)

  this.mergeItems = getItemsToFuse(this.editor, pasteItems)
  this.editor.hover(getHoverToFuse(this.mergeItems))
}

PasteTool.prototype.mouseup = function () {
  const atomsResult = []
  const bondsResult = []
  const result = []
  if (
    this.mergeItems &&
    this.functionalGroups.size &&
    this.mergeItems.atoms.size
  ) {
    for (const id of this.mergeItems.atoms.values()) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        this.functionalGroups,
        id
      )
      if (atomId !== null) atomsResult.push(atomId)
    }
  }
  if (
    this.mergeItems &&
    this.functionalGroups.size &&
    this.mergeItems.bonds.size
  ) {
    for (const id of this.mergeItems.bonds.values()) {
      const bondId = FunctionalGroup.atomsInFunctionalGroup(
        this.functionalGroups,
        id
      )
      if (bondId !== null) bondsResult.push(bondId)
    }
  }
  if (atomsResult.length > 0) {
    for (const id of atomsResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        this.functionalGroups,
        id
      )
      if (fgId !== null && !result.includes(fgId)) {
        result.push(fgId)
      }
    }
    this.editor.event.removeFG.dispatch({ fgIds: result })
    return
  } else if (bondsResult.length > 0) {
    for (const id of bondsResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByBond(
        this.molecule,
        this.functionalGroups,
        id
      )
      if (fgId !== null && !result.includes(fgId)) {
        result.push(fgId)
      }
    }
    this.editor.event.removeFG.dispatch({ fgIds: result })
    return
  }
  const editor = this.editor
  const restruct = editor.render.ctab

  editor.selection(null)

  this.action = this.action
    ? fromItemsFuse(restruct, this.mergeItems).mergeWith(this.action)
    : fromItemsFuse(restruct, this.mergeItems)

  editor.hover(null)

  if (this.action) {
    const action = this.action
    delete this.action
    this.editor.update(action)
  }
}

PasteTool.prototype.cancel = function () {
  const rnd = this.editor.render
  this.editor.hover(null)
  if (this.action) {
    this.action.perform(rnd.ctab) // revert the action
    delete this.action
    rnd.update()
  }
}
PasteTool.prototype.mouseleave = PasteTool.prototype.cancel

export default PasteTool
