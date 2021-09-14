export class FunctionalGroup {
  name: string
  relatedSGroupId: number
  isExpanded: boolean

  constructor(name: string, relatedSGroupId: number, isExpanded: boolean) {
    this.name = name
    this.relatedSGroupId = relatedSGroupId
    this.isExpanded = isExpanded
  }

  static isFunctionalGroup(list, sgroup): boolean {
    return list.includes(sgroup.data.name) && sgroup.type === 'SUP'
  }

  static clone(functionalGroup: FunctionalGroup): FunctionalGroup {
    const cloned = new FunctionalGroup(
      functionalGroup.name,
      functionalGroup.relatedSGroupId,
      functionalGroup.isExpanded
    )
    return cloned
  }

  static isAtomInCollapsedFinctionalGroup(
    atom,
    sgroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    // TO DO improve method, it should use Func Groups instead of SGroups
    const collapsedFunctionalGroups: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach(sg => {
        if (!sg.item.expanded && sg.item.isFunctionalGroup) {
          collapsedFunctionalGroups.push(sg.item.id)
        }
      })
    } else {
      sgroups.forEach(sg => {
        if (!sg.expanded && sg.isFunctionalGroup) {
          collapsedFunctionalGroups.push(sg.id)
        }
      })
    }
    return collapsedFunctionalGroups.some(sg => atom.sgs.has(sg))
  }

  static isBondInCollapsedFunctionalGroup(
    bond,
    sgroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    const collapsedFunctionalGroupsAtoms: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach(sg => {
        if (!sg.item.expanded && sg.item.isFunctionalGroup) {
          collapsedFunctionalGroupsAtoms.push(...sg.item.atoms)
        }
      })
    } else {
      sgroups.forEach(sg => {
        if (!sg.expanded && sg.isFunctionalGroup) {
          collapsedFunctionalGroupsAtoms.push(...sg.atoms)
        }
      })
    }
    return (
      collapsedFunctionalGroupsAtoms.includes(bond.begin) &&
      collapsedFunctionalGroupsAtoms.includes(bond.end)
    )
  }
}
