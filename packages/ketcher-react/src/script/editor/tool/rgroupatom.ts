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
  Atom,
  fromAtomAddition,
  fromAtomsAttrs,
  FunctionalGroup
} from 'ketcher-core'

import { Editor } from '../Editor'

class RGroupAtomTool {
  editor: Editor

  constructor(editor: Editor) {
    this.editor = editor
  }

  mousemove(event) {
    const struct = this.editor.render.ctab.molecule
    const ci = this.editor.findItem(event, ['atoms'], null)
    if (ci) {
      const atom = struct.atoms.get(ci.id)
      if (atom?.attpnt === null) this.editor.hover(ci)
    } else {
      this.editor.hover(null)
    }
  }

  click(event) {
    const rnd = this.editor.render
    const functionalGroups = rnd.ctab.molecule.functionalGroups
    const ci = this.editor.findItem(event, ['atoms'], null)
    const atomResult: Array<any> = []
    const result: Array<any> = []
    if (ci && functionalGroups && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id
      )
      if (atomId !== null) atomResult.push(atomId)
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

    if (!ci) {
      //  ci.type == 'Canvas'
      this.editor.hover(null)
      propsDialog(this.editor, null, rnd.page2obj(event))
      return true
    } else if (ci.map === 'atoms') {
      this.editor.hover(null)
      const struct = this.editor.render.ctab.molecule
      const atom = struct.atoms.get(ci.id)
      if (atom?.attpnt !== null) return
      propsDialog(this.editor, ci.id, undefined)
      return true
    }
    return true
  }
}

function propsDialog(editor, id, pos) {
  const struct = editor.render.ctab.molecule
  const atom = id || id === 0 ? struct.atoms.get(id) : null
  const rglabel = atom ? atom.rglabel : 0
  const label = atom ? atom.label : 'R#'

  const res = editor.event.elementEdit.dispatch({
    label: 'R#',
    rglabel,
    fragId: atom ? atom.fragment : null
  })

  Promise.resolve(res)
    .then((elem) => {
      // TODO review: using Atom.attrlist as a source of default property values
      elem = Object.assign({}, Atom.attrlist, elem)

      if (!id && id !== 0 && elem.rglabel) {
        editor.update(fromAtomAddition(editor.render.ctab, pos, elem))
      } else if (rglabel !== elem.rglabel) {
        elem.aam = atom.aam // WTF??
        elem.attpnt = atom.attpnt

        if (!elem.rglabel && label !== 'R#') elem.label = label

        editor.update(fromAtomsAttrs(editor.render.ctab, id, elem, false))
      }
    })
    .catch(() => null) // w/o changes
}

export default RGroupAtomTool
