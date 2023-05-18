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

class RotateTool {
  editor: Editor
  dragCtx: any
  isNotActiveTool: boolean | undefined

  constructor(editor, dir, isNotActiveTool?: boolean) {
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
        ? fromFlip(restruct, selection, dir, null)
        : fromBondAlign(restruct, selection.bonds[0], dir)
      editor.update(action)
      this.isNotActiveTool = true
      return
    }

    this.isNotActiveTool = isNotActiveTool
    if (!editor.selection()?.atoms) {
      !isNotActiveTool && this.editor.selection(null)
    }
  }

  /**
   * @param rotatedByHandle when rotated by handle (see: ./rotate-controller),
   *        starting angle should be `-Math.PI / 2` from the X axis
   */
  mousedown(event, rotatedByHandle?: boolean) {
    const xy0 = this.getCenter(this.editor, event)[0]
    this.dragCtx = {
      xy0,
      angle1: rotatedByHandle
        ? -Math.PI / 2
        : utils.calcAngle(xy0, this.editor.render.page2obj(event))
    }
    return true
  }

  /**
   * @returns `[center, visibleAtoms]`,
   * `visibleAtoms` = selected atoms
   *                - atoms in contracted functional groups
   *                + functional groups's attachment atoms
   */
  getCenter(editor: Editor, event?) {
    const visibleAtoms =
      this.editor.selection()?.atoms?.filter((atomId) => {
        const struct = this.editor.render.ctab.molecule
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

    let xy0 = new Vec2()
    const struct = editor.render.ctab.molecule

    if (visibleAtoms.length > 0) {
      let rotId: number | null = null
      let rotAll = false

      visibleAtoms.forEach((aid) => {
        const atom = struct.atoms.get(aid)

        if (rotAll) return

        atom?.neighbors.find((nei) => {
          const hb = struct.halfBonds.get(nei)

          if (hb) {
            if (editor.selection()?.atoms?.indexOf(hb.end as number) === -1) {
              if (rotId == null) {
                rotId = aid
              } else if (rotId !== aid) {
                rotAll = true
                return true
              }
            }
          }
          return false
        })
      })

      if (!rotAll && rotId !== null) {
        xy0 = struct.atoms.get(rotId)?.pp as Vec2
      } else {
        const selectionBoundingBox = editor.render.ctab.getVBoxObj({
          atoms: visibleAtoms
        })!
        xy0 = selectionBoundingBox.centre()
      }
    } else if (struct.atoms?.size) {
      struct.atoms.forEach((atom) => {
        xy0.add_(atom.pp)
      }) // eslint-disable-line no-underscore-dangle, max-len
      // poor man struct center (without sdata, etc)
      xy0 = xy0.scaled(1 / struct.atoms.size)
    } else if (event) {
      xy0 = editor.render.page2obj(event)
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
