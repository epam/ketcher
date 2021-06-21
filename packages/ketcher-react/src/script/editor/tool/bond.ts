/****************************************************************************
 * Copyright 2020 EPAM Systems
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
import { Bond, Vec2 } from 'ketcher-core'
import utils from '../shared/utils'

import {
  fromBondAddition,
  bondChangingAction,
  fromBondsAttrs
} from '../actions/bond'
import { BondDelete } from '../operations'
import Editor from '../Editor'

function BondTool(editor: Editor, bondProps: any): void {
  // @ts-ignore
  if (!((this as any) instanceof BondTool)) {
    if (!editor.selection() || !editor.selection()?.bonds)
      return new BondTool(editor, bondProps)

    const action = fromBondsAttrs(
      editor.render.ctab,
      editor.selection()?.bonds || [],
      bondProps
    )
    editor.update(action)
    editor.selection(null)
  }
  // @ts-ignore
  this.editor = editor
  // @ts-ignore
  this.atomProps = { label: 'C' }
  // @ts-ignore
  this.bondProps = bondProps
}

BondTool.prototype.mousedown = function (event: Event): void {
  const rnd = this.editor.render
  this.editor.hover(null)
  this.editor.selection(null)
  const beginItem = this.editor.findItem(event, ['atoms', 'bonds'])
  if (beginItem) {
    this.dragCtx = {
      xy0: rnd.page2obj(event),
      beginItem: beginItem
    }
  } else {
    this.dragCtx = {
      xy0: rnd.page2obj(event)
    }
  }
}

BondTool.prototype.mousemove = function (event: Event): void {
  // eslint-disable-line max-statements
  const editor = this.editor
  const rnd = editor.render
  if ('dragCtx' in this) {
    const dragCtx = this.dragCtx

    const pos = rnd.page2obj(event)
    let angle = utils.calcAngle(dragCtx.xy0, pos)
    if (!event['ctrlKey']) angle = utils.fracAngle(angle)

    const degrees = utils.degrees(angle)
    this.editor.event.message.dispatch({ info: degrees + 'º' })

    if (!('beginItem' in dragCtx) || dragCtx.beginItem.map === 'atoms') {
      if ('action' in dragCtx) dragCtx.action.perform(rnd.ctab)
      let item1
      let item2
      let pos1
      let pos2
      if ('beginItem' in dragCtx && dragCtx.beginItem.map === 'atoms') {
        // first mousedown event intersect with any atom
        item1 = dragCtx.beginItem.id
        item2 = editor.findItem(event, ['atoms'], dragCtx.beginItem)
      } else {
        // first mousedown event intersect with any canvas
        item1 = this.atomProps
        pos1 = dragCtx.xy0
        item2 = editor.findItem(event, ['atoms'])
      }
      let dist = Number.MAX_VALUE
      if (item2 && item2.map === 'atoms') {
        // after mousedown events is appered, cursor is moved and then cursor intersects any atoms
        item2 = item2.id
      } else {
        item2 = this.atomProps
        const xy1 = rnd.page2obj(event)
        dist = Vec2.dist(dragCtx.xy0, xy1)
        if (pos1) {
          // rotation only, leght of bond = 1;
          pos2 = utils.calcNewAtomPos(pos1, xy1, event['ctrlKey'])
        } else {
          // first mousedown event intersect with any atom and
          // rotation only, leght of bond = 1;
          const atom = rnd.ctab.molecule.atoms.get(item1)
          pos1 = utils.calcNewAtomPos(atom.pp.get_xy0(), xy1, event['ctrlKey'])
        }
      }
      // don't rotate the bond if the distance between the start and end point is too small
      if (dist > 0.3) {
        const [action, , , bid] = fromBondAddition(
          rnd.ctab,
          this.bondProps,
          item1,
          item2,
          pos1,
          pos2
        )
        dragCtx.action = action
        dragCtx.bid = bid
      } else {
        delete dragCtx.action
        delete dragCtx.bid
      }
      this.editor.update(dragCtx.action, true)
      return
    }
  }
  this.editor.hover(this.editor.findItem(event, ['atoms', 'bonds']))
  return
}

BondTool.prototype.mouseup = function (event: Event): void {
  // eslint-disable-line max-statements
  if ('dragCtx' in this) {
    const dragCtx = this.dragCtx
    const rnd = this.editor.render
    const struct = rnd.ctab.molecule
    if ('action' in dragCtx) {
      const addedBondId = dragCtx.bid
      const addedBond = struct.bonds.get(addedBondId)

      const repeatingBonds: Array<number> = Array.from(
        struct.bonds
          .filter((_, bond) => {
            return (
              (bond.end === addedBond.end && bond.begin === addedBond.begin) ||
              (bond.end === addedBond.begin && bond.begin === addedBond.end)
            )
          })
          .keys()
      )

      if (repeatingBonds.length > 1) {
        new BondDelete(repeatingBonds[1]).perform(rnd.ctab)
        const bondProps = Object.assign({}, this.bondProps)
        const bond = struct.bonds.get(repeatingBonds[0])
        this.editor.update(
          bondChangingAction(rnd.ctab, repeatingBonds[0], bond, bondProps)
        )
        this.editor.update(dragCtx.action)
      } else this.editor.update(dragCtx.action)
    } else if (!('beginItem' in dragCtx)) {
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
    } else if (dragCtx.beginItem.map === 'atoms') {
      this.editor.update(
        fromBondAddition(
          rnd.ctab,
          this.bondProps,
          dragCtx.beginItem.id,
          undefined
        )[0]
      )
    } else if (dragCtx.beginItem.map === 'bonds') {
      const bondProps = Object.assign({}, this.bondProps)
      const bond = struct.bonds.get(dragCtx.beginItem.id)

      this.editor.update(
        bondChangingAction(rnd.ctab, dragCtx.beginItem.id, bond, bondProps)
      )
    }
    delete this.dragCtx
  }
  this.editor.event.message.dispatch({
    info: false
  })
  return
}

export default BondTool
