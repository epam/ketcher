import { MergeItems, SGroup, Struct } from 'ketcher-core'

export function filterSlatAndSolventFromMerge(
  mergeItems: MergeItems | null,
  struct: Struct
): MergeItems {
  const resultItems = {
    atoms: new Map<number, number>(),
    bonds: new Map<number, number>()
  }
  if (!mergeItems) {
    return resultItems
  }
  const { atoms, bonds } = mergeItems
  atoms.forEach((value, key) => {
    const groupIds = [key, value].map((atomId) =>
      struct.getGroupIdFromAtomId(atomId)
    )
    const isNotSalt = !someIdAreSaltOrSolvent(groupIds, struct)
    if (isNotSalt) {
      resultItems.atoms.set(key, value)
    }
  })
  bonds.forEach((value, key) => {
    const groupIds = [key, value]
      .map((atomId) => struct.getGroupsIdsFromBondId(atomId))
      .flat()
    const isNotSalt = !someIdAreSaltOrSolvent(groupIds, struct)
    if (isNotSalt) {
      resultItems.bonds.set(key, value)
    }
  })
  return resultItems
}

function someIdAreSaltOrSolvent(
  groupIds: Array<number | null>,
  struct: Struct
): boolean {
  return groupIds.some(
    (id) =>
      id != null && SGroup.isSaltOrSolvent(struct.sgroups.get(id)?.data.name)
  )
}
