import { FunctionalGroup } from 'ketcher-core'
import Editor from '../Editor'

let showTooltipTimer: ReturnType<typeof setTimeout> | null = null

export const TOOLTIP_DELAY = 300

function hideTooltip(editor: Editor) {
  editor.event.showInfo.dispatch(null)

  if (showTooltipTimer) {
    clearTimeout(showTooltipTimer)
  }
}

function showTooltip(editor: Editor, infoPanelData: any) {
  hideTooltip(editor)

  showTooltipTimer = setTimeout(() => {
    editor.event.showInfo.dispatch(infoPanelData)
  }, TOOLTIP_DELAY)
}

export function setFunctionalGroupsTooltip(editor: Editor, isShow: boolean) {
  if (!isShow) {
    hideTooltip(editor)

    return
  }

  let infoPanelData: any = null
  const checkFunctionGroupTypes = ['sgroups', 'functionalGroups']
  const closestCollapsibleStructures = editor.findItem(
    event,
    checkFunctionGroupTypes
  )
  if (closestCollapsibleStructures) {
    const sGroup = editor.struct()?.sgroups.get(closestCollapsibleStructures.id)
    if (sGroup && !sGroup.data.expanded && sGroup.hovering) {
      const groupName = sGroup.data.name
      const groupStruct = FunctionalGroup.getFunctionalGroupByName(groupName)
      infoPanelData = {
        groupStruct,
        event,
        sGroup
      }
    }
  }
  showTooltip(editor, infoPanelData)
}
