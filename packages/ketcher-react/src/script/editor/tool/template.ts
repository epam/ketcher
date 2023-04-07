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
  fromItemsFuse,
  fromTemplateOnAtom,
  fromTemplateOnBondAction,
  fromTemplateOnCanvas,
  getHoverToFuse,
  getItemsToFuse,
  FunctionalGroup,
  SGroup,
  ReStruct,
  Struct,
  fromFragmentDeletion,
  fromSgroupDeletion,
  Action
} from 'ketcher-core'

import utils from '../shared/utils'
import Editor from '../Editor'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'
import { MODES } from 'ketcher-react/src/constants'

type MergeItems = Record<string, Map<unknown, unknown>> | null

class TemplateTool {
  editor: Editor
  mode: any
  template: any
  findItems: Array<string>
  mergeItems: MergeItems = null
  dragCtx: any
  targetGroupsIds: Array<number> = []
  isSaltOrSolvent: boolean
  event: Event | undefined

  constructor(editor: Editor, tmpl) {
    this.editor = editor
    this.mode = getTemplateMode(tmpl)
    this.editor.selection(null)
    this.isSaltOrSolvent = SGroup.isSaltOrSolvent(tmpl.struct.name)

    this.template = {
      aid: parseInt(tmpl.aid) || 0,
      bid: parseInt(tmpl.bid) || 0
    }

    const frag = tmpl.struct
    frag.rescale()

    const xy0 = new Vec2()
    frag.atoms.forEach((atom) => {
      xy0.add_(atom.pp) // eslint-disable-line no-underscore-dangle
    })

    this.template.molecule = frag // preloaded struct
    this.findItems = []
    this.template.xy0 = xy0.scaled(1 / (frag.atoms.size || 1)) // template center

    const atom = frag.atoms.get(this.template.aid)
    if (atom) {
      this.template.angle0 = utils.calcAngle(atom.pp, this.template.xy0) // center tilt
      this.findItems.push('atoms')
    }

    const bond = frag.bonds.get(this.template.bid)
    if (bond && !this.isModeFunctionalGroup) {
      // template location sign against attachment bond
      this.template.sign = getSign(frag, bond, this.template.xy0)
      this.findItems.push('bonds')
    }

    const sgroup = frag.sgroups.size
    if (sgroup) {
      this.findItems.push('functionalGroups')
    }

    editor.hoverIcon.label = tmpl.struct.name
    editor.hoverIcon.fill = '#000000'
    editor.hoverIcon.show()
    editor.hoverIcon.updatePosition()
  }

  get struct() {
    return this.editor.render.ctab.molecule
  }

  get functionalGroups() {
    return this.struct.functionalGroups
  }

  get isModeFunctionalGroup(): boolean {
    return this.mode === MODES.FG
  }

  get closestItem() {
    return this.editor.findItem(this.event, [
      'atoms',
      'bonds',
      'sgroups',
      'functionalGroups'
    ])
  }

  get isNeedToShowRemoveAbbreviationPopup(): boolean {
    const targetId = this.findKeyOfRelatedGroupId(this.closestItem?.id)
    const isTargetExpanded = this.functionalGroups.get(targetId!)?.isExpanded
    const isTargetAtomOrBond =
      this.targetGroupsIds.length && !this.isModeFunctionalGroup

    return Boolean(isTargetExpanded || isTargetAtomOrBond)
  }

  findKeyOfRelatedGroupId(clickedClosestItemId: number): number {
    let targetId

    const relatedGroupId = FunctionalGroup.findFunctionalGroupByAtom(
      this.functionalGroups,
      clickedClosestItemId
    )

    this.functionalGroups.forEach((fg, key) => {
      if (fg.relatedSGroupId === relatedGroupId) {
        targetId = key
      }
    })

    return targetId
  }

  showRemoveAbbreviationPopup(): Promise<void> {
    return this.editor.event.removeFG
      .dispatch({ fgIds: this.targetGroupsIds })
      .then(() => {
        // case when we remove abbreviation group, click on benzene ring and try to add it
        this.targetGroupsIds.length = 0
        return Promise.resolve()
      })
  }

