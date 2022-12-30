import { selMerge } from '../../tool/select'
import { Editor } from 'ketcher-core'

export function selectElementsOnCanvas(
  elements: { atoms: number[]; bonds: number[] },
  editor: Editor,
  event,
  lassoHelper
) {
  const sel =
    elements.atoms.length > 0
      ? selMerge(lassoHelper.end(), elements, false)
      : lassoHelper.end()
  editor.selection(
    !event.shiftKey ? sel : selMerge(sel, editor.selection(), false)
  )
}
