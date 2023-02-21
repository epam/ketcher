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
  Vec2,
  bondChangingAction,
  fromBondAddition,
  fromBondsAttrs,
  FunctionalGroup,
  SGroup,
  fromOneBondDeletion
} from 'ketcher-core'

import utils from '../shared/utils'
import Editor from '../Editor'

class BondTool {
  editor: Editor
  atomProps: { label: string }
  bondProps: any
  dragCtx: any
  isNotActiveTool: boolean | undefined

  constructor(editor, bondProps) {
    this.editor = editor
    this.atomProps = { label: 'C' }
    this.bondProps = bondProps
    if (editor.selection() && editor.selection()?.bonds) {
      const action = fromBondsAttrs(
        editor.render.ctab,
        editor.selection().bonds,
        bondProps
      )
      editor.update(action)
      editor.selection(null)
      this.isNotActiveTool = true
    }
  }

  mousedown(event) {
    if (this.dragCtx) return
    const struct = this.editor.render.ctab
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const ci = this.editor.findItem(event, ['atoms', 'bonds'])
    const atomResult: Array<number> = []
    const bondResult: Array<number> = []
    const result: Array<number> = []
    if (ci && functionalGroups.size && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id
      )
      if (atomId !== null) atomResult.push(atomId)
    }
    if (ci && functionalGroups.size && ci.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id
      )
      if (bondId !== null) bondResult.push(bondId)
    }
    if (atomResult.length > 0) {
      for (const id of atomResult) {
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
    } else if (bondResult.length > 0) {
      for (const id of bondResult) {
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
    const rnd = this.editor.render
    this.editor.hover(null)
    this.editor.selection(null)
    this.dragCtx = {
      xy0: rnd.page2obj(event),
      item: this.editor.findItem(event, ['atoms', 'bonds'])
    }
    if (!this.dragCtx.item)
      // ci.type == 'Canvas'
      delete this.dragCtx.item
    return true
  }

  mousemove(event) {
    const struct = this.editor.render.ctab
    const sgroups = struct.sgroups
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const editor = this.editor
    const rnd = editor.render
    if ('dragCtx' in this) {
      const dragCtx = this.dragCtx

      const pos = rnd.page2obj(event)
      let angle = utils.calcAngle(dragCtx.xy0, pos)
      if (!event.ctrlKey) angle = utils.fracAngle(angle, null)

      const degrees = utils.degrees(angle)
      this.editor.event.message.dispatch({ info: degrees + 'º' })

      if (!('item' in dragCtx) || dragCtx.item.map === 'atoms') {
        if ('action' in dragCtx) dragCtx.action.perform(rnd.ctab)
        let beginAtom
        let endAtom
        let beginPos
        let endPos
        const extraNeighbour: Array<number> = []
        if ('item' in dragCtx && dragCtx.item.map === 'atoms') {
          // first mousedown event intersect with any atom
          beginAtom = dragCtx.item.id
          endAtom = editor.findItem(event, ['atoms'], dragCtx.item)
          const closestSGroup = editor.findItem(event, ['functionalGroups'])
          if (
            closestSGroup &&
            FunctionalGroup.isContractedFunctionalGroup(
              closestSGroup.id,
              functionalGroups
            )
          ) {
            const sGroup = sgroups.get(closestSGroup.id)
            const sGroupAtoms = SGroup.getAtoms(molecule, sGroup?.item)
            endAtom = {
              id: sGroupAtoms[0],
              map: 'atoms'
            }
          }
          const fGroupId =
            endAtom &&
            FunctionalGroup.findFunctionalGroupByAtom(
              functionalGroups,
              endAtom.id
            )
          const fGroup = typeof fGroupId === 'number' && sgroups.get(fGroupId)
          const fGroupAtoms =
            fGroup && (SGroup.getAtoms(molecule, fGroup.item) as any)
          if (endAtom && fGroup && endAtom.id !== fGroupAtoms?.[0]) {
            this.editor.event.removeFG.dispatch({ fgIds: [fGroupId] })
            endAtom = null
          }
          if (endAtom && fGroup && endAtom.id === fGroupAtoms?.[0]) {
            const atomNeighbours = molecule.atomGetNeighbors(endAtom.id)
            atomNeighbours?.forEach((nei) => {
              !fGroupAtoms?.includes(nei.aid) &&
                !extraNeighbour.includes(nei.aid) &&
                extraNeighbour.push(nei.aid)
            })
          }
          if (extraNeighbour.length >= 1) {
            endAtom = null
          }
        } else {
          // first mousedown event intersect with any canvas
          beginAtom = this.atomProps
          beginPos = dragCtx.xy0
          endAtom = editor.findItem(event, ['atoms'])
          const atomResult: Array<number> = []
          const result: Array<number> = []
          if (
            endAtom &&
            endAtom.map === 'atoms' &&
            functionalGroups.size &&
            this.dragCtx
          ) {
            const atomId = FunctionalGroup.atomsInFunctionalGroup(
              functionalGroups,
              endAtom.id
            )
            if (atomId !== null) atomResult.push(atomId)
          }
          if (atomResult.length > 0) {
            for (const id of atomResult) {
              const fgId = FunctionalGroup.findFunctionalGroupByAtom(
                functionalGroups,
                id
              )
              fgId !== null && !result.includes(fgId) && result.push(fgId)
            }
          }
          if (result.length > 0) {
            this.editor.event.removeFG.dispatch({ fgIds: result })
            delete this.dragCtx
            return
          }
        }
        let dist = Number.MAX_VALUE
        if (endAtom?.map === 'atoms') {
          // after mousedown events is appered, cursor is moved and then cursor intersects any atoms
          endAtom = endAtom.id
        } else {
          endAtom = this.atomProps
          const xy1 = rnd.page2obj(event)
          dist = Vec2.dist(dragCtx.xy0, xy1)
          if (beginPos) {
            // rotation only, leght of bond = 1;
            endPos = utils.calcNewAtomPos(beginPos, xy1, event.ctrlKey)
          } else {
            // first mousedown event intersect with any atom and
            // rotation only, leght of bond = 1;
            const atom = rnd.ctab.molecule.atoms.get(beginAtom)
            beginPos = utils.calcNewAtomPos(
              atom?.pp.get_xy0(),
              xy1,
              event.ctrlKey
            )
          }
        }
        // don't rotate the bond if the distance between the start and end point is too small
        if (dist > 0.3) {
          const [existingBondId, bond] = this.getExistingBond(
            molecule,
            beginAtom,
            endAtom
          )
          dragCtx.action = fromBondAddition(
            rnd.ctab,
            this.bondProps,
            beginAtom,
            endAtom,
            beginPos,
            endPos
          )[0]
          if (existingBondId) {
            this.dragCtx.existedBond = bond
            this.dragCtx.action.mergeWith(
              fromOneBondDeletion(rnd.ctab, existingBondId)
            )
          }
        } else {
          delete dragCtx.action
        }
        this.restoreBondWhenHoveringOnCanvas(event)
        this.editor.update(dragCtx.action, true)
        return true
      }
    }
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds']),
      null,
      event
    )
    return true
  }

  mouseup(event) {
    if ('dragCtx' in this) {
      const dragCtx = this.dragCtx
      const rnd = this.editor.render
      const struct = rnd.ctab.molecule
      if ('action' in dragCtx) {
        this.restoreBondWhenHoveringOnCanvas(event)
        this.editor.update(dragCtx.action)
      } else if (!('item' in dragCtx)) {
        const xy = rnd.page2obj(event)
        const v = new Vec2(1.0 / 2, 0).rotate(
          this.bondProps.type === Bond.PATTERN.TYPE.SINGLE ? -Math.PI / 6 : 0
        )
        const bondAddition = fromBondAddition(
          rnd.ctab,
          this.bondProps,
          { label: 'C' },
          { label: 'C' },
          Vec2.diff(xy, v),
          Vec2.sum(xy, v)
        )

        this.editor.update(bondAddition[0])
      } else if (dragCtx.item.map === 'atoms') {
        // click on atom
        this.editor.update(
          fromBondAddition(
            rnd.ctab,
            this.bondProps,
            dragCtx.item.id,
            undefined
          )[0]
        )
        delete this.dragCtx.existedBond
      } else if (dragCtx.item.map === 'bonds') {
        const bondProps = Object.assign({}, this.bondProps)
        const bond = struct.bonds.get(dragCtx.item.id) as Bond

        this.editor.update(
          bondChangingAction(rnd.ctab, dragCtx.item.id, bond, bondProps)
        )
      }
      delete this.dragCtx
    }
    this.editor.event.message.dispatch({
      info: false
    })
    return true
  }

  /*
    If we want to add a new bond, we need to delete previous one
    But we can change our mind, then deleted bond needs to be restored
  */
  restoreBondWhenHoveringOnCanvas(event) {
    if (!this.dragCtx.existedBond) {
      return
    }
    const isHoveringOverAtom = this.editor.findItem(event, ['atoms'])
    if (!isHoveringOverAtom) {
      const { begin, end } = this.dragCtx.existedBond
      const bondEnd = this.dragCtx.item.id === begin ? end : begin
      this.dragCtx.action.mergeWith(
        fromBondAddition(
          this.editor.render.ctab,
          this.dragCtx.existedBond,
          this.dragCtx.item.id,
          bondEnd
        )[0]
      )
      delete this.dragCtx.existedBond
    }
  }

  getExistingBond(struct, begin, end) {
    for (const [bondId, bond] of struct.bonds.entries()) {
      const alreadyHasBondInOtherDirection =
        (bond.begin === end && bond.end === begin) ||
        (bond.begin === begin && bond.end === end)
      if (alreadyHasBondInOtherDirection) {
        return [bondId, bond]
      }
    }
    return [null, null]
  }
}

export default BondTool