  async mousedown(event) {
    this.event = event

    if (this.functionalGroups.size) {
      this.targetGroupsIds = getGroupIdsFromItemArrays(this.struct, {
        ...(this.closestItem?.map === 'atoms' && {
          atoms: [this.closestItem.id]
        }),
        ...(this.closestItem?.map === 'bonds' && {
          bonds: [this.closestItem.id]
        })
      })

      if (
        // if point is functional group and it is not expanded
        this.closestItem?.map === 'functionalGroups' &&
        FunctionalGroup.isContractedFunctionalGroup(
          this.closestItem.id,
          this.functionalGroups
        )
      ) {
        this.targetGroupsIds.push(this.closestItem.id)
      }
    }

    if (this.isNeedToShowRemoveAbbreviationPopup) {
      await this.showRemoveAbbreviationPopup()

      return
    }

    this.editor.hover(null)

    this.dragCtx = {
      xy0: this.editor.render.page2obj(this.event),
      item: this.editor.findItem(this.event, this.findItems)
    }

    const dragCtx = this.dragCtx
    const ci = dragCtx.item

    if (!ci || this.isSaltOrSolvent) {
      //  ci.type == 'Canvas'
      delete dragCtx.item
      return
    }

    if (ci.map === 'bonds' && !this.isModeFunctionalGroup) {
      // calculate fragment center
      const xy0 = new Vec2()
      const bond = this.struct.bonds.get(ci.id)
      const frid = this.struct.atoms.get(bond?.begin as number)?.fragment
      const frIds = this.struct.getFragmentIds(frid as number)
      let count = 0

      let loop = this.struct.halfBonds.get(bond?.hb1 as number)?.loop

      if (loop && loop < 0) {
        loop = this.struct.halfBonds.get(bond?.hb2 as number)?.loop
      }

      if (loop && loop >= 0) {
        const loopHbs = this.struct.loops.get(loop)?.hbs
        loopHbs?.forEach((hb) => {
          const halfBondBegin = this.struct.halfBonds.get(hb)?.begin

          if (halfBondBegin) {
            const hbbAtom = this.struct.atoms.get(halfBondBegin)

            if (hbbAtom) {
              xy0.add_(hbbAtom.pp) // eslint-disable-line no-underscore-dangle, max-len
              count++
            }
          }
        })
      } else {
        frIds.forEach((id) => {
          const atomById = this.struct.atoms.get(id)

          if (atomById) {
            xy0.add_(atomById.pp) // eslint-disable-line no-underscore-dangle
            count++
          }
        })
      }

      dragCtx.v0 = xy0.scaled(1 / count)

      const sign = getSign(this.struct, bond, dragCtx.v0)

      // calculate default template flip
      dragCtx.sign1 = sign || 1
      dragCtx.sign2 = this.template.sign
    }
  }

