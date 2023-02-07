import { mergeMapOfItemsToSet, Struct } from 'ketcher-core'

type Items = {
  atoms?: number[]
  bonds?: number[]
}

function getGroupIdsFromItemArrays(struct: Struct, items?: Items): number[] {
  if (!struct.sgroups.size) return []

  const groupsIds = new Set<number>()

  items?.atoms?.forEach((atomId) => {
    const groupId = struct.getGroupIdFromAtomId(atomId)
    if (groupId !== null) groupsIds.add(groupId)
  })

  items?.bonds?.forEach((bondId) => {
    const groupId = struct.getGroupIdFromBondId(bondId)
    if (groupId !== null) groupsIds.add(groupId)
  })

  return Array.from(groupsIds)
}

type MergeItems = {
  atoms: Map<number, number>
  bonds: Map<number, number>
}

function getGroupIdsFromItemMaps(
  struct: Struct,
  mergeMaps: MergeItems | null
): number[] {
  const atoms =
    mergeMaps?.atoms && Array.from(mergeMapOfItemsToSet(mergeMaps.atoms))
  const bonds =
    mergeMaps?.bonds && Array.from(mergeMapOfItemsToSet(mergeMaps.bonds))

  return getGroupIdsFromItemArrays(struct, { atoms, bonds })
}

export { getGroupIdsFromItemArrays, getGroupIdsFromItemMaps }
