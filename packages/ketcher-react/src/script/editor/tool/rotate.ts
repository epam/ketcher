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
  FunctionalGroup,
  Vec2,
  fromBondAlign,
  fromFlip,
  fromItemsFuse,
  fromRotate,
  getHoverToFuse,
  getItemsToFuse
} from 'ketcher-core'

import utils from '../shared/utils'
import Editor from '../Editor'
import { Tool } from './Tool'

class RotateTool implements Tool {
  private readonly editor: Editor
  dragCtx: any
  isNotActiveTool: boolean | undefined

  constructor(editor: Editor, dir, isNotActiveTool?: boolean) {
    this.editor = editor

    if (dir) {
      const restruct = editor.render.ctab
      const selection = editor.selection()
      const singleBond =
        selection &&
        selection.bonds &&
        Object.keys(selection).length === 1 &&
        selection.bonds.length === 1
      const action = !singleBond
        ? fromFlip(restruct, selection, dir, this.getCenter(this.editor)[0])
        : fromBondAlign(restruct, selection.bonds?.[0], dir)
      editor.update(action)
      editor.rotateController.rerender()
      this.isNotActiveTool = true
      return
    }

    this.isNotActiveTool = isNotActiveTool
    if (!editor.selection()?.atoms) {
      !isNotActiveTool && this.editor.selection(null)
    }
  }

  mousedown(event, handleCenter?: Vec2, center?: Vec2) {
    const xy0 =
      center ||
      this.getCenter(this.editor)[0] ||
      this.editor.render.page2obj(event)
    this.dragCtx = {
      xy0,
      angle1: utils.calcAngle(
        xy0,
        handleCenter || this.editor.render.page2obj(event)
      )
    }
    return true
  }

  /**
   * @returns `[center, visibleAtoms]`,
   * `visibleAtoms` = selected atoms
   *                - atoms in contracted functional groups
   *                + functional groups's attachment atoms
   */
  getCenter(editor: Editor) {
    const selection = editor.selection()
    const struct = editor.render.ctab.molecule
    const { texts, rxnArrows, rxnPluses } = selection || {}

    const visibleAtoms =
      selection?.atoms?.filter((atomId) => {
        const atom = struct.atoms.get(atomId)!
        return (
          !FunctionalGroup.isAtomInContractedFunctionalGroup(
            atom,
            struct.sgroups,
            struct.functionalGroups,
            false
          ) || FunctionalGroup.isAttachmentPointAtom(atomId, struct)
        )
      }) || []

    let xy0: Vec2 | undefined

    let attachAtomId: number | null = null
    let isMoreThanOneAttachAtom = false
    visibleAtoms.forEach((aid) => {
      const atom = struct.atoms.get(aid)

      if (isMoreThanOneAttachAtom) return

      atom?.neighbors.find((nei) => {
        const hb = struct.halfBonds.get(nei)

        if (hb) {
          if (editor.selection()?.atoms?.indexOf(hb.end as number) === -1) {
            if (attachAtomId === null) {
              attachAtomId = aid
            } else if (attachAtomId !== aid) {
              isMoreThanOneAttachAtom = true
              return true
            }
          }
        }
        return false
      })
    })

    if (!isMoreThanOneAttachAtom && attachAtomId !== null) {
      xy0 = struct.atoms.get(attachAtomId)?.pp as Vec2
    } else if (
      visibleAtoms.length ||
      texts?.length ||
      rxnArrows?.length ||
      rxnPluses?.length
    ) {
      const selectionBoundingBox = editor.render.ctab.getVBoxObj({
        atoms: visibleAtoms,
        texts,
        rxnArrows,
        rxnPluses
      })
      xy0 = selectionBoundingBox?.centre()
    }

    return [xy0, visibleAtoms] as const
  }

  mousemove(event) {
    if (!this.dragCtx) {
      this.editor.hover(null, null, event)
      return true
    }

    const rnd = this.editor.render
    const dragCtx = this.dragCtx

    const pos = rnd.page2obj(event)
    let angle = utils.calcAngle(dragCtx.xy0, pos) - dragCtx.angle1

    if (!event.ctrlKey) {
      angle = utils.fracAngle(angle, null)
    }

    const degrees = utils.degrees(angle)

    if ('angle' in dragCtx && dragCtx.angle === degrees) {
      return true
    }

    if ('action' in dragCtx) {
      dragCtx.action.perform(rnd.ctab)
    }

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
    this.editor.hover(getHoverToFuse(dragCtx.mergeItems), null, event)

    this.editor.update(dragCtx.action, true)
    return true
  }

  mouseup() {
    if (!this.dragCtx) {
      return true
    }

    const dragCtx = this.dragCtx
    const restruct = this.editor.render.ctab

    const action = dragCtx.action
      ? fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action)
      : fromItemsFuse(restruct, dragCtx.mergeItems)
    delete this.dragCtx

    this.editor.update(action)

    if (dragCtx.mergeItems) {
      this.editor.selection(null)
    }

    this.editor.event.message.dispatch({
      info: false
    })
    return true
  }

  cancel() {
    this.mouseup()
  }

  mouseleave() {
    this.mouseup()
  }
}

export default RotateTool
