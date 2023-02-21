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

import { Action, Scale, fromAtomsAttrs } from 'ketcher-core'
import Editor from '../Editor'

class ReactionMapTool {
  editor: Editor
  rcs: any
  dragCtx: any
  line: any

  constructor(editor) {
    this.editor = editor
    this.editor.selection(null)
  }

  mousedown(event) {
    const rnd = this.editor.render
    this.rcs = rnd.ctab.molecule.getComponents()

    const closestItem = this.editor.findItem(event, ['atoms'])

    if (closestItem?.map === 'atoms') {
      this.editor.hover(null)
      this.dragCtx = {
        item: closestItem,
        xy0: rnd.page2obj(event)
      }
    }
  }

  mousemove(event) {
    const editor = this.editor
    const rnd = editor.render

    if ('dragCtx' in this) {
      const closestItem = this.editor.findItem(
        event,
        ['atoms'],
        this.dragCtx.item
      )
      const atoms = rnd.ctab.molecule.atoms

      if (closestItem?.map === 'atoms') {
        editor.hover(closestItem)
        this.updateLine(
          atoms.get(this.dragCtx.item.id)?.pp,
          atoms.get(closestItem.id)?.pp
        )
      } else {
        editor.hover(null)
        this.updateLine(
          atoms.get(this.dragCtx.item.id)?.pp,
          rnd.page2obj(event)
        )
      }
    } else {
      editor.hover(editor.findItem(event, ['atoms']), null, event)
    }
  }

  updateLine(p1, p2) {
    if (this.line) {
      this.line.remove()
      this.line = null
    }

    if (p1 && p2) {
      const rnd = this.editor.render
      this.line = rnd.selectionLine(
        Scale.obj2scaled(p1, rnd.options).add(rnd.options.offset),
        Scale.obj2scaled(p2, rnd.options).add(rnd.options.offset)
      )
    }
  }

  mouseup(event) {
    if ('dragCtx' in this) {
      const rnd = this.editor.render
      const closestItem = this.editor.findItem(event, ['atoms'])

      if (closestItem?.map === 'atoms') {
        const action = new Action()
        const atoms = rnd.ctab.molecule.atoms
        const atom1 = atoms.get(this.dragCtx.item.id)
        const atom2 = atoms.get(closestItem.id)
        const aam1 = atom1?.aam
        const aam2 = atom2?.aam

        if (!aam1 || aam1 !== aam2) {
          if ((aam1 && aam1 !== aam2) || (!aam1 && aam2)) {
            // eslint-disable-line no-mixed-operators
            atoms.forEach((atom, aid) => {
              if (
                aid !== this.dragCtx.item.id &&
                ((aam1 && atom.aam === aam1) || (aam2 && atom.aam === aam2))
              )
                action.mergeWith(
                  fromAtomsAttrs(rnd.ctab, aid, { aam: 0 }, null)
                )
            })
          }

          if (aam1) {
            action.mergeWith(
              fromAtomsAttrs(rnd.ctab, closestItem.id, { aam: aam1 }, null)
            )
          } else {
            let aam = 0
            atoms.forEach((atom) => {
              aam = Math.max(aam, atom.aam || 0)
            })
            action.mergeWith(
              fromAtomsAttrs(
                rnd.ctab,
                this.dragCtx.item.id,
                { aam: aam + 1 },
                null
              )
            )
            action.mergeWith(
              fromAtomsAttrs(rnd.ctab, closestItem.id, { aam: aam + 1 }, null)
            )
          }
          this.editor.update(action)
        }
      }
      this.updateLine(null, null)
      delete this.dragCtx
    }
    this.editor.hover(null)
  }
}

export default ReactionMapTool
