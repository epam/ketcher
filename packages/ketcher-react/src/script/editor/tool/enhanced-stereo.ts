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
  findStereoAtoms,
  fromAtomsAttrs,
  fromStereoFlagUpdate
} from 'ketcher-core'

import Editor from '../Editor'

class EnhancedStereoTool {
  editor: Editor
  stereoAtoms: Array<number>
  isNotActiveTool: boolean | undefined

  constructor(editor) {
    const selection = editor.selection()
    this.editor = editor

    this.stereoAtoms = findStereoAtoms(
      editor.struct(),
      selection
        ? selection.atoms || []
        : Array.from(editor.struct().atoms.keys())
    )

    if (this.stereoAtoms.length === 0) {
      this.isNotActiveTool = true
      return
    }

    this.changeAtomsStereoAction().then(
      (action) => action && editor.update(action)
    )
  }

  changeAtomsStereoAction() {
    const struct = this.editor.struct()
    const restruct = this.editor.render.ctab
    const stereoLabels = this.stereoAtoms.map((stereoAtom) => {
      const atom = struct.atoms.get(stereoAtom)
      return atom && atom.stereoLabel
    })
    const hasAnotherLabel = stereoLabels.some(
      (stereoLabel) => stereoLabel !== stereoLabels[0]
    )
    const res = this.editor.event.enhancedStereoEdit.dispatch({
      stereoLabel: hasAnotherLabel ? null : stereoLabels[0]
    })

    return res.then((stereoLabel) => {
      if (!stereoLabel) {
        return null
      }

      const action = this.stereoAtoms.reduce(
        (acc, stereoAtom) => {
          return acc.mergeWith(
            fromStereoFlagUpdate(
              restruct,
              struct.atoms.get(stereoAtom)?.fragment
            )
          )
        },
        fromAtomsAttrs(
          restruct,
          this.stereoAtoms,
          {
            stereoLabel
          },
          false
        )
      )
      action.operations.reverse()
      return action
    })
  }
}

export default EnhancedStereoTool