  mousemove(event) {
    if (!this.dragCtx) {
      this.editor.hoverIcon.show()
      this.editor.hoverIcon.updatePosition()
      this.editor.hover(
        this.editor.findItem(event, this.findItems),
        null,
        event
      )
      return true
    }

    const dragCtx = this.dragCtx
    const ci = dragCtx.item
    let targetPos: Vec2 | null | undefined = null
    const eventPos = this.editor.render.page2obj(event)

    /* moving when attached to bond */
    if (ci && ci.map === 'bonds' && !this.isModeFunctionalGroup) {
      const bond = this.struct.bonds.get(ci.id)
      let sign = getSign(this.struct, bond, eventPos)

      if (dragCtx.sign1 * this.template.sign > 0) {
        sign = -sign
      }

      if (sign !== dragCtx.sign2 || !dragCtx.action) {
        if (dragCtx.action) {
          dragCtx.action.perform(this.editor.render.ctab)
        } // undo previous action

        dragCtx.sign2 = sign
        const [action, pasteItems] = fromTemplateOnBondAction(
          this.editor.render.ctab,
          this.template,
          ci.id,
          this.editor.event,
          dragCtx.sign1 * dragCtx.sign2 > 0,
          false
        ) as Array<any>

        dragCtx.action = action
        this.editor.update(dragCtx.action, true)

        dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
        this.editor.hover(getHoverToFuse(dragCtx.mergeItems))
      }
      return true
    }
    /* end */

    let extraBond: boolean | null = null
    // calc initial pos and is extra bond needed
    if (!ci) {
      //  ci.type == 'Canvas'
      targetPos = dragCtx.xy0
    } else if (ci.map === 'atoms' || ci.map === 'functionalGroups') {
      const atomId = getTargetAtomId(this.struct, ci)

      if (atomId !== undefined) {
        const atom = this.struct.atoms.get(atomId)
        targetPos = atom?.pp

        if (targetPos) {
          extraBond = this.isModeFunctionalGroup
            ? true
            : Vec2.dist(targetPos, eventPos) > 1
        }
      }
    }

    if (!targetPos) {
      return true
    }

    // calc angle
    let angle = utils.calcAngle(targetPos, eventPos)

    if (!event.ctrlKey) {
      angle = utils.fracAngle(angle, null)
    }

    const degrees = utils.degrees(angle)
    this.editor.event.message.dispatch({ info: degrees + 'º' })

    // check if anything changed since last time
    if (
      // eslint-disable-next-line no-prototype-builtins
      dragCtx.hasOwnProperty('angle') &&
      dragCtx.angle === degrees &&
      // eslint-disable-next-line no-prototype-builtins
      (!dragCtx.hasOwnProperty('extra_bond') ||
        dragCtx.extra_bond === extraBond)
    ) {
      return true
    }

    // undo previous action
    if (dragCtx.action) {
      dragCtx.action.perform(this.editor.render.ctab)
    }

    // create new action
    dragCtx.angle = degrees
    let action = null
    let pasteItems

    if (!ci) {
      const isAddingFunctionalGroup = this.template?.molecule?.sgroups.size
      if (isAddingFunctionalGroup) {
        // skip, b/c we dont want to do any additional actions (e.g. rotating for s-groups)
        return true
      }
      ;[action, pasteItems] = fromTemplateOnCanvas(
        this.editor.render.ctab,
        this.template,
        targetPos,
        angle
      )
    } else if (ci?.map === 'atoms' || ci?.map === 'functionalGroups') {
      const atomId = getTargetAtomId(this.struct, ci)
      ;[action, pasteItems] = fromTemplateOnAtom(
        this.editor.render.ctab,
        this.template,
        atomId,
        angle,
        extraBond
      )
      dragCtx.extra_bond = extraBond
    }
    dragCtx.action = action

    this.editor.update(dragCtx.action, true)

    if (!this.isModeFunctionalGroup) {
      dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
      this.editor.hover(getHoverToFuse(dragCtx.mergeItems))
    }

    // TODO: refactor after #2195 comes into effect
    if (this.targetGroupsIds.length) this.targetGroupsIds.length = 0

    return true
  }

