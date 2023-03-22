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
  fromPaste,
  fromSgroupDeletion,
  Action
} from 'ketcher-core'

import utils from '../shared/utils'
import Editor from '../Editor'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'
import { getMergeItems } from './helper/getMergeItems'

type MergeItems = Record<string, Map<unknown, unknown>> | null

/**
 * @prop `atomid`: Attachment atom ID
 * @prop `bondid`: Attachment bond ID
 * @prop `group`: For the Complex Template, it's folder name.
 *                For the Functional Group, the value is `"Functional Groups"`.
 *                For the Salt or Solvent, the value is `"Salts and Solvents"`
 * @prop `prerender`: Only for Complex Templates
 */
type TemplateToolOptionProps = {
  atomid?: string
  bondid?: string
  group: string
  prerender?: string
  name?: string // deprecated
  abbreviation?: string // deprecated
}

/**
 * @prop `props`: Simple Templates don't have it
 */
type TemplateToolOptions = {
  struct: Struct
  props?: TemplateToolOptionProps
}

/**
 * Template Catagories:
 * 1. Simple Templates, e.g. Benzene
 * 2. Complex Templates (which in Template Library), e.g. alpha-D-Allopyranose
 * 3. Functional Groups, e.g. Bn
 * 4. Salts and Solvents, e.g formic acid
 */
class TemplateTool {
  editor: Editor
  mode: any
  template: any
  findItems: Array<string>
  mergeItems: MergeItems = null
  dragCtx: any
  targetGroupsIds: Array<number> = []
  isSaltOrSolvent: boolean
  followAction: any

  constructor(editor: Editor, options: TemplateToolOptions) {
    this.editor = editor
    this.mode = getTemplateMode(options)
    this.editor.selection(null)
    this.isSaltOrSolvent = SGroup.isSaltOrSolvent(options.struct.name)

    this.template = {
      attachmentAtomId: options.props?.atomid
        ? parseInt(options.props.atomid)
        : 0,
      attachmentBondId: options.props?.bondid
        ? parseInt(options.props.bondid)
        : 0
    }

    const frag = options.struct
    frag.rescale()

    const xy0 = new Vec2()
    frag.atoms.forEach((atom) => {
      xy0.add_(atom.pp)
    })

    this.template.molecule = frag // preloaded struct
    this.findItems = []
    this.template.xy0 = xy0.scaled(1 / (frag.atoms.size || 1)) // template center

    const atom = frag.atoms.get(this.template.attachmentAtomId)
    if (atom) {
      this.template.angle0 = utils.calcAngle(atom.pp, this.template.xy0) // center tilt
      this.findItems.push('atoms')
    }

    const bond = frag.bonds.get(this.template.attachmentBondId)
    if (bond && this.mode !== 'fg') {
      // template location sign against attachment bond
      this.template.sign = getSign(frag, bond, this.template.xy0)
      this.findItems.push('bonds')
    }

    const sgroup = frag.sgroups.size
    if (sgroup) {
      this.findItems.push('functionalGroups')
    }
  }

  mousedown(event) {
    this.undoFollowAction()
    this.mouseDownFunctionalGroups(event)

    const dragCtxItem = getDragCtxItem(
      this.editor,
      event,
      this.mode,
      this.mergeItems,
      this.findItems
    )

    this.dragCtx = {
      xy0: this.editor.render.page2obj(event),
      item: dragCtxItem
    }

    this.editor.hover(null)

    // const dragCtx = this.dragCtx
    // const ci = dragCtx.item

    // if (!ci) {
    //   //  ci.type == 'Canvas'
    //   delete dragCtx.item
    //   return
    // }

    if (this.mode !== 'fg' && dragCtxItem?.map === 'bonds') {
      this.mouseDownBond()
    }
  }

