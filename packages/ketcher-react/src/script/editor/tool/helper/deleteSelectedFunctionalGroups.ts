import {
  FunctionalGroup,
  SGroup,
  fromSgroupDeletion,
  fromFragmentDeletion,
  ReStruct,
  Action
} from 'ketcher-core'
import { getGroupIdsFromItemArrays } from './getGroupIdsFromItems'
import { Selection } from '../../Editor'

export function deleteSelectedFunctionalGroups(
  selected: Selection,
  struct: ReStruct,
  action: Action
): number[] {
  const atomsInSGroups: number[] = []
  const functionalGroups = struct.molecule.functionalGroups
  const selectedSGroupsId =
    selected && getGroupIdsFromItemArrays(struct.molecule, selected)
  const sgroups = struct.sgroups
  selectedSGroupsId.forEach((sGroupId) => {
    const sGroupItem = sgroups.get(sGroupId)?.item
    if (
      FunctionalGroup.isContractedFunctionalGroup(sGroupId, functionalGroups)
    ) {
      const atomsWithoutAttachmentPoint =
        SGroup.getAtomsSGroupWithoutAttachmentPoint(sGroupItem, struct.molecule)
      atomsInSGroups.push(...atomsWithoutAttachmentPoint)
      action.mergeWith(fromSgroupDeletion(struct, sGroupId))
      action.mergeWith(
        fromFragmentDeletion(struct, {
          atoms: atomsWithoutAttachmentPoint,
          bonds: SGroup.getBonds(struct, sGroupItem)
        })
      )
    }
  })
  return atomsInSGroups
}
