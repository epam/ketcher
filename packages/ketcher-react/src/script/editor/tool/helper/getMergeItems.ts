import { getItemsToFuse } from 'ketcher-core'
import Editor from '../../Editor'
import utils from '../../shared/utils'

export function getMergeItems(
  editor: Editor,
  items: Record<string, number[]>
): Record<string, Map<unknown, unknown>> | null {
  const nonGroupItemsAndAttachPoints = {
    ...items,
    ...utils.getNonGroupItemsAndAttachmentPoints(
      items,
      editor.render.ctab.molecule
    )
  }

  return getItemsToFuse(editor, nonGroupItemsAndAttachPoints)
}
