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

import { fromAtomsAttrs, FunctionalGroup } from 'ketcher-core'
import Editor from '../Editor'

class APointTool {
  editor: Editor

  constructor(editor) {
    this.editor = editor
    this.editor.selection(null)
  }

  mousemove(event) {
    const struct = this.editor.render.ctab.molecule
    const ci = this.editor.findItem(event, ['atoms'], null)
    if (ci) {
      const atom = struct.atoms.get(ci.id)
      if (atom?.label !== 'R#' && atom?.rglabel === null) this.editor.hover(ci)
    } else {
      this.editor.hover(null)
    }
  }

  click(event) {
    const editor = this.editor
    const struct = editor.render.ctab.molecule
    const functionalGroups = struct.functionalGroups
    const ci = editor.findItem(event, ['atoms'], null)
    const atomResult: Array<any> = []
    const result: Array<any> = []
    if (ci && functionalGroups.size && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id
      )
      if (atomId !== null) atomResult.push(atomId)
    }
    if (atomResult.length > 0) {
      for (let id of atomResult) {
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

    if (ci && ci.map === 'atoms') {
      this.editor.hover(null)
      const atom = struct.atoms.get(ci.id)
      if (atom?.label === 'R#' && atom.rglabel !== null) return
      const res = editor.event.elementEdit.dispatch({
        attpnt: atom?.attpnt
      })
      Promise.resolve(res)
        .then(newatom => {
          if (atom?.attpnt !== newatom.attpnt) {
            const action = fromAtomsAttrs(
              editor.render.ctab,
              ci.id,
              newatom,
              null
            )
            editor.update(action)
          }
        })
        .catch(() => null) // w/o changes
      return true
    }
    return true
  }
}

export default APointTool
