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
  fromChain,
  fromItemsFuse,
  getHoverToFuse,
  getItemsToFuse,
  FunctionalGroup
} from 'ketcher-core'

import { atomLongtapEvent } from './atom'
import utils from '../shared/utils'
import Editor from '../Editor'

class ChainTool {
  editor: Editor
  dragCtx: any

  constructor(editor) {
    this.editor = editor
    this.editor.selection(null)
  }

  mousedown(event) {
    if (this.dragCtx) return
    const struct = this.editor.render.ctab
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const rnd = this.editor.render
    const ci = this.editor.findItem(event, ['atoms', 'bonds'])
    const atomResult: Array<number> = []
    const bondResult: Array<number> = []
    const result: Array<number> = []

    if (ci && functionalGroups.size && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id
      )

      if (atomId !== null) {
        atomResult.push(atomId)
      }
    }

    if (ci && functionalGroups.size && ci.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id
      )

      if (bondId !== null) {
        bondResult.push(bondId)
      }
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

    this.editor.hover(null)
    this.dragCtx = {
      xy0: rnd.page2obj(event),
      item: ci
    }

    if (ci && ci.map === 'atoms') {
      this.editor.selection({ atoms: [ci.id] }) // for change atom
      // this event has to be stopped in others events by `tool.dragCtx.stopTapping()`
      atomLongtapEvent(this, rnd)
    }

    if (!this.dragCtx.item)
      // ci.type == 'Canvas'
      delete this.dragCtx.item
    return true
  }

  mousemove(event) {
    const editor = this.editor
    const restruct = editor.render.ctab
    const dragCtx = this.dragCtx

    editor.hover(this.editor.findItem(event, ['atoms', 'bonds']), null, event)
    if (!dragCtx) {
      return true
    }

    if (dragCtx && dragCtx.stopTapping) {
      dragCtx.stopTapping()
    }

    editor.selection(null)

    if (!dragCtx.item || dragCtx.item.map === 'atoms') {
      if (dragCtx.action) {
        dragCtx.action.perform(restruct)
      }

      const atoms = restruct.molecule.atoms

      const pos0 = dragCtx.item ? atoms.get(dragCtx.item.id)?.pp : dragCtx.xy0

      const pos1 = editor.render.page2obj(event)
      const sectCount = Math.ceil(Vec2.diff(pos1, pos0).length())

      const angle = event.ctrlKey
        ? utils.calcAngle(pos0, pos1)
        : utils.fracAngle(pos0, pos1)

      const [action, newItems] = fromChain(
        restruct,
        pos0,
        angle,
        sectCount,
        dragCtx.item ? dragCtx.item.id : null
      )

      editor.event.message.dispatch({
        info: sectCount + ' sectors'
      })

      dragCtx.action = action
      editor.update(dragCtx.action, true)

      dragCtx.mergeItems = getItemsToFuse(editor, newItems)
      editor.hover(getHoverToFuse(dragCtx.mergeItems))

      return true
    }

    return true
  }

  mouseup() {
    const struct = this.editor.render.ctab
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    let atom
    const atomResult: Array<number> = []
    const result: Array<number> = []

    if (this.dragCtx && this.dragCtx.mergeItems && functionalGroups.size) {
      atom = this.dragCtx.mergeItems.atoms.values().next().value
    }
    if (atom) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        atom
      )

      if (atomId !== null) {
        atomResult.push(atomId)
      }
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
    }
    const dragCtx = this.dragCtx

    if (!dragCtx) {
      return true
    }

    delete this.dragCtx

    const editor = this.editor

    if (dragCtx.stopTapping) {
      dragCtx.stopTapping()
    }

    if (!dragCtx.action && dragCtx.item && dragCtx.item.map === 'bonds') {
      const bond = molecule.bonds.get(dragCtx.item.id) as Bond

      dragCtx.action = bondChangingAction(struct, dragCtx.item.id, bond, {
        type: Bond.PATTERN.TYPE.SINGLE,
        stereo: Bond.PATTERN.STEREO.NONE
      })
    } else {
      dragCtx.action = dragCtx.action
        ? fromItemsFuse(struct, dragCtx.mergeItems).mergeWith(dragCtx.action)
        : fromItemsFuse(struct, dragCtx.mergeItems)
    }

    editor.selection(null)
    editor.hover(null)

    if (dragCtx.action) {
      editor.update(dragCtx.action)
    }

    editor.event.message.dispatch({
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

export default ChainTool
