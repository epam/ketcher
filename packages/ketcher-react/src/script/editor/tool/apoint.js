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

function APointTool(editor) {
  if (!(this instanceof APointTool)) return new APointTool(editor)

  this.editor = editor
  this.sgroups = editor.render.ctab.sgroups
  this.struct = editor.render.ctab
  this.molecule = editor.render.ctab.molecule
  this.functionalGroups = this.molecule.functionalGroups
  this.editor.selection(null)
}

APointTool.prototype.mousemove = function (event) {
  const struct = this.editor.render.ctab.molecule
  const ci = this.editor.findItem(event, ['atoms'])
  if (ci) {
    const atom = struct.atoms.get(ci.id)
    if (atom.label !== 'R#' && atom.rglabel === null) this.editor.hover(ci)
  } else {
    this.editor.hover(null)
  }
}

APointTool.prototype.click = function (event) {
  var editor = this.editor
  var struct = editor.render.ctab.molecule
  var ci = editor.findItem(event, ['atoms'])
  const atomResult = []
  const result = []
  if (ci && this.functionalGroups.size && ci.map === 'atoms') {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      this.functionalGroups,
      ci.id
    )
    if (atomId !== null) atomResult.push(atomId)
  }
  if (atomResult.length > 0) {
    for (const id of atomResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        this.functionalGroups,
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
    var atom = struct.atoms.get(ci.id)
    if (atom.label === 'R#' && atom.rglabel !== null) return
    var res = editor.event.elementEdit.dispatch({
      attpnt: atom.attpnt
    })
    Promise.resolve(res)
      .then((newatom) => {
        if (atom.attpnt !== newatom.attpnt) {
          var action = fromAtomsAttrs(editor.render.ctab, ci.id, newatom)
          editor.update(action)
        }
      })
      .catch(() => null) // w/o changes
    return true
  }
  return true
}

export default APointTool
