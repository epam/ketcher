import { fromAtomsAttrs } from '../actions/atom'
import { fromStereoFlagUpdate } from '../actions/fragment'
import { findStereoAtoms } from '../actions/utils'

function EnhancedStereoTool(editor) {
  if (!(this instanceof EnhancedStereoTool)) {
    const selection = editor.selection()

    const stereoAtoms = findStereoAtoms(
      editor.struct(),
      selection
        ? selection.atoms || []
        : Array.from(editor.struct().atoms.keys())
    )

    if (stereoAtoms.length === 0) return null

    changeAtomsStereoAction(editor, stereoAtoms).then(
      action => action && editor.update(action)
    )
  }
}

function changeAtomsStereoAction(editor, stereoAtoms) {
  const struct = editor.struct()
  const restruct = editor.render.ctab
  const stereoLabels = stereoAtoms.map(x => struct.atoms.get(x).stereoLabel)
  const hasAnotherLabel = stereoLabels.some(x => x !== stereoLabels[0])
  const res = editor.event.enhancedStereoEdit.dispatch({
    stereoLabel: hasAnotherLabel ? null : stereoLabels[0]
  })
  return res.then(stereoLabel => {
    const action = stereoAtoms.reduce(
      (acc, stereoAtom) => {
        return acc.mergeWith(
          fromStereoFlagUpdate(restruct, struct.atoms.get(stereoAtom).fragment)
        )
      },
      fromAtomsAttrs(restruct, stereoAtoms, {
        stereoLabel
      })
    )
    action.operations.reverse()
    return action
  })
}

export default EnhancedStereoTool
