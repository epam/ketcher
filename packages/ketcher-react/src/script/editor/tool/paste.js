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

function PasteTool(editor, blockedEntities, struct) {
  if (!(this instanceof PasteTool))
    return new PasteTool(editor, blockedEntities, struct)

  this.blockedEntities = blockedEntities
  this.editor = editor
  this.editor.selection(null)
  this.struct = struct
  this.sgroups = editor.render.ctab.sgroups
  this.molecule = editor.render.ctab.molecule
  this.functionalGroups = this.molecule.functionalGroups

  const rnd = editor.render
  const point = editor.lastEvent ? rnd.page2obj(editor.lastEvent) : null

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

PasteTool.prototype.mouseup = function (event) {
  const ci = this.editor.findItem(event, ['atoms', 'bonds'])
  const atomResult = []
  const bondResult = []
  const result = []
  if (ci && this.functionalGroups && ci.map === 'atoms') {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      this.functionalGroups,
      ci.id
    )
    const atomFromStruct = atomId !== null && this.struct.atoms.get(atomId).a
    if (
      atomFromStruct &&
      !FunctionalGroup.isAtomInContractedFinctionalGroup(
        atomFromStruct,
        this.sgroups,
        this.functionalGroups,
        true
      )
    )
      atomResult.push(atomId)
  }
  if (ci && this.functionalGroups && ci.map === 'bonds') {
    const bondId = FunctionalGroup.bondsInFunctionalGroup(
      this.molecule,
      this.functionalGroups,
      ci.id
    )
    const bondFromStruct = bondId !== null && this.struct.bonds.get(bondId).b
    if (
      bondFromStruct &&
      !FunctionalGroup.isBondInContractedFunctionalGroup(
        bondFromStruct,
        this.sgroups,
        this.functionalGroups,
        true
      )
    )
      bondResult.push(bondId)
  }
  if (atomResult.length > 0) {
    for (let id of atomResult) {
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
  } else if (bondResult.length > 0) {
    for (let id of bondResult) {
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
