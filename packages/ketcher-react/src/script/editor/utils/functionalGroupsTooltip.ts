import Editor from '../Editor'
import { Bond, SGroup, Struct } from 'ketcher-core'

let showTooltipTimer: ReturnType<typeof setTimeout> | null = null

export const TOOLTIP_DELAY = 300

type InfoPanelData = {
  groupStruct: Struct
  sGroup: SGroup
  event: PointerEvent
}

function makeStruct(editor: Editor, sGroup: SGroup) {
  const existingStruct = editor.struct()
  const struct = new Struct()
  const atomsIdMapping = new Map()

  sGroup.atoms.forEach((atomId) => {
    const atomIdInTooltip = struct.atoms.add(existingStruct.atoms.get(atomId)!)
    atomsIdMapping.set(atomId, atomIdInTooltip)
  })
  Array.from(existingStruct.bonds).forEach((value) => {
    const [_, bond] = value as [number, Bond]
    const clonedBond = bond.clone(atomsIdMapping)
    const isInsideSGroup =
      sGroup.atoms.includes(bond.begin) || sGroup.atoms.includes(bond.end)
    if (isInsideSGroup) {
      struct.bonds.add(clonedBond)
    }
  })

  return struct
}

function hideTooltip(editor: Editor) {
  editor.event.showInfo.dispatch(null)

  if (showTooltipTimer) {
    clearTimeout(showTooltipTimer)
  }
}

function showTooltip(editor: Editor, infoPanelData: InfoPanelData | null) {
  hideTooltip(editor)

  showTooltipTimer = setTimeout(() => {
    editor.event.showInfo.dispatch(infoPanelData)
  }, TOOLTIP_DELAY)
}

export function setFunctionalGroupsTooltip({
  editor,
  event,
  isShow
}: {
  editor: Editor
  event?: PointerEvent
  isShow: boolean
}) {
  if (!isShow) {
    hideTooltip(editor)

    return
  }

  let infoPanelData: null | InfoPanelData = null
  const checkFunctionGroupTypes = ['sgroups', 'functionalGroups']
  const closestCollapsibleStructures = editor.findItem(
    event,
    checkFunctionGroupTypes
  )
  if (closestCollapsibleStructures && event) {
    const sGroup = editor.struct()?.sgroups.get(closestCollapsibleStructures.id)
    if (sGroup && !sGroup.data.expanded && sGroup.hovering) {
      const groupName = sGroup.data.name
      const groupStruct = makeStruct(editor, sGroup)
      groupStruct.name = groupName
      infoPanelData = {
        groupStruct,
        event,
        sGroup
      }
    }
  }
  showTooltip(editor, infoPanelData)
}