  private mouseDownBond() {
    const closestItem = this.dragCtx.item
    const struct = this.editor.struct()

    // calculate fragment center
    const xy0 = new Vec2()
    const bond = struct.bonds.get(closestItem.id)
    const frid = struct.atoms.get(bond?.begin as number)?.fragment
    const frIds = struct.getFragmentIds(frid as number)
    let count = 0

    let loop = struct.halfBonds.get(bond?.hb1 as number)?.loop

    if (loop && loop < 0) {
      loop = struct.halfBonds.get(bond?.hb2 as number)?.loop
    }

    if (loop && loop >= 0) {
      const loopHbs = struct.loops.get(loop)?.hbs
      loopHbs?.forEach((hb) => {
        const halfBondBegin = struct.halfBonds.get(hb)?.begin

        if (halfBondBegin) {
          const hbbAtom = struct.atoms.get(halfBondBegin)

          if (hbbAtom) {
            xy0.add_(hbbAtom.pp) // eslint-disable-line no-underscore-dangle, max-len
            count++
          }
        }
      })
    } else {
      frIds.forEach((id) => {
        const atomById = struct.atoms.get(id)

        if (atomById) {
          xy0.add_(atomById.pp) // eslint-disable-line no-underscore-dangle
          count++
        }
      })
    }

    this.dragCtx.v0 = xy0.scaled(1 / count)

    const sign = getSign(struct, bond, this.dragCtx.v0)

    // calculate default template flip
    this.dragCtx.sign1 = sign || 1
    this.dragCtx.sign2 = this.template.sign
  }

  private mouseDownFunctionalGroups(event) {
    const closestItem = this.editor.findItem(event, [
      'atoms',
      'bonds',
      'sgroups',
      'functionalGroups'
    ])

    const struct = this.editor.struct()

    if (struct.functionalGroups.size) {
      this.targetGroupsIds = getGroupIdsFromItemArrays(struct, {
        ...(closestItem?.map === 'atoms' && { atoms: [closestItem.id] }),
        ...(closestItem?.map === 'bonds' && { bonds: [closestItem.id] })
      })

      if (
        closestItem?.map === 'functionalGroups' &&
        FunctionalGroup.isContractedFunctionalGroup(
          closestItem.id,
          struct.functionalGroups
        )
      ) {
        this.targetGroupsIds.push(closestItem.id)
      }
    }
  }

  mousemove(event) {
    if (!this.dragCtx) {
      this.mouseHover(event)
      return
    }

    if (this.isSaltOrSolvent) {
      delete this.dragCtx.item
      return
    }

    const ci = this.dragCtx.item
    if (this.mode !== 'fg' && ci?.map === 'bonds') {
      this.mouseMoveBond()
      return true
    }

    const isNothingChanged = this.calculateMouseMovePosition(event)
    if (isNothingChanged === true) {
      return true
    }
    const positionData = isNothingChanged
    const [targetPos, extraBond, angle, degrees] = positionData

    // undo previous action
    if (this.dragCtx.action) {
      this.dragCtx.action.perform(this.editor.render.ctab)
    }

    // create new action
    this.dragCtx.angle = degrees
    let action = null
    let pasteItems
    const struct = this.editor.struct()

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
      const atomId = getTargetAtomId(struct, ci)
      ;[action, pasteItems] = fromTemplateOnAtom(
        this.editor.render.ctab,
        this.template,
        atomId,
        angle,
        extraBond
      )
      this.dragCtx.extra_bond = extraBond
    }
    this.dragCtx.action = action

    this.editor.update(this.dragCtx.action, true)

    if (this.mode !== 'fg') {
      this.dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
      this.editor.hover(getHoverToFuse(this.dragCtx.mergeItems))
    }

    // TODO: refactor after #2195 comes into effect
    if (this.targetGroupsIds.length) this.targetGroupsIds.length = 0