  mouseup(event) {
    const dragCtx = this.dragCtx

    if (!dragCtx) {
      return true
    }

    delete this.dragCtx

    const restruct = this.editor.render.ctab
    let ci = dragCtx.item

    /* after moving around bond */
    if (
      dragCtx.action &&
      ci &&
      ci.map === 'bonds' &&
      !this.isModeFunctionalGroup
    ) {
      dragCtx.action.perform(restruct) // revert drag action

      const promise = fromTemplateOnBondAction(
        restruct,
        this.template,
        ci.id,
        this.editor.event,
        dragCtx.sign1 * dragCtx.sign2 > 0,
        true
      ) as Promise<any>

      promise.then(([action, pasteItems]) => {
        const mergeItems = getItemsToFuse(this.editor, pasteItems)
        action = fromItemsFuse(restruct, mergeItems).mergeWith(action)
        this.editor.update(action)
      })
      return true
    }
    /* end */

    let action, functionalGroupRemoveAction
    let pasteItems = null

    if (this.isSaltOrSolvent) {
      addSaltsAndSolventsOnCanvasWithoutMerge(
        restruct,
        this.template,
        dragCtx,
        this.editor
      )
      this.editor.hover(
        this.editor.findItem(event, this.findItems),
        null,
        event
      )
      return true
    } else if (
      ci?.map === 'functionalGroups' &&
      FunctionalGroup.isContractedFunctionalGroup(
        ci.id,
        this.functionalGroups
      ) &&
      this.isModeFunctionalGroup &&
      this.targetGroupsIds.length
    ) {
      functionalGroupRemoveAction = new Action()
      const restruct = this.editor.render.ctab
      const functionalGroupToReplace = this.struct.sgroups.get(ci.id)!
      const attachmentAtomId = functionalGroupToReplace.getAttAtomId(
        this.struct
      )
      const atomsWithoutAttachmentAtom = SGroup.getAtoms(
        this.struct,
        functionalGroupToReplace
      ).filter((id) => id !== attachmentAtomId)

      functionalGroupRemoveAction.mergeWith(fromSgroupDeletion(restruct, ci.id))
      functionalGroupRemoveAction.mergeWith(
        fromFragmentDeletion(restruct, { atoms: atomsWithoutAttachmentAtom })
      )

      ci = { map: 'atoms', id: attachmentAtomId }
    }

    if (!dragCtx.action) {
      if (!ci) {
        //  ci.type == 'Canvas'
        ;[action, pasteItems] = fromTemplateOnCanvas(
          restruct,
          this.template,
          dragCtx.xy0,
          0
        )
        dragCtx.action = action
      } else if (ci.map === 'atoms') {
        const degree = restruct.atoms.get(ci.id)?.a.neighbors.length
        let angle

        if (degree && degree > 1) {
          // common case
          angle = null
        } else if (degree === 1) {
          // on chain end
          const atom = this.struct.atoms.get(ci.id)
          const neiId =
            atom && this.struct.halfBonds.get(atom.neighbors[0])?.end
          const nei: any =
            (neiId || neiId === 0) && this.struct.atoms.get(neiId)

          angle = event.ctrlKey
            ? utils.calcAngle(nei?.pp, atom?.pp)
            : utils.fracAngle(utils.calcAngle(nei.pp, atom?.pp), null)
        } else {
          // on single atom
          angle = 0
        }

        ;[action, pasteItems] = fromTemplateOnAtom(
          restruct,
          this.template,
          ci.id,
          angle,
          false
        )
        if (functionalGroupRemoveAction) {
          action = functionalGroupRemoveAction.mergeWith(action)
        }
        dragCtx.action = action
      } else if (ci.map === 'bonds' && !this.isModeFunctionalGroup) {
        const promise = fromTemplateOnBondAction(
          restruct,
          this.template,
          ci.id,
          this.editor.event,
          dragCtx.sign1 * dragCtx.sign2 > 0,
          true
        ) as Promise<any>

        promise.then(([action, pasteItems]) => {
          if (!this.isModeFunctionalGroup) {
            const mergeItems = getItemsToFuse(this.editor, pasteItems)
            action = fromItemsFuse(restruct, mergeItems).mergeWith(action)
            this.editor.update(action)
          }
        })

        return true
      }
    }

    this.editor.selection(null)

    if (!dragCtx.mergeItems && pasteItems && !this.isModeFunctionalGroup) {
      dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
    }
    dragCtx.action = dragCtx.action
      ? fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action)
      : fromItemsFuse(restruct, dragCtx.mergeItems)

    const completeAction = dragCtx.action
    if (completeAction && !completeAction.isDummy()) {
      this.editor.update(completeAction)
    }
    this.editor.hover(this.editor.findItem(event, this.findItems), null, event)
    this.editor.event.showInfo.dispatch(null)
    this.editor.event.message.dispatch({ info: false })

    return true
  }

  cancel(e) {
    this.mouseup(e)
  }

  mouseleave(e) {
    this.mouseup(e)
  }
}

function addSaltsAndSolventsOnCanvasWithoutMerge(
  restruct: ReStruct,
  template: Struct,
  dragCtx,
  editor: Editor
) {
  const [action] = fromTemplateOnCanvas(restruct, template, dragCtx.xy0, 0)
  editor.update(action)
  editor.selection(null)
  editor.hover(null)
  editor.event.message.dispatch({
    info: false
  })
}

function getTemplateMode(tmpl) {
  if (tmpl.mode) {
    return tmpl.mode
  }

  if (['Functional Groups', 'Salts and Solvents'].includes(tmpl.props?.group)) {
    return MODES.FG
  }

  return null
}

function getSign(molecule, bond, v) {
  const begin = molecule.atoms.get(bond.begin).pp
  const end = molecule.atoms.get(bond.end).pp

  const sign = Vec2.cross(Vec2.diff(begin, end), Vec2.diff(v, end))

  if (sign > 0) {
    return 1
  }

  if (sign < 0) {
    return -1
  }

  return 0
}

function getTargetAtomId(struct: Struct, ci): number | void {
  if (ci.map === 'atoms') {
    return ci.id
  }

  if (ci.map === 'functionalGroups') {
    const group = struct.sgroups.get(ci.id)
    return group?.getAttAtomId(struct)
  }
}

export default TemplateTool
