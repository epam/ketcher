import { fromItemsFuse, FunctionalGroup, SGroup } from 'ketcher-core'
import { selectElementsOnCanvas } from './selectElementsOnCanvas'
import { isDraggingStructureOnSaltOrSolvent } from './isDraggingStructureOnSaltOrSolvent'
import { preventSaltAndSolventsMerge } from './preventSaltAndSolventsMerge'

export function finishSelecting(event, self, lassoHelper?) {
  const editor = self.editor
  const selected = editor.selection()
  const struct = editor.render.ctab
  const molecule = struct.molecule
  const functionalGroups = molecule.functionalGroups
  const selectedSgroups: any[] = []
  const newSelected = { atoms: [] as any[], bonds: [] as any[] }
  let actualSgroupId

  if (functionalGroups.size && selected?.atoms) {
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

  if (functionalGroups.size && selected?.bonds) {
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

  const dragCtx = self.dragCtx

  if (dragCtx?.stopTapping) dragCtx.stopTapping()

  const possibleSaltOrSolvent = struct.sgroups.get(actualSgroupId)
  const isDraggingSaltOrSolventOnStructure = SGroup.isSaltOrSolvent(
    possibleSaltOrSolvent?.item.data.name
  )
  if (
    (isDraggingSaltOrSolventOnStructure ||
      isDraggingStructureOnSaltOrSolvent(dragCtx, struct.sgroups)) &&
    dragCtx
  ) {
    preventSaltAndSolventsMerge(struct, dragCtx, editor)
    delete self.dragCtx
    if (lassoHelper?.running()) {
      selectElementsOnCanvas(newSelected, editor, event, lassoHelper)
    }
    return true
  }

  if (dragCtx?.item) {
    dragCtx.action = dragCtx.action
      ? fromItemsFuse(struct, dragCtx.mergeItems).mergeWith(dragCtx.action)
      : fromItemsFuse(struct, dragCtx.mergeItems)

    editor.hover(null)
    if (dragCtx.mergeItems) editor.selection(null)
    if (dragCtx.action.operations.length !== 0) editor.update(dragCtx.action)

    delete self.dragCtx
  } else if (lassoHelper?.running()) {
    // TODO it catches more events than needed, to be re-factored
    selectElementsOnCanvas(newSelected, editor, event, lassoHelper)
  } else if (lassoHelper?.fragment) {
    if (!event.shiftKey) editor.selection(null)
  }
  editor.event.message.dispatch({
    info: false
  })
  return true
}
