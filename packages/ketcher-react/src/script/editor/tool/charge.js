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

import { Elements, fromAtomsAttrs, FunctionalGroup } from 'ketcher-core'

function ChargeTool(editor, charge) {
  if (!(this instanceof ChargeTool)) return new ChargeTool(editor, charge)

  this.editor = editor
  this.editor.selection(null)
  this.charge = charge
  this.struct = editor.render.ctab
  this.sgroups = editor.render.ctab.sgroups
  this.molecule = editor.render.ctab.molecule
  this.functionalGroups = this.molecule.functionalGroups
}

ChargeTool.prototype.mousemove = function (event) {
  var rnd = this.editor.render
  var ci = this.editor.findItem(event, ['atoms'])
  var struct = rnd.ctab.molecule
  if (ci && ci.map === 'atoms' && Elements.get(struct.atoms.get(ci.id)?.label))
    this.editor.hover(ci)
  else this.editor.hover(null)
  return true
}

ChargeTool.prototype.click = function (event) {
  var editor = this.editor
  var rnd = editor.render
  var struct = rnd.ctab.molecule
  const ci = editor.findItem(event, ['atoms', 'bonds'])
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
  if (
    ci &&
    ci.map === 'atoms' &&
    Elements.get(struct.atoms.get(ci.id)?.label)
  ) {
    this.editor.hover(null)
    this.editor.update(
      fromAtomsAttrs(rnd.ctab, ci.id, {
        charge: struct.atoms.get(ci.id).charge + this.charge
      })
    )
  }
  return true
}

export default ChargeTool
