import {
  FunctionalGroup,
  SGroup,
  fromSgroupDeletion,
  fromFragmentDeletion,
  ReStruct,
  Action
} from 'ketcher-core'

export function deleteFunctionalGroups(
  sGroupsId: number[],
  struct: ReStruct,
  action: Action
): number[] {
  const deletedAtoms: number[] = []
  const functionalGroups = struct.molecule.functionalGroups
  const sgroups = struct.sgroups
  sGroupsId.forEach((sGroupId) => {
    const sGroupItem = sgroups.get(sGroupId)?.item
    if (
      FunctionalGroup.isContractedFunctionalGroup(sGroupId, functionalGroups)
    ) {
      const atomsWithoutAttachmentPoint =
        SGroup.getAtomsSGroupWithoutAttachmentPoint(sGroupItem, struct.molecule)
      deletedAtoms.push(...atomsWithoutAttachmentPoint)
      action.mergeWith(fromSgroupDeletion(struct, sGroupId))
      action.mergeWith(
        fromFragmentDeletion(struct, {
          atoms: atomsWithoutAttachmentPoint,
          bonds: SGroup.getBonds(struct, sGroupItem)
        })
      )
    }
  })
  return deletedAtoms
}
