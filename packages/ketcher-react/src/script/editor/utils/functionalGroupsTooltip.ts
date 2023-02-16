import { FunctionalGroup } from 'ketcher-core'

let showTooltipTimer: ReturnType<typeof setTimeout> | null = null

export const TOOLTIP_DELAY = 300

export function showTooltip(editor, infoPanelData) {
  editor.event.showInfo.dispatch(null)

  if (showTooltipTimer) {
    clearTimeout(showTooltipTimer)
  }
  if (infoPanelData) {
    showTooltipTimer = setTimeout(() => {
      editor.event.showInfo.dispatch(infoPanelData)
    }, TOOLTIP_DELAY)
  }
}

export function showFunctionalGroupsTooltip(editor) {
  let infoPanelData: any = null
  const checkFunctionGroupTypes = ['sgroups', 'functionalGroups']
  const closestCollapsibleStructures = editor.findItem(
    event,
    checkFunctionGroupTypes
  )
  if (closestCollapsibleStructures) {
    const sGroup = editor.struct()?.sgroups.get(closestCollapsibleStructures.id)
    if (sGroup && !sGroup.data.expanded) {
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
