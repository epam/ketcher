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
  RGroup,
  fromRGroupAttrs,
  fromRGroupFragment,
  fromUpdateIfThen,
  FunctionalGroup
} from 'ketcher-core'
import Editor from '../Editor'

class RGroupFragmentTool {
  editor: Editor

  constructor(editor) {
    // TODO: check if it's a fragments already
    editor.selection(null)
    this.editor = editor
  }

  mousemove(event) {
    this.editor.hover(this.editor.findItem(event, ['frags', 'rgroups']))
  }

  click(event) {
    const struct = this.editor.render.ctab
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const editor = this.editor
    const ci = editor.findItem(event, ['frags', 'rgroups'])
    const ce = editor.findItem(event, ['atoms', 'bonds'])
    const atomResult: Array<number> = []
    const bondResult: Array<number> = []
    const result: Array<number> = []

    if (ce && functionalGroups && ce.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ce.id
      )

      if (atomId !== null) {
        atomResult.push(atomId)
      }
    }

    if (ce && functionalGroups && ce.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ce.id
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

    if (!ci) {
      return true
    }

    this.editor.hover(null)

    const label =
      ci.map === 'rgroups'
        ? ci.id
        : RGroup.findRGroupByFragment(molecule.rgroups, ci.id)

    const rg = Object.assign(
      { label },
      ci.map === 'frags' ? { fragId: ci.id } : molecule.rgroups.get(ci.id)
    )

    const res = editor.event.rgroupEdit.dispatch(rg)

    Promise.resolve(res)
      .then((newRg) => {
        let action

        if (ci.map !== 'rgroups') {
          const rgidOld = RGroup.findRGroupByFragment(
            struct.molecule.rgroups,
            ci.id
          )
          action = fromRGroupFragment(struct, newRg.label, ci.id).mergeWith(
            fromUpdateIfThen(struct, newRg.label, rgidOld)
          )
        } else {
          action = fromRGroupAttrs(struct, ci.id, newRg)
        }

        editor.update(action)
      })
      .catch(() => null) // w/o changes

    return true
  }

  cancel() {
    this.editor.hover(null)
  }
}

export default RGroupFragmentTool
