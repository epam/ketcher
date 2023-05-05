import { Bond, Struct } from 'ketcher-core'

let showTooltipTimer: ReturnType<typeof setTimeout> | null = null

export const TOOLTIP_DELAY = 300

function makeStruct(editor, sGroup) {
  const existingStruct = editor.struct()
  const struct = new Struct()
  const atomsIdMapping = new Map()

  sGroup.atoms.forEach((atomId) => {
    const atomIdInTooltip = struct.atoms.add(existingStruct.atoms.get(atomId))
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

export function showFunctionalGroupsTooltip(editor, event: PointerEvent) {
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
