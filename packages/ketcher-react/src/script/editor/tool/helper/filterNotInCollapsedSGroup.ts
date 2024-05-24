import { Atom, Bond, Struct } from 'ketcher-core';

/**
 * return only such elements ids that not part of collapsed group
 * Addition: if an atom in the contracted SGroup,
 * but is an AttachmentPoint -> will be returned as well.
 */
export function filterNotInContractedSGroup(
  itemsToFilter: { atoms?: number[]; bonds?: number[] },
  struct: Struct,
) {
  return {
    atoms:
      itemsToFilter.atoms?.filter((atomId) => {
        const groupId = struct.getGroupIdFromAtomId(atomId);
        if (isNotCollapsedSGroup(groupId, struct)) {
          return true;
        } else {
          const sGroup = struct.sgroups.get(groupId as number);
          return sGroup?.getAttachmentAtomId() === atomId;
        }
      }) ?? [],
    bonds:
      itemsToFilter.bonds?.filter((bondId) => {
        const groupId = struct.getGroupIdFromBondId(bondId);
        return isNotCollapsedSGroup(groupId, struct);
      }) ?? [],
  };
}

function isNotCollapsedSGroup(groupId: number | null, struct: Struct): boolean {
  if (groupId === null) {
    return true;
  }
  const sGroup = struct.sgroups.get(groupId);
  if (!sGroup) {
    throw new Error(
      `sGroup with id = "${groupId}" must be defined, unexpected behaviour`,
    );
  }
  return sGroup.checkAttr('expanded', true);
}

export function filterNotSuperatomLeavingGroups(
  itemsToFilter: { atoms?: number[]; bonds?: number[] },
  struct: Struct,
) {
  return {
    atoms:
      itemsToFilter.atoms?.filter((atomId) => {
        return !(
          Atom.isSuperatomLeavingGroupAtom(struct, atomId) &&
          Atom.isAttachmentAtomHasExternalConnections(struct, atomId)
        );
      }) ?? [],
    bonds:
      itemsToFilter.bonds?.filter((bondId) => {
        const bond = struct.bonds.get(bondId) as Bond;
        const beginSuperatomAttachmentPoint =
          Atom.getSuperAtomAttachmentPointByLeavingGroup(struct, bond.begin);
        const endSuperatomAttachmentPoint =
          Atom.getSuperAtomAttachmentPointByLeavingGroup(struct, bond.end);

        return !(
          (beginSuperatomAttachmentPoint &&
            Atom.isAttachmentAtomHasExternalConnections(struct, bond.begin) &&
            bond.end === beginSuperatomAttachmentPoint.atomId) ||
          (endSuperatomAttachmentPoint &&
            Atom.isAttachmentAtomHasExternalConnections(struct, bond.end) &&
            bond.begin === endSuperatomAttachmentPoint.atomId)
        );
      }) ?? [],
  };
}
