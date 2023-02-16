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
  fromFragmentDeletion
} from 'ketcher-core'

import utils from '../shared/utils'
import Editor from '../Editor'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'

class TemplateTool {
  editor: Editor
  mode: any
  template: any
  findItems: Array<string>
  dragCtx: any
  targetGroupsIds: Array<number> = []

  constructor(editor, tmpl) {
    this.editor = editor
    this.mode = getTemplateMode(tmpl)
    this.editor.selection(null)

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
    this.findItems.push('functionalGroups')

    const atom = frag.atoms.get(this.template.aid)
    if (atom) {
      this.template.angle0 = utils.calcAngle(atom.pp, this.template.xy0) // center tilt
      this.findItems.push('atoms')
    }

    const bond = frag.bonds.get(this.template.bid)
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
    const closestItem = this.editor.findItem(event, [
      'atoms',
      'bonds',
      'sgroups',
      'functionalGroups'
    ])
    const ctab = this.editor.render.ctab
    const struct = ctab.molecule

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

    this.editor.hover(null)

    this.dragCtx = {
      xy0: this.editor.render.page2obj(event),
      item: this.editor.findItem(event, this.findItems)
    }

    const dragCtx = this.dragCtx
    const ci = dragCtx.item

    if (!ci) {
      //  ci.type == 'Canvas'
      delete dragCtx.item
      return
    }

    if (ci.map === 'bonds' && this.mode !== 'fg') {
      // calculate fragment center
      const xy0 = new Vec2()
      const bond = struct.bonds.get(ci.id)
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

      dragCtx.v0 = xy0.scaled(1 / count)

      const sign = getSign(struct, bond, dragCtx.v0)

      // calculate default template flip
      dragCtx.sign1 = sign || 1
      dragCtx.sign2 = this.template.sign
    }
  }

  mousemove(event) {
    const restruct = this.editor.render.ctab

    if (!this.dragCtx) {
      this.editor.hover(
        this.editor.findItem(event, this.findItems),
        null,
        event
      )
      return true
    }

    const dragCtx = this.dragCtx
    const ci = dragCtx.item
    let pos0: Vec2 | null | undefined = null
    const pos1 = this.editor.render.page2obj(event)
    const struct = restruct.molecule

    /* moving when attached to bond */
    if (ci && ci.map === 'bonds' && this.mode !== 'fg') {
      const bond = struct.bonds.get(ci.id)
      let sign = getSign(struct, bond, pos1)

      if (dragCtx.sign1 * this.template.sign > 0) {
        sign = -sign
      }

      if (sign !== dragCtx.sign2 || !dragCtx.action) {
        if (dragCtx.action) {
          dragCtx.action.perform(restruct)
        } // undo previous action

        dragCtx.sign2 = sign
        const [action, pasteItems] = fromTemplateOnBondAction(
          restruct,
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
      pos0 = dragCtx.xy0
    } else if (ci.map === 'atoms' || ci.map === 'functionalGroups') {
      const atomId = getTargetAtomId(struct, ci)

      if (atomId !== undefined) {
        const atom = struct.atoms.get(atomId)
        pos0 = atom?.pp

        if (pos0) {
          extraBond = this.mode === 'fg' ? true : Vec2.dist(pos0, pos1) > 1
        }
      }
    }

    if (!pos0) {
      return true
    }

    // calc angle
    let angle = utils.calcAngle(pos0, pos1)

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
      dragCtx.action.perform(restruct)
    }

    // create new action
    dragCtx.angle = degrees
    let action = null
    let pasteItems

    if (ci?.map === 'atoms' || ci?.map === 'functionalGroups') {
      const atomId = getTargetAtomId(struct, ci)

      ;[action, pasteItems] = fromTemplateOnAtom(
        restruct,
        this.template,
        atomId,
        angle,
        extraBond
      )
      dragCtx.extra_bond = extraBond
    }
    dragCtx.action = action

    this.editor.update(dragCtx.action, true)

    if (this.mode !== 'fg') {
      dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
      this.editor.hover(getHoverToFuse(dragCtx.mergeItems))
    }

    // TODO: refactor after #2195 comes into effect
    if (this.targetGroupsIds.length) this.targetGroupsIds.length = 0

    return true
  }

  mouseup(event) {
    const dragCtx = this.dragCtx

    if (this.targetGroupsIds.length) {
      this.editor.event.removeFG.dispatch({ fgIds: this.targetGroupsIds })
      return
    }

    if (!dragCtx) {
      return true
    }

    delete this.dragCtx

    const restruct = this.editor.render.ctab
    const sgroups = restruct.sgroups
    const struct = restruct.molecule
    const ci = dragCtx.item
    const functionalGroups = struct.functionalGroups

    /* after moving around bond */
    if (dragCtx.action && ci && ci.map === 'bonds' && this.mode !== 'fg') {
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

    let action
    let pasteItems = null
    let isFunctionalGroupReplace = false

    if (SGroup.isSaltOrSolvent(this.template.molecule.name)) {
      addSaltsAndSolventsOnCanvasWithoutMerge(
        restruct,
        this.template,
        dragCtx,
        this.editor
      )
      return true
    } else if (
      ci?.map === 'functionalGroups' &&
      FunctionalGroup.isContractedFunctionalGroup(ci.id, functionalGroups) &&
      this.mode === 'fg'
    ) {
      const sGroup = sgroups.get(ci.id)
      this.editor.update(
        fromFragmentDeletion(this.editor.render.ctab, {
          atoms: [...SGroup.getAtoms(struct, sGroup?.item)],
          bonds: [...SGroup.getBonds(struct, sGroup?.item)]
        })
      )
      isFunctionalGroupReplace = true
    }

    if (!dragCtx.action) {
      if (!ci || isFunctionalGroupReplace) {
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
        let extraBond

        if (degree && degree > 1) {
          // common case
          angle = null
          extraBond = true
        } else if (degree === 1) {
          // on chain end
          const atom = struct.atoms.get(ci.id)
          const neiId = atom && struct.halfBonds.get(atom.neighbors[0])?.end
          const nei: any = (neiId || neiId === 0) && struct.atoms.get(neiId)

          angle = event.ctrlKey
            ? utils.calcAngle(nei?.pp, atom?.pp)
            : utils.fracAngle(utils.calcAngle(nei.pp, atom?.pp), null)
          extraBond = false
        } else {
          // on single atom
          angle = 0
          extraBond = false
        }

        ;[action, pasteItems] = fromTemplateOnAtom(
          restruct,
          this.template,
          ci.id,
          angle,
          extraBond
        )
        dragCtx.action = action
      } else if (ci.map === 'bonds' && this.mode !== 'fg') {
        const promise = fromTemplateOnBondAction(
          restruct,
          this.template,
          ci.id,
          this.editor.event,
          dragCtx.sign1 * dragCtx.sign2 > 0,
          true
        ) as Promise<any>

        promise.then(([action, pasteItems]) => {
          if (this.mode !== 'fg') {
            const mergeItems = getItemsToFuse(this.editor, pasteItems)
            action = fromItemsFuse(restruct, mergeItems).mergeWith(action)
            this.editor.update(action)
          }
        })

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
    this.editor.event.showInfo.dispatch(null)
    this.editor.event.message.dispatch({
      info: false
    })
    this.editor.hover(this.editor.findItem(event, this.findItems), null, event)

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
  if (tmpl.mode) return tmpl.mode
  if (['Functional Groups', 'Salts and Solvents'].includes(tmpl.props?.group))
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

export default TemplateTool
