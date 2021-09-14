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

  static isAtomInContractedFinctionalGroup(
    atom,
    sgroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    // TO DO improve method, it should use Func Groups instead of SGroups
    const contractedFunctionalGroups: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach(sg => {
        if (!sg.item.expanded && sg.item.isFunctionalGroup) {
          contractedFunctionalGroups.push(sg.item.id)
        }
      })
    } else {
      sgroups.forEach(sg => {
        if (!sg.expanded && sg.isFunctionalGroup) {
          contractedFunctionalGroups.push(sg.id)
        }
      })
    }
    return contractedFunctionalGroups.some(sg => atom.sgs.has(sg))
  }

  static isBondInContractedFunctionalGroup(
    bond,
    sgroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    const contractedFunctionalGroupsAtoms: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach(sg => {
        if (!sg.item.expanded && sg.item.isFunctionalGroup) {
          contractedFunctionalGroupsAtoms.push(...sg.item.atoms)
        }
      })
    } else {
      sgroups.forEach(sg => {
        if (!sg.expanded && sg.isFunctionalGroup) {
          contractedFunctionalGroupsAtoms.push(...sg.atoms)
        }
      })
    }
    return (
      contractedFunctionalGroupsAtoms.includes(bond.begin) &&
      contractedFunctionalGroupsAtoms.includes(bond.end)
    )
  }
}
