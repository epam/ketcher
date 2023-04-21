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
  fromTemplateOnAtom,
  getHoverToFuse,
  getItemsToFuse,
  SGroup,
  Struct,
  Vec2
} from 'ketcher-core'
import Editor from '../Editor'
import { dropAndMerge } from './helper/dropAndMerge'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'
import { getMergeItems } from './helper/getMergeItems'
import utils from '../shared/utils'

class PasteTool {
  editor: Editor
  struct: Struct
  action: any
  templateAction: any
  dragCtx: any
  findItems: string[]
  mergeItems: any
  isSingleContractedGroup: boolean

  constructor(editor, struct) {
    this.editor = editor
    this.editor.selection(null)
    this.struct = struct

    this.isSingleContractedGroup =
      struct.isSingleGroup() && !struct.functionalGroups.get(0)?.isExpanded

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

    this.findItems = ['functionalGroups']
    this.mergeItems = getItemsToFuse(this.editor, pasteItems)
    this.editor.hover(getHoverToFuse(this.mergeItems), this)
  }

  mousedown(event) {
    if (
      !this.isSingleContractedGroup ||
      SGroup.isSaltOrSolvent(this.struct.sgroups.get(0)?.data.name)
    ) {
      return
    }

    if (this.action) {
      // remove pasted group from canvas to find closest group correctly
      this.action?.perform(this.editor.render.ctab)
    }

    const closestGroupItem = this.editor.findItem(event, ['functionalGroups'])
    const closestGroup = this.editor.struct().sgroups.get(closestGroupItem?.id)

    // not dropping on a group (tmp, should be removed when dealing with other entities)
    if (!closestGroupItem || SGroup.isSaltOrSolvent(closestGroup?.data.name)) {
      // recreate action and continue as usual
      const [action] = fromPaste(
        this.editor.render.ctab,
        this.struct,
        this.editor.render.page2obj(event)
      )
      this.action = action
      return
    }

    // remove action to prevent error when trying to "perform" it again in mousemove
    this.action = null

    this.dragCtx = {
      xy0: this.editor.render.page2obj(event),
      item: closestGroupItem
    }
  }

  mousemove(event) {
    if (this.action) {
      this.action?.perform(this.editor.render.ctab)
    }

    if (this.dragCtx) {
      // template-like logic for group-on-group actions
      let pos0: Vec2 | null | undefined = null
      const pos1 = this.editor.render.page2obj(event)

      const extraBond = true

      const targetGroup = this.editor.struct().sgroups.get(this.dragCtx.item.id)
      const atomId = targetGroup?.getAttAtomId(this.editor.struct())

      if (atomId !== undefined) {
        const atom = this.editor.struct().atoms.get(atomId)
        pos0 = atom?.pp
      }

      // calc angle
      let angle = utils.calcAngle(pos0, pos1)

      if (!event.ctrlKey) {
        angle = utils.fracAngle(angle, null)
      }

      const degrees = utils.degrees(angle)

      // check if anything changed since last time
      if (
        this.dragCtx.hasOwnProperty('angle') &&
        this.dragCtx.angle === degrees
      )
        return

      if (this.dragCtx.action) {
        this.dragCtx.action.perform(this.editor.render.ctab)
      }

      this.dragCtx.angle = degrees

      const [action] = fromTemplateOnAtom(
        this.editor.render.ctab,
        prepareTemplateFromSingleGroup(this.struct),
        atomId,
        angle,
        extraBond
      )

      this.dragCtx.action = action
      this.editor.update(this.dragCtx.action, true)
    } else {
      // common paste logic
      const [action, pasteItems] = fromPaste(
        this.editor.render.ctab,
        this.struct,
        this.editor.render.page2obj(event)
      )
      this.action = action
      this.editor.update(this.action, true, { resizeCanvas: false })

      this.mergeItems = getMergeItems(this.editor, pasteItems)
      this.editor.hover(getHoverToFuse(this.mergeItems))
    }
  }

  mouseup() {
    const idsOfItemsMerged = this.mergeItems && {
      ...(this.mergeItems.atoms && {
        atoms: Array.from(this.mergeItems.atoms.values())
      }),
      ...(this.mergeItems.bonds && {
        bonds: Array.from(this.mergeItems.bonds.values())
      })
    }

    const groupsIdsInvolvedInMerge = getGroupIdsFromItemArrays(
      this.editor.struct(),
      idsOfItemsMerged
    )

    if (groupsIdsInvolvedInMerge.length) {
      this.editor.event.removeFG.dispatch({ fgIds: groupsIdsInvolvedInMerge })
      return
    }

    if (this.dragCtx) {
      const dragCtx = this.dragCtx
      delete this.dragCtx

      dragCtx.action = dragCtx.action
        ? fromItemsFuse(this.editor.render.ctab, dragCtx.mergeItems).mergeWith(
            dragCtx.action
          )
        : fromItemsFuse(this.editor.render.ctab, dragCtx.mergeItems)

      this.editor.hover(null)
      this.editor.update(dragCtx.action)
      this.editor.event.message.dispatch({ info: false })
    } else {
      // need to delete action first, because editor.update calls this.cancel() and thus action revert 🤦‍♂️
      const action = this.action
      delete this.action
      dropAndMerge(this.editor, this.mergeItems, action, true)
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

type Template = {
  aid?: number
  molecule?: Struct
  xy0?: Vec2
  angle0?: number
}

/** Adds position and angle info to the molecule, similar to Template tool native behavior */
function prepareTemplateFromSingleGroup(molecule: Struct): Template | null {
  const template: Template = {}
  const sgroup = molecule.sgroups.get(0)
  const xy0 = new Vec2()

  molecule.atoms.forEach((atom) => {
    xy0.add_(atom.pp) // eslint-disable-line no-underscore-dangle
  })

  template.aid = sgroup?.getAttAtomId(molecule) || 0
  template.molecule = molecule
  template.xy0 = xy0.scaled(1 / (molecule.atoms.size || 1)) // template center

  const atom = molecule.atoms.get(template.aid)
  if (atom) {
    template.angle0 = utils.calcAngle(atom.pp, template.xy0) // center tilt
  }

  return template
}

export default PasteTool
