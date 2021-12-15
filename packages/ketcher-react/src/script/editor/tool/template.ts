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
  FunctionalGroup
} from 'ketcher-core'
import { Editor } from '../Editor'
import { Result } from '../../ui/dialog/template/TemplateDialog'

import utils from '../shared/utils'

class TemplateTool {
  editor: Editor
  mode: any
  template: any
  findItems: Array<any>
  dragCtx: any

  constructor(editor: Editor, tmpl: Result) {
    this.editor = editor
    this.mode = tmpl.mode
    this.editor.selection(null)

    this.template = {
      aid: tmpl.aid || 0,
      bid: tmpl.bid || 0
    }

    const frag = tmpl.struct
    frag.rescale()

    const xy0 = new Vec2()
    frag.atoms.forEach(atom => {
      xy0.add_(atom.pp)
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
    if (bond && this.mode !== 'fg') {
      // template location sign against attachment bond
      this.template.sign = getSign(frag, bond, this.template.xy0)
      this.findItems.push('bonds')
    }

    const sgroup = frag.sgroups.size
    if (sgroup) {
      this.findItems.push('sgroups')
    }
  }

  mousedown(event) {
    const closestItem = this.editor.findItem(
      event,
      ['atoms', 'bonds', 'sgroups', 'functionalGroups'],
      null
    )
    const struct = this.editor.struct()
    const molecule = this.editor.render.ctab.molecule
    const atomResult: Array<any> = []
    const bondResult: Array<any> = []
    const sGroupResult: Array<any> = []
    const result: Array<any> = []

    if (
      closestItem &&
      struct.functionalGroups.size &&
      closestItem.map === 'functionalGroups' &&
      FunctionalGroup.isContractedFunctionalGroup(
        closestItem.id,
        struct.functionalGroups
      )
    ) {
      sGroupResult.push(closestItem.id)
    }
    if (
      closestItem &&
      struct.functionalGroups.size &&
      closestItem.map === 'atoms'
    ) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        struct.functionalGroups,
        closestItem.id
      )
      if (atomId !== null) atomResult.push(atomId)
    }
    if (
      closestItem &&
      struct.functionalGroups.size &&
      closestItem.map === 'bonds'
    ) {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        struct.functionalGroups,
        closestItem.id
      )
      if (bondId !== null) bondResult.push(bondId)
    }
    if (sGroupResult.length > 0) {
      for (let id of sGroupResult) {
        if (!result.includes(id)) result.push(id)
      }
    }
    if (atomResult.length > 0) {
      for (let id of atomResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          struct.functionalGroups,
          id
        )
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId)
        }
      }
    }
    if (bondResult.length > 0) {
      for (let id of bondResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          struct.functionalGroups,
          id
        )
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId)
        }
      }
    }
    if (result.length) {
      this.editor.event.removeFG.dispatch({ fgIds: result })
      return
    }

    const editor = this.editor

    this.editor.hover(null)

    this.dragCtx = {
      xy0: editor.render.page2obj(event),
      item: editor.findItem(event, this.findItems, null)
    }

    const dragCtx = this.dragCtx
    const ci = dragCtx.item

    if (!ci) {
      //  ci.type == 'Canvas'
      delete dragCtx.item
      return true
    }

    if (ci.map === 'bonds' && this.mode !== 'fg') {
      // calculate fragment center
      const xy0 = new Vec2()
      const bond = molecule.bonds.get(ci.id)!
      const frid = molecule.atoms.get(bond.begin)!.fragment
      const frIds = molecule.getFragmentIds(frid)
      let count = 0

      let loop
      if (bond.hb1) {
        loop = molecule.halfBonds.get(bond.hb1)!.loop
      }

      if (loop < 0 && bond.hb2) {
        loop = molecule.halfBonds.get(bond.hb2)!.loop
      }

      if (loop >= 0) {
        const loopHbs = molecule.loops.get(loop)!.hbs
        loopHbs.forEach(hb => {
          const halfBondBegin = molecule.halfBonds.get(hb)?.begin
          if (!halfBondBegin) return

          const hbbAtom = molecule.atoms.get(halfBondBegin)

          if (hbbAtom) {
            xy0.add_(hbbAtom.pp)
            count++
          }
        })
      } else {
        frIds.forEach(id => {
          const atomById = molecule.atoms.get(id)
          if (atomById) {
            xy0.add_(atomById.pp)
            count++
          }
        })
      }

      dragCtx.v0 = xy0.scaled(1 / count)

      const sign = getSign(molecule, bond, dragCtx.v0)

      // calculate default template flip
      dragCtx.sign1 = sign || 1
      dragCtx.sign2 = this.template.sign
    }

    return true
  }

  mousemove(event) {
    const restruct = this.editor.render.ctab

    if (!this.dragCtx) {
      this.editor.hover(this.editor.findItem(event, this.findItems, null))
      return true
    }

    const dragCtx = this.dragCtx
    const ci = dragCtx.item
    let pos0: any = null
    const pos1 = this.editor.render.page2obj(event)
    const struct = restruct.molecule

    /* moving when attached to bond */
    if (ci && ci.map === 'bonds' && this.mode !== 'fg') {
      const bond = struct.bonds.get(ci.id)
      let sign = getSign(struct, bond, pos1)

      if (dragCtx.sign1 * this.template.sign > 0) sign = -sign

      if (sign !== dragCtx.sign2 || !dragCtx.action) {
        if (dragCtx.action) dragCtx.action.perform(restruct) // undo previous action

        dragCtx.sign2 = sign
        // @ts-ignore
        let [action, pasteItems] = fromTemplateOnBondAction(
          restruct,
          this.template,
          ci.id,
          this.editor.event,
          dragCtx.sign1 * dragCtx.sign2 > 0,
          false
        )

        dragCtx.action = action
        this.editor.update(dragCtx.action, true)

        dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
        this.editor.hover(getHoverToFuse(dragCtx.mergeItems))
      }
      return true
    }
    /* end */

    let extraBond: any = null
    // calc initial pos and is extra bond needed
    if (!ci) {
      //  ci.type == 'Canvas'
      pos0 = dragCtx.xy0
    } else if (ci.map === 'atoms') {
      pos0 = struct.atoms.get(ci.id)?.pp
      extraBond = this.mode === 'fg' ? true : Vec2.dist(pos0, pos1) > 1
    }

    // calc angle
    let angle = utils.calcAngle(pos0, pos1)
    if (!event.ctrlKey) angle = utils.fracAngle(angle, 0)
    const degrees = utils.degrees(angle)
    this.editor.event.message.dispatch({ info: degrees + 'º' })

    // check if anything changed since last time
    if (
      dragCtx.hasOwnProperty('angle') &&
      dragCtx.angle === degrees &&
      (!dragCtx.hasOwnProperty('extra_bond') ||
        dragCtx.extra_bond === extraBond)
    )
      return true

    // undo previous action
    if (dragCtx.action) dragCtx.action.perform(restruct)

    // create new action
    dragCtx.angle = degrees
    let action = null
    let pasteItems

    if (!ci) {
      // ci.type == 'Canvas'
      ;[action, pasteItems] = fromTemplateOnCanvas(
        restruct,
        this.template,
        pos0,
        angle
      )
    } else if (ci.map === 'atoms') {
      ;[action, pasteItems] = fromTemplateOnAtom(
        restruct,
        this.template,
        ci.id,
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

    return true
  }

  mouseup(event) {
    const dragCtx = this.dragCtx
    if (!dragCtx) return true
    delete this.dragCtx

    const restruct = this.editor.render.ctab
    const struct = restruct.molecule
    const ci = dragCtx.item

    /* after moving around bond */
    if (dragCtx.action && ci && ci.map === 'bonds' && this.mode !== 'fg') {
      dragCtx.action.perform(restruct) // revert drag action
      fromTemplateOnBondAction(
        restruct,
        this.template,
        ci.id,
        this.editor.event,
        dragCtx.sign1 * dragCtx.sign2 > 0,
        true
        //@ts-ignore
      ).then(([action, pasteItems]) => {
        const mergeItems = getItemsToFuse(this.editor, pasteItems)
        action = fromItemsFuse(restruct, mergeItems).mergeWith(action)
        this.editor.update(action)
      })
      return true
    }
    /* end */

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
        let angle
        let extraBond

        if (degree && degree > 1) {
          // common case
          angle = null
          extraBond = true
        } else if (degree === 1) {
          // on chain end
          const atom = struct.atoms.get(ci.id)!
          const atomNeighbors = atom.neighbors[0]
          const neiId = struct.halfBonds.get(atomNeighbors)!.end
          const nei = struct.atoms.get(neiId)

          angle = event.ctrlKey
            ? utils.calcAngle(nei?.pp, atom?.pp)
            : utils.fracAngle(utils.calcAngle(nei?.pp, atom?.pp), 0)
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
        fromTemplateOnBondAction(
          restruct,
          this.template,
          ci.id,
          this.editor.event,
          dragCtx.sign1 * dragCtx.sign2 > 0,
          true
          //@ts-ignore
        ).then(([action, pasteItems]) => {
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

    if (!dragCtx.mergeItems && pasteItems && this.mode !== 'fg')
      dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems)
    dragCtx.action = dragCtx.action
      ? fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action)
      : fromItemsFuse(restruct, dragCtx.mergeItems)

    this.editor.hover(null)
    const completeAction = dragCtx.action
    if (completeAction && !completeAction.isDummy())
      this.editor.update(completeAction)
    this.editor.event.message.dispatch({
      info: false
    })

    return true
  }

  cancel(event) {
    this.mouseup(event)
  }
  mouseleave(event) {
    this.mouseup(event)
  }
}

function getSign(molecule, bond, v) {
  const begin = molecule.atoms.get(bond.begin).pp
  const end = molecule.atoms.get(bond.end).pp

  const sign = Vec2.cross(Vec2.diff(begin, end), Vec2.diff(v, end))

  if (sign > 0) return 1
  if (sign < 0) return -1
  return 0
}

export default TemplateTool
