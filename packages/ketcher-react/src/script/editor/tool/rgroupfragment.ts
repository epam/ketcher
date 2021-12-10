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

import { Editor } from '../Editor'

class RGroupFragmentTool {
  editor: Editor

  constructor(editor: Editor) {
    this.editor = editor
  }

  mousemove(event) {
    this.editor.hover(this.editor.findItem(event, ['frags', 'rgroups'], null))
  }

  click(event) {
    const editor = this.editor
    const molecule = editor.render.ctab.molecule
    const functionalGroups = molecule.functionalGroups
    const struct = editor.render.ctab.molecule
    const ci = editor.findItem(event, ['frags', 'rgroups'], null)
    const ce = editor.findItem(event, ['atoms', 'bonds'], null)
    const atomResult: Array<any> = []
    const bondResult: Array<any> = []
    const result: Array<any> = []
    if (ce && functionalGroups && ce.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ce.id
      )
      if (atomId !== null) atomResult.push(atomId)
    }
    if (ce && functionalGroups && ce.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ce.id
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

    if (!ci) return true

    this.editor.hover(null)

    const label =
      ci.map === 'rgroups'
        ? ci.id
        : RGroup.findRGroupByFragment(struct.rgroups, ci.id)

    const rg = Object.assign(
      { label },
      ci.map === 'frags' ? { fragId: ci.id } : struct.rgroups.get(ci.id)
    )

    const res = editor.event.rgroupEdit.dispatch(rg)

    Promise.resolve(res)
      .then((newRg) => {
        const restruct = editor.render.ctab

        let action: any = null
        if (ci.map !== 'rgroups') {
          const rgidOld = RGroup.findRGroupByFragment(
            restruct.molecule.rgroups,
            ci.id
          )

          action = fromRGroupFragment(restruct, newRg.label, ci.id).mergeWith(
            fromUpdateIfThen(restruct, newRg.label, rgidOld)
          )
        } else {
          action = fromRGroupAttrs(restruct, ci.id, newRg)
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
