import { type Struct, Atom, mergeMapOfItemsToSet } from 'ketcher-core';

type Items = {
  atoms?: number[];
  bonds?: number[];
};

type GetGroupIdsFromItemArraysOptions = {
  // Once a superatom is expanded, its leaving-group (R#) atoms become
  // ordinary atoms of the structure and should be treated the same as any
  // other atom when resolving which group a click belongs to (#6743).
  includeExpandedLeavingGroupAtoms?: boolean;
};

function getGroupIdsFromItemArrays(
  struct: Struct,
  items?: Items,
  options?: GetGroupIdsFromItemArraysOptions,
): number[] {
  if (!struct.sgroups.size) return [];

  const groupsIds = new Set<number>();
  if (items?.atoms) {
    items.atoms
      .filter((atomId) => {
        if (!Atom.isSuperatomLeavingGroupAtom(struct, atomId)) {
          return true;
        }

        return (
          options?.includeExpandedLeavingGroupAtoms &&
          Boolean(struct.getGroupFromAtomId(atomId)?.isExpanded())
        );
      })
      .forEach((atomId) => {
        const groupId = struct.getGroupIdFromAtomId(atomId);
        if (groupId !== null) groupsIds.add(groupId);
      });
  }
  items?.bonds?.forEach((bondId) => {
    const groupId = struct.getGroupIdFromBondId(bondId);
    if (groupId !== null) groupsIds.add(groupId);
  });

  return Array.from(groupsIds);
}

type MergeItems = {
  atoms: Map<number, number>;
  bonds: Map<number, number>;
};

function getGroupIdsFromItemMaps(
  struct: Struct,
  mergeMaps: MergeItems | null,
): number[] {
  const atoms =
    mergeMaps?.atoms && Array.from(mergeMapOfItemsToSet(mergeMaps.atoms));
  const bonds =
    mergeMaps?.bonds && Array.from(mergeMapOfItemsToSet(mergeMaps.bonds));

  return getGroupIdsFromItemArrays(struct, { atoms, bonds });
}

export { getGroupIdsFromItemArrays, getGroupIdsFromItemMaps };
