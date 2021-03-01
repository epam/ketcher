import { Pile } from 'ketcher-core'

import { fromAtomsAttrs } from '../actions/atom'
import { fromStereoFlagUpdate } from '../actions/fragment'
import { findStereoAtoms } from '../actions/utils'

function EnhancedStereoTool(editor) {
  if (!(this instanceof EnhancedStereoTool)) {
    const selection = editor.selection()
    if (!selection || !selection.atoms) return null

    const stereoAtoms = findStereoAtoms(editor.struct(), selection.atoms) // Map <aid,stereoLabel>
    if (stereoAtoms.length === 0) return null

    if (checkSelectionForFragment(editor, selection)) {
      changeFragmentStereoAction(editor, stereoAtoms).then(
        action => action && editor.update(action)
      )
    } else {
      changeAtomsStereoAction(editor, stereoAtoms).then(
        action => action && editor.update(action)
      )
    }
  }
}

function changeAtomsStereoAction(editor, stereoAtoms) {
  const struct = editor.struct()
  const restruct = editor.render.ctab
  const res = editor.event.enhancedStereoEdit.dispatch({
    type: 'atoms',
    stereoLabel: struct.atoms.get(stereoAtoms[0]).stereoLabel
  })
  return res.then(stereoLabel => {
    const action = fromAtomsAttrs(restruct, stereoAtoms, {
      stereoLabel
    }).mergeWith(
      fromStereoFlagUpdate(restruct, struct.atoms.get(stereoAtoms[0]).fragment)
    )
    action.operations.reverse()
    return action
  })
}

function changeFragmentStereoAction(editor, stereoAtoms) {
  const struct = editor.struct()
  const restruct = editor.render.ctab
  const frid = struct.atoms.get(stereoAtoms[0]).fragment
  const flag = struct.frags.get(frid).enhancedStereoFlag

  const res = editor.event.enhancedStereoEdit.dispatch({
    type: 'fragment',
    stereoFlag: flag
  })
  return res.then(({ stereoFlag }) => {
    if (stereoFlag === flag) return null
    const stereoLabel =
      stereoFlag !== null
        ? `${stereoFlag}${stereoFlag !== 'abs' ? '-1' : ''}`
        : null
    return fromStereoFlagUpdate(restruct, frid, stereoFlag).mergeWith(
      fromAtomsAttrs(restruct, stereoAtoms, { stereoLabel })
    )
  })
}

function checkSelectionForFragment(editor, selection) {
  const struct = editor.struct()
  const frid = struct.atoms.get(selection.atoms[0]).fragment
  const fragAids = new Pile(struct.getFragmentIds(frid))
  const selectionAids = new Pile(selection.atoms)

  return fragAids.equals(selectionAids)
}

export default EnhancedStereoTool
