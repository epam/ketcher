import { fromItemsFuse, ReStruct } from 'ketcher-core'
import Editor from '../../Editor'

export function preventSaltAndSolventsMerge(
  struct: ReStruct,
  dragCtx,
  editor: Editor
) {
  const action = dragCtx.action
    ? fromItemsFuse(struct, null).mergeWith(dragCtx.action)
    : fromItemsFuse(struct, null)
  editor.hover(null)
  if (dragCtx.mergeItems) {
    editor.selection(null)
  }
  editor.update(action)
  editor.event.message.dispatch({
    info: false
  })
}
