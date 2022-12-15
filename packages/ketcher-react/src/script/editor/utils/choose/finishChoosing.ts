import { Action, fromItemsFuse, FunctionalGroup, SGroup } from 'ketcher-core'
import { selMerge } from '../../tool/select'

interface DragCtx {
  item?: any
  xy0?: any
  mergeItems?: () => void
  action?: Action
  stopTapping?: () => void
}

export function finishChoosing(event, editor, lassoHelper) {
  console.log('finishChoosing')

  let dragCtx: DragCtx | null = {}

  const selected = editor.selection()
  const struct = editor.render.ctab
  const molecule = struct.molecule
  const functionalGroups = molecule.functionalGroups
  const selectedSgroups: any[] = []
  const newSelected = { atoms: [] as any[], bonds: [] as any[] }
  let actualSgroupId

  if (selected && functionalGroups.size && selected.atoms) {
    console.log('if (selected && functionalGroups.size && selected.atoms)')
    for (const atom of selected.atoms) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        atom
      )
      const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a

      if (atomFromStruct) {
        for (const sgId of atomFromStruct.sgs.values()) {
          actualSgroupId = sgId
        }
      }
      if (
        atomFromStruct &&
        actualSgroupId !== undefined &&
        !selectedSgroups.includes(actualSgroupId)
      )
        selectedSgroups.push(actualSgroupId)
    }
  }

  if (selected && functionalGroups.size && selected.bonds) {
    console.log('if (selected && functionalGroups.size && selected.bonds)')
    for (const atom of selected.bonds) {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        atom
      )
      const sGroupId = FunctionalGroup.findFunctionalGroupByBond(
        molecule,
        functionalGroups,
        bondId
      )
      if (sGroupId !== null && !selectedSgroups.includes(sGroupId))
        selectedSgroups.push(sGroupId)
    }
  }

  if (selectedSgroups.length) {
    console.log('if (selectedSgroups.length)')
    for (const sgId of selectedSgroups) {
      const sgroup = struct.sgroups.get(sgId)
      if (sgroup) {
        const sgroupAtoms = SGroup.getAtoms(molecule, sgroup.item)
        const sgroupBonds = SGroup.getBonds(molecule, sgroup.item)
        newSelected.atoms.push(...sgroupAtoms) &&
          newSelected.bonds.push(...sgroupBonds)
      }
    }
  }

  if (dragCtx && dragCtx.stopTapping) {
    console.log('if (dragCtx && dragCtx.stopTapping)')
    dragCtx.stopTapping()
  }

  if (dragCtx && dragCtx.item) {
    console.log('if (dragCtx && dragCtx.item)')
    dragCtx.action = dragCtx.action
      ? fromItemsFuse(struct, dragCtx.mergeItems).mergeWith(dragCtx.action)
      : fromItemsFuse(struct, dragCtx.mergeItems)

    editor.hover(null)
    if (dragCtx.mergeItems) editor.selection(null)
    if (dragCtx.action.operations.length !== 0) editor.update(dragCtx.action)

    dragCtx = null
  } else if (lassoHelper.running()) {
    // TODO it catches more events than needed, to be re-factored
    const sel =
      newSelected.atoms.length > 0
        ? selMerge(lassoHelper.end(), newSelected, false)
        : lassoHelper.end()
    editor.selection(
      !event.shiftKey ? sel : selMerge(sel, editor.selection(), false)
    )
  } else if (lassoHelper.fragment) {
    console.log('else if (lassoHelper.fragment)')
    if (!event.shiftKey) {
      console.log('if (!event.shiftKey)')
      editor.selection(null)
    }
  }
  editor.event.message.dispatch({
    info: false
  })
  return true
}
