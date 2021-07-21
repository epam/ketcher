import { fromAtomsAttrs } from '../actions/atom'
import { fromStereoFlagUpdate } from '../actions/fragment'
import { findStereoAtoms } from '../actions/utils'
import Editor from '../Editor'
import Action from '../shared/action'

function EnhancedStereoTool(
  this: typeof EnhancedStereoTool,
  editor: Editor
): null | void {
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

function changeAtomsStereoAction(
  editor: Editor,
  stereoAtoms: number[]
): Promise<Action> {
  const struct = editor.struct()
  const restruct = editor.render.ctab
  const stereoLabels = stereoAtoms.map(stereoAtom => {
    const atom = struct.atoms.get(stereoAtom)
    return atom && atom.stereoLabel
  })
  const hasAnotherLabel = stereoLabels.some(
    stereoLabel => stereoLabel !== stereoLabels[0]
  )
  const res = editor.event.enhancedStereoEdit.dispatch({
    stereoLabel: hasAnotherLabel ? null : stereoLabels[0]
  })
  return res.then(stereoLabel => {
    const action = stereoAtoms.reduce(
      (acc, stereoAtom) => {
        return acc.mergeWith(
          fromStereoFlagUpdate(restruct, struct.atoms.get(stereoAtom)?.fragment)
        )
      },
      fromAtomsAttrs(
        restruct,
        stereoAtoms,
        {
          stereoLabel
        },
        false
      )
    )
    action.operations.reverse()
    return action
  }).catch(() => null) // no changes
}

export default EnhancedStereoTool
