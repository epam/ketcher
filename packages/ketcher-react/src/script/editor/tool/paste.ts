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

import { fromPaste, getHoverToFuse, getItemsToFuse, Struct } from 'ketcher-core'
import Editor from '../Editor'
import { dropAndMerge } from './helper/dropAndMerge'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'
import { getMergeItems } from './helper/getMergeItems'

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

    this.mergeItems = getMergeItems(this.editor, pasteItems)
    this.editor.hover(getHoverToFuse(this.mergeItems))
  }

  mouseup() {
    const struct = this.editor.render.ctab
    const molecule = struct.molecule

    const idsOfItemsMerged = this.mergeItems && {
      ...(this.mergeItems.atoms && {
        atoms: Array.from(this.mergeItems.atoms.values())
      }),
      ...(this.mergeItems.bonds && {
        bonds: Array.from(this.mergeItems.bonds.values())
      })
    }

    const groupsIdsInvolvedInMerge = getGroupIdsFromItemArrays(
      molecule,
      idsOfItemsMerged
    )

    if (groupsIdsInvolvedInMerge.length) {
      this.editor.event.removeFG.dispatch({ fgIds: groupsIdsInvolvedInMerge })
      return
    }

    // need to delete action first, because editor.update calls this.cancel() and thus action revert 🤦‍♂️
    const action = this.action
    delete this.action
    dropAndMerge(this.editor, this.mergeItems, action)
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

export default PasteTool
