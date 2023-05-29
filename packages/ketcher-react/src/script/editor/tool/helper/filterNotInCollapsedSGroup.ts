import { Struct, FunctionalGroup } from 'ketcher-core'

/**
 * return only such elements ids that not part of collapsed group
 * Addition: if an atom in the collapsed SGroup, but is an AttachmentPoint it will be returned as well.
 */
export function filterNotInCollapsedSGroup(
  itemsToFilter: { atoms?: number[]; bonds?: number[] },
  struct: Struct
) {
  return {
    atoms:
      itemsToFilter.atoms?.filter((atomId) => {
        const groupId = struct.getGroupIdFromAtomId(atomId)
        if (isNotCollapsedSGroup(groupId, struct)) {
          return true
        } else {
          return FunctionalGroup.isAttachmentPointAtom(atomId, struct)
        }
      }) ?? [],
    bonds:
      itemsToFilter.bonds?.filter((bondId) => {
        const groupId = struct.getGroupIdFromBondId(bondId)
        return isNotCollapsedSGroup(groupId, struct)
      }) ?? []
  }
}

function isNotCollapsedSGroup(groupId: number | null, struct: Struct): boolean {
  if (groupId === null) {
    return true
  }
  const sGroup = struct.sgroups.get(groupId)
  if (!sGroup) {
    throw new Error(
      `sGroup with id = "${groupId}" must be defined, unexpected behaviour`
    )
  }
  return sGroup.checkAttr('expanded', true)
}
