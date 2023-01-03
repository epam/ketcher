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
  Action,
  fromAtomsAttrs,
  fromBondsAttrs,
  fromTextDeletion,
  fromTextUpdating,
  FunctionalGroup
} from 'ketcher-core'

import LassoHelper from './helper/lasso'
import SGroupTool from './sgroup'
import { xor } from 'lodash/fp'
import { Editor } from '../Editor'
import {
  cancelSelecting,
  continueSelecting,
  finishSelecting,
  startSelecting
} from '../utils/selectItems'

class SelectTool {
  #mode: string
  #lassoHelper: LassoHelper
  editor: Editor
  dragCtx: any

  constructor(editor, mode) {
    this.editor = editor
    this.#mode = mode
    this.#lassoHelper = new LassoHelper(
      this.#mode === 'lasso' ? 0 : 1,
      editor,
      this.#mode === 'fragment'
    )
  }

  mousedown(event) {
    startSelecting(event, this, this.#lassoHelper)
  }

  mousemove(event) {
    continueSelecting(event, this, this.#lassoHelper)
  }

  mouseup(event) {
    finishSelecting(event, this, this.#lassoHelper)
  }

  dblclick(event) {
    const editor = this.editor
    const struct = editor.render.ctab
    const { molecule, sgroups } = struct
    const functionalGroups = molecule.functionalGroups
    const render = editor.render
    const closestItem = editor.findItem(
      event,
      ['atoms', 'bonds', 'sgroups', 'functionalGroups', 'sgroupData', 'texts'],
      null
    )

    const atomResult: any[] = []
    const bondResult: any[] = []
    const result: any[] = []
    if (closestItem && functionalGroups && closestItem.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        closestItem.id
      )
      const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a
      if (
        atomId !== null &&
        !FunctionalGroup.isAtomInContractedFunctionalGroup(
          // TODO: examine if this code is really needed, seems like its a hack
          atomFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      )
        atomResult.push(atomId)
    }
    if (closestItem && functionalGroups && closestItem.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        closestItem.id
      )
      const bondFromStruct = bondId !== null && struct.bonds.get(bondId)?.b
      if (
        bondId !== null &&
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          // TODO: examine if this code is really needed, seems like its a hack
          bondFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      )
        bondResult.push(bondId)
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
      editor.event.removeFG.dispatch({ fgIds: result })
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
    if (!closestItem) return true

    const selection = this.editor.selection()

    if (closestItem.map === 'atoms') {
      const action = new Action()
      const atom = molecule.atoms.get(closestItem.id)
      const ra = editor.event.elementEdit.dispatch(atom)
      if (selection?.atoms) {
        const selectionAtoms = selection.atoms
        Promise.resolve(ra)
          .then((newatom) => {
            // TODO: deep compare to not produce dummy, e.g.
            // atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)
            selectionAtoms.forEach((aid) => {
              action.mergeWith(fromAtomsAttrs(struct, aid, newatom, false))
            })
            editor.update(action)
          })
          .catch(() => null)
      }
    } else if (closestItem.map === 'bonds') {
      const bond = render.ctab.bonds.get(closestItem.id)?.b
      const rb = editor.event.bondEdit.dispatch(bond)

      if (selection?.bonds) {
        const action = new Action()
        const bondsSelection = selection.bonds
        Promise.resolve(rb)
          .then((newbond) => {
            bondsSelection.forEach((bid) => {
              action.mergeWith(fromBondsAttrs(struct, bid, newbond))
            })
            editor.update(action)
          })
          .catch(() => null) // w/o changes
      }
    } else if (
      (closestItem.map === 'sgroups' &&
        !FunctionalGroup.isFunctionalGroup(
          molecule.sgroups.get(closestItem.id)
        )) ||
      closestItem.map === 'sgroupData'
    ) {
      editor.selection(closestToSel(closestItem))
      SGroupTool.sgroupDialog(editor, closestItem.id, null)
    } else if (closestItem.map === 'texts') {
      editor.selection(closestToSel(closestItem))
      const text = molecule.texts.get(closestItem.id)
      const dialog = editor.event.elementEdit.dispatch({
        ...text,
        type: 'text'
      })

      dialog
        .then(({ content }) => {
          if (!content) {
            editor.update(fromTextDeletion(struct, closestItem.id))
          } else if (content !== text?.content) {
            editor.update(fromTextUpdating(struct, closestItem.id, content))
          }
        })
        .catch(() => null)
    }
    return true
  }

  mouseleave(_) {
    cancelSelecting(this, this.#lassoHelper)
  }
}

function closestToSel(closestItem) {
  const res = {}
  res[closestItem.map] = [closestItem.id]
  return res
}

// TODO: deep-merge?
export function selMerge(selection, add, reversible: boolean) {
  if (add) {
    Object.keys(add).forEach((item) => {
      if (!selection[item]) selection[item] = add[item].slice()
      else selection[item] = uniqArray(selection[item], add[item], reversible)
    })
  }
  return selection
}

function uniqArray(dest, add, reversible: boolean) {
  return add.reduce((_, item) => {
    if (reversible) dest = xor(dest, [item])
    else if (!dest.includes(item)) dest.push(item)
    return dest
  }, [])
}

export default SelectTool
