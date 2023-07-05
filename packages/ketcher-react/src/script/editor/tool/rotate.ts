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
  Bond,
  FlipDirection,
  FunctionalGroup,
  Vec2,
  fromFlip,
  fromItemsFuse,
  fromRotate,
  getHoverToFuse,
  getItemsToFuse,
  isAttachmentBond
} from 'ketcher-core'

import utils from '../shared/utils'
import Editor from '../Editor'
import { Tool } from './Tool'
import { intersection } from 'lodash'

class RotateTool implements Tool {
  private readonly editor: Editor
  dragCtx: any
  isNotActiveTool = true

  constructor(editor: Editor, flipDirection?: FlipDirection) {
    this.editor = editor

    if (flipDirection) {
      const restruct = editor.render.ctab
      const selection = editor.selection()

      const selectionCenter = this.getCenter(this.editor)[0]
      const canvasCenter = restruct.getVBoxObj().centre()
      const action = fromFlip(
        restruct,
        selection,
        flipDirection,
        selectionCenter || canvasCenter
      )
      editor.update(action)
      editor.rotateController.rerender()
    }
  }

  mousedownHandle(handleCenter: Vec2, center: Vec2) {
    this.dragCtx = {
      xy0: center,
      angle1: utils.calcAngle(center, handleCenter)
    }
  }

  /**
   * @returns `[center, visibleAtoms]`,
   * `visibleAtoms` = selected atoms
   *                - atoms in contracted functional groups
   *                + functional groups's attachment atoms
   */
  getCenter(editor: Editor) {
    const selection = editor.selection()
    if (!selection) {
      return [undefined, [] as number[]] as const
    }

    const struct = editor.render.ctab.molecule
    const { texts, rxnArrows, rxnPluses } = selection

    const visibleAtoms =
      selection.atoms?.filter((atomId) => {
        const atom = struct.atoms.get(atomId)
        if (!atom) {
          return false
        }
        const isAtomNotInContractedGroup =
          !FunctionalGroup.isAtomInContractedFunctionalGroup(
            atom,
            struct.sgroups,
            struct.functionalGroups,
            false
          )
        if (isAtomNotInContractedGroup) {
          return true
        }
        const groupId = struct.getGroupIdFromAtomId(atomId)
        const sgroup = struct.sgroups.get(groupId as number)
        return sgroup?.getAttachmentAtomId() === atomId
      }) || []

    let center: Vec2 | undefined

    const attachmentBonds = struct.bonds.filter((_bondId, bond) =>
      isAttachmentBond(bond, selection)
    )

    if (attachmentBonds.size > 1) {
      /**
       *  Handle multiple attachment bonds with one intersection:
       *               0    (selected atom)
       *             / | \  (bonds)
       */
      const bondPoints: [number, number][] = []
      attachmentBonds.forEach((bond) => {
        bondPoints.push([bond.begin, bond.end])
      })
      const intersectionAtoms = intersection(...bondPoints)
      if (
        intersectionAtoms.length === 1 &&
        visibleAtoms.includes(intersectionAtoms[0])
      ) {
        center = struct.atoms.get(intersectionAtoms[0])?.pp
      }
    } else if (attachmentBonds.size === 1) {
      /**
       * Handle one attachment bond:
       * 1. the bond is unselected
       *          0  (selected atom) --> center
       *          |  (unselected bond)
       *          o  (unselected atom)
       * 2. the bond is selected
       *          0  (selected atom)
       *          |  (selected bond)
       *          o  (unselected atom) --> center
       */
      const attachmentBondId = attachmentBonds.keys().next().value as number
      const attachmentBond = attachmentBonds.get(attachmentBondId) as Bond
      const rotatePoint = [attachmentBond.begin, attachmentBond.end].find(
        (atomId) =>
          selection.bonds?.includes(attachmentBondId)
            ? !visibleAtoms.includes(atomId)
            : visibleAtoms.includes(atomId)
      ) as number
      center = struct.atoms.get(rotatePoint)?.pp
    }

    if (
      !center &&
      (visibleAtoms.length ||
        texts?.length ||
        rxnArrows?.length ||
        rxnPluses?.length)
    ) {
      center = editor.render.ctab.getSelectionRotationCenter({
        atoms: visibleAtoms,
        texts,
        rxnArrows,
        rxnPluses
      })
    }

    return [center, visibleAtoms] as const
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
