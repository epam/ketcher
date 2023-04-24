import { Action, fromItemsFuse, ReStruct, setExpandSGroup } from 'ketcher-core'
import Editor from '../../Editor'
import { getGroupIdsFromItemMaps } from './getGroupIdsFromItems'

type MergeItems = {
  atoms: Map<number, number>
  bonds: Map<number, number>
}

export function dropAndMerge(
  editor: Editor,
  mergeItems: MergeItems,
  action?: Action,
  resizeCanvas?: boolean
): void {
  const restruct = editor.render.ctab
  const isMerging = !!mergeItems
  let dropItemAction = new Action()

  if (isMerging) {
    const expandGroupsAction = getExpandGroupsInMergeAction(
      editor.render.ctab,
      mergeItems
    )
    dropItemAction = dropItemAction.mergeWith(expandGroupsAction)
  }

  dropItemAction = fromItemsFuse(restruct, mergeItems).mergeWith(dropItemAction)

  if (action) {
    dropItemAction = dropItemAction.mergeWith(action)
  }

  editor.hover(null)
  if (isMerging) editor.selection(null)

  if (dropItemAction?.operations.length > 0) {
    editor.update(dropItemAction, false, { resizeCanvas: !!resizeCanvas })
  }
}

function getExpandGroupsInMergeAction(
  restruct: ReStruct,
  mergeItems: MergeItems
): Action {
  const action = new Action()
  const groupsInMerge = getGroupIdsFromItemMaps(restruct.molecule, mergeItems)
  if (groupsInMerge.length) {
    groupsInMerge.forEach((groupId) => {
      action.mergeWith(setExpandSGroup(restruct, groupId, { expanded: true }))
    })
  }

  return action
}
