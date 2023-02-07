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
  getItemsToFuse,
  mergeMapOfItemsToSet,
  setExpandSGroup,
  Struct
} from 'ketcher-core'
import Editor from '../Editor'
import utils from '../shared/utils'

class PasteTool {
  editor: Editor
  struct: Struct
  action: any
  mergeItems: any

  constructor(editor, struct) {
    this.editor = editor
    this.editor.selection(null)
    this.struct = struct

    const rnd = this.editor.render
    const { clientHeight, clientWidth } = rnd.clientArea
    const point = this.editor.lastEvent
      ? rnd.page2obj(this.editor.lastEvent)
      : rnd.page2obj({
          pageX: clientWidth / 2,
          pageY: clientHeight / 2
        } as MouseEvent)

    const [action, pasteItems] = fromPaste(rnd.ctab, this.struct, point)
    this.action = action
    this.editor.update(this.action, true)

    this.mergeItems = getItemsToFuse(this.editor, pasteItems)
    this.editor.hover(getHoverToFuse(this.mergeItems), this)
  }

  mousemove(event) {
    const rnd = this.editor.render

    if (this.action) {
      this.action.perform(rnd.ctab)
    }

    const [action, pasteItems] = fromPaste(
      rnd.ctab,
      this.struct,
      rnd.page2obj(event)
    )
    this.action = action
    this.editor.update(this.action, true)

    const nonGroupItemsAndAttachPoints = {
      ...pasteItems,
      ...utils.getNonGroupItemsAndAttachmentPoints(
        pasteItems,
        rnd.ctab.molecule
      )
    }

    this.mergeItems = getItemsToFuse(this.editor, nonGroupItemsAndAttachPoints)
    this.editor.hover(getHoverToFuse(this.mergeItems))
  }

  mouseup() {
    const struct = this.editor.render.ctab
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const atomsResult: Array<number> = []
    const bondsResult: Array<number> = []
    const result: Array<number> = []

    if (
      this.mergeItems &&
      functionalGroups.size &&
      this.mergeItems.atoms.size
    ) {
      for (const id of this.mergeItems.atoms.values()) {
        const atomId = FunctionalGroup.atomsInFunctionalGroup(
          functionalGroups,
          id
        )

        if (atomId !== null) {
          atomsResult.push(atomId)
        }
      }
    }
    if (
      this.mergeItems &&
      functionalGroups.size &&
      this.mergeItems.bonds.size
    ) {
      for (const id of this.mergeItems.bonds.values()) {
        const bondId = FunctionalGroup.atomsInFunctionalGroup(
          functionalGroups,
          id
        )

        if (bondId !== null) {
          bondsResult.push(bondId)
        }
      }
    }

    if (atomsResult.length > 0) {
      for (const id of atomsResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
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
          molecule,
          functionalGroups,
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

    const groupsInMerge = idsOfGroupsInMerge(this.mergeItems, molecule)
    if (groupsInMerge.length) {
      groupsInMerge.forEach((groupId) => {
        this.action.mergeWith(
          setExpandSGroup(struct, groupId, { expanded: true })
        )
      })
    }

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

  cancel() {
    const rnd = this.editor.render
    this.editor.hover(null)

    if (this.action) {
      this.action.perform(rnd.ctab) // revert the action
      delete this.action
      rnd.update()
    }
  }

  mouseleave() {
    this.cancel()
  }
}

function idsOfGroupsInMerge(
  mergeMaps: {
    atoms?: Map<number, number>
    bonds?: Map<number, number>
  } | null,
  struct: Struct
): number[] {
  const groupsIds: number[] = []

  const atoms = mergeMaps?.atoms && mergeMapOfItemsToSet(mergeMaps.atoms)
  const bonds = mergeMaps?.bonds && mergeMapOfItemsToSet(mergeMaps.bonds)

  atoms?.forEach((atomId) => {
    const groupId = struct.isAtomBelongToGroup(atomId)
    if (groupId !== null) groupsIds.push(groupId)
  })

  bonds?.forEach((bondId) => {
    const groupId = struct.isAtomBelongToGroup(bondId)
    if (groupId !== null) groupsIds.push(groupId)
  })

  return groupsIds
}

export default PasteTool
