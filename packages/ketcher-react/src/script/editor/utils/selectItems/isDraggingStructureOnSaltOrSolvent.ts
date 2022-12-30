import { ReSGroup, SGroup } from 'ketcher-core'

export function isDraggingStructureOnSaltOrSolvent(
  dragCtx,
  sgroups: Map<number, ReSGroup>
) {
  let isDraggingOnSaltOrSolventAtom
  let isDraggingOnSaltOrSolventBond
  if (dragCtx?.mergeItems) {
    const mergeAtoms = Array.from(dragCtx.mergeItems.atoms.values())
    const mergeBonds = Array.from(dragCtx.mergeItems.bonds.values())
    const sgroupsOnCanvas = Array.from(sgroups.values()).map(({ item }) => item)
    isDraggingOnSaltOrSolventAtom = mergeAtoms.some((atomId) =>
      SGroup.isAtomInSaltOrSolvent(atomId as number, sgroupsOnCanvas)
    )
    isDraggingOnSaltOrSolventBond = mergeBonds.some((bondId) =>
      SGroup.isBondInSaltOrSolvent(bondId as number, sgroupsOnCanvas)
    )
  }
  return isDraggingOnSaltOrSolventAtom || isDraggingOnSaltOrSolventBond
}