    return true
  }

  private mouseMoveBond() {
    const closest = this.dragCtx.item
    const struct = this.editor.struct()
    const eventPos = this.editor.render.page2obj(event)

    const bond = struct.bonds.get(closest.id)
    let sign = getSign(struct, bond, eventPos)

    if (this.dragCtx.sign1 * this.template.sign > 0) {
      sign = -sign
    }

    if (sign !== this.dragCtx.sign2 || !this.dragCtx.action) {
      if (this.dragCtx.action) {
        this.dragCtx.action.perform(this.editor.render.ctab)
      } // undo previous action

      this.dragCtx.sign2 = sign
      const [action, pasteItems] = fromTemplateOnBondAction(
        this.editor.render.ctab,
        this.template,
        closest.id,
        this.editor.event,
        this.dragCtx.sign1 * this.dragCtx.sign2 > 0,
        false
      ) as Array<any>

      this.dragCtx.action = action
      this.editor.update(this.dragCtx.action, true)

      this.dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
      this.editor.hover(getHoverToFuse(this.dragCtx.mergeItems))
    }
  }

  /**
   * @returns `true`: no `targetPos` or nothing changed
   */
  private calculateMouseMovePosition(event) {
    let extraBond: boolean | null = null
    let targetPos: Vec2 | null | undefined = null
    const ci = this.dragCtx.item
    const struct = this.editor.struct()
    const eventPos = this.editor.render.page2obj(event)

    // calc initial pos and is extra bond needed
    if (!ci) {
      //  ci.type == 'Canvas'
      targetPos = this.dragCtx.xy0
    } else if (ci.map === 'atoms' || ci.map === 'functionalGroups') {
      const atomId = getTargetAtomId(struct, ci)

      if (atomId !== undefined) {
        const atom = struct.atoms.get(atomId)
        targetPos = atom?.pp

        if (targetPos) {
          extraBond =
            this.mode === 'fg' ? true : Vec2.dist(targetPos, eventPos) > 1
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
      this.dragCtx.hasOwnProperty('angle') &&
      this.dragCtx.angle === degrees &&
      // eslint-disable-next-line no-prototype-builtins
      (!this.dragCtx.hasOwnProperty('extra_bond') ||
        this.dragCtx.extra_bond === extraBond)
    ) {
      return true
    }

    return [targetPos, extraBond, angle, degrees] as const
  }

  private mouseHover(event: any) {
    if (this.followAction) {
      this.followAction.perform(this.editor.render.ctab)
    }

    const [followAction, pasteItems] = fromPaste(
      this.editor.render.ctab,
      this.template.molecule,
      this.editor.render.page2obj(event)
    )

    this.followAction = followAction
    this.editor.update(followAction, true, { extendCanvas: false })

    if (this.mode === 'fg') {
      const skip = getIgnoredGroupItem(this.editor.struct(), pasteItems)
      const ci = this.editor.findItem(event, this.findItems, skip)

      this.editor.hover(ci ?? null, null, event)
    } else {
      this.mergeItems = getMergeItems(this.editor, pasteItems)
      this.editor.hover(getHoverToFuse(this.mergeItems))
    }
  }

  mouseup(event) {
    if (this.targetGroupsIds.length && this.mode !== 'fg') {
      this.editor.event.removeFG.dispatch({ fgIds: this.targetGroupsIds })
      return
    }

    if (!this.dragCtx) {
      return true
    }

    const dragCtx = this.dragCtx
    delete this.dragCtx

    const restruct = this.editor.render.ctab
    // const struct = restruct.molecule
    let ci = dragCtx.item
    // const functionalGroups = struct.functionalGroups

    /* after moving around bond */
    if (dragCtx.action && ci?.map === 'bonds' && this.mode !== 'fg') {
      dragCtx.action.perform(restruct) // revert drag action
      this.mouseUpBond(dragCtx)
      return true
    }
    /* end */

    // let action
    // let pasteItems = null

    const isSaltAdded = this.mouseUpFunctionalGroup(ci, dragCtx)
    if (isSaltAdded === true) {
      return
    }
    const functionalGroupRemoveAction = isSaltAdded?.functionalGroupRemoveAction
    ci = isSaltAdded?.ci || ci

    const struct = restruct.molecule
    let action
    let pasteItems = null
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

        if (degree && degree >= 1 && this.isSaltOrSolvent) {
          addSaltsAndSolventsOnCanvasWithoutMerge(
            restruct,
            this.template,
            dragCtx,
            this.editor
          )
          return true
        }

        const angle = this.calculateMouseUpAngle(degree, struct, ci, event)

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
      } else if (ci.map === 'bonds' && this.mode !== 'fg') {
        this.mouseUpBond(dragCtx)
        return true
      }
    }

    this.editor.selection(null)

    if (!dragCtx.mergeItems && pasteItems && this.mode !== 'fg') {
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

  private calculateMouseUpAngle(degree: any, struct: any, ci: any, event: any) {
    let angle
    if (degree && degree > 1) {
      // common case
      angle = null
    } else if (degree === 1) {
      // on chain end
      const atom = struct.atoms.get(ci.id)
      const neiId = atom && struct.halfBonds.get(atom.neighbors[0])?.end
      const nei: any = (neiId || neiId === 0) && struct.atoms.get(neiId)

      angle = event.ctrlKey
        ? utils.calcAngle(nei?.pp, atom?.pp)
        : utils.fracAngle(utils.calcAngle(nei.pp, atom?.pp), null)
    } else {
      // on single atom
      angle = 0
    }
    return angle
  }

  /**
   * @returns `true`: salt or solvent is added without merge
   */
  private mouseUpFunctionalGroup(ci: any, dragCtx: any) {
    const struct = this.editor.struct()
    const functionalGroups = struct.functionalGroups

    if (
      ci?.map === 'functionalGroups' &&
      FunctionalGroup.isContractedFunctionalGroup(ci.id, functionalGroups) &&
      this.mode === 'fg' &&
      this.targetGroupsIds.length
    ) {
      const restruct = this.editor.render.ctab
      const functionalGroupToReplace = struct.sgroups.get(ci.id)!

      if (
        this.isSaltOrSolvent &&
        functionalGroupToReplace.isGroupAttached(struct)
      ) {
        addSaltsAndSolventsOnCanvasWithoutMerge(
          restruct,
          this.template,
          dragCtx,
          this.editor
        )
        return true
      }

      const attachmentAtomId = functionalGroupToReplace.getAttAtomId(struct)
      const atomsWithoutAttachmentAtom = SGroup.getAtoms(
        struct,
        functionalGroupToReplace
      ).filter((id) => id !== attachmentAtomId)

      const functionalGroupRemoveAction = new Action()
      functionalGroupRemoveAction.mergeWith(fromSgroupDeletion(restruct, ci.id))
      functionalGroupRemoveAction.mergeWith(
        fromFragmentDeletion(restruct, { atoms: atomsWithoutAttachmentAtom })
      )

      return {
        ci: { map: 'atoms', id: attachmentAtomId },
        functionalGroupRemoveAction
      }
    }

    return undefined
  }

  private mouseUpBond(dragCtx: any) {
    const restruct = this.editor.render.ctab
    const ci = dragCtx.item

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
  }

  cancel(e) {
    this.undoFollowAction()
    this.mouseup(e)
  }

  private undoFollowAction() {
    if (this.followAction) {
      this.followAction.perform(this.editor.render.ctab)
      delete this.followAction
    }
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

function getTemplateMode(options: any) {
  if (options.mode) return options.mode
  if (
    ['Functional Groups', 'Salts and Solvents'].includes(options.props?.group)
  )
    return 'fg'
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

function getIgnoredGroupItem(struct: Struct, pasteItems) {
  const groupId = struct.getGroupIdFromAtomId(pasteItems.atoms[0])
  return { map: 'functionalGroups', id: groupId }
}

function getDragCtxItem(
  editor: Editor,
  event,
  mode: string,
  mergeItems: MergeItems,
  findItems
): { map: string; id: number } | null {
  if (mode === 'fg') return editor.findItem(event, findItems)
  if (mergeItems?.atoms.size === 1 && mergeItems.bonds.size === 0) {
    // get ID of single dst (target) atom we are hovering over
    return { map: 'atoms', id: mergeItems.atoms.values().next().value }
  }
  return null
}

export default TemplateTool
