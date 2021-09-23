enum TYPES {
  Ac = 'Ac',
  Bn = 'Bn',
  Bu = 'Bu',
  Bz = 'Bz',
  C2H5 = 'C2H5',
  CCl3 = 'CCl3',
  CF3 = 'CF3',
  CO2Et = 'CO2Et',
  CO2H = 'CO2H',
  CO2Me = 'CO2Me',
  CO2Pr = 'CO2Pr',
  CO2tBu = 'CO2tBu',
  Cp = 'Cp',
  CPh3 = 'CPh3',
  Et = 'Et',
  iBu = 'iBu',
  Indole = 'Indole',
  iPr = 'iPr',
  Me = 'Me',
  Ms = 'Ms',
  NCO = 'NCO',
  NCS = 'NCS',
  NHPh = 'NHPh',
  OCN = 'OCN',
  OEt = 'OEt',
  OMe = 'OMe',
  Ph = 'Ph',
  PhCOOH = 'PhCOOH',
  PO2 = 'PO2',
  PO3 = 'PO3',
  PO4 = 'PO4',
  Pr = 'Pr',
  sBu = 'sBu',
  SCN = 'SCN',
  SO2 = 'SO2',
  SO2Cl = 'SO2Cl',
  SO3 = 'SO3',
  SO4 = 'SO4',
  tBu = 'tBu',
  Tf = 'Tf',
  Ts = 'Ts'
}

export class FunctionalGroup {
  name: string
  relatedSGroupId: number
  isExpanded: boolean

  constructor(name: string, relatedSGroupId: number, isExpanded: boolean) {
    this.name = name
    this.relatedSGroupId = relatedSGroupId
    this.isExpanded = isExpanded
  }

  static isFunctionalGroup(sgroup): boolean {
    return TYPES[sgroup.data.name] && sgroup.type === 'SUP'
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
    functionalGroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    const contractedFunctionalGroups: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach(sg => {
        if (
          FunctionalGroup.isContractedFunctionalGroup(
            sg.item.id,
            functionalGroups
          )
        ) {
          contractedFunctionalGroups.push(sg.item.id)
        }
      })
    } else {
      sgroups.forEach(sg => {
        if (
          FunctionalGroup.isContractedFunctionalGroup(sg.id, functionalGroups)
        ) {
          contractedFunctionalGroups.push(sg.id)
        }
      })
    }
    return contractedFunctionalGroups.some(sg => atom.sgs.has(sg))
  }

  static isBondInContractedFunctionalGroup(
    bond,
    sgroups,
    functionalGroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    const contractedFunctionalGroupsAtoms: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach(sg => {
        if (
          FunctionalGroup.isContractedFunctionalGroup(
            sg.item.id,
            functionalGroups
          )
        ) {
          contractedFunctionalGroupsAtoms.push(...sg.item.atoms)
        }
      })
    } else {
      sgroups.forEach(sg => {
        if (
          FunctionalGroup.isContractedFunctionalGroup(sg.id, functionalGroups)
        ) {
          contractedFunctionalGroupsAtoms.push(...sg.atoms)
        }
      })
    }
    return (
      contractedFunctionalGroupsAtoms.includes(bond.begin) &&
      contractedFunctionalGroupsAtoms.includes(bond.end)
    )
  }

  static isContractedFunctionalGroup(sgroupId, functionalGroups): boolean {
    let isFunctionalGroup = false
    let expanded = false
    functionalGroups.forEach(fg => {
      if (fg.relatedSGroupId === sgroupId) {
        isFunctionalGroup = true
        expanded = fg.isExpanded
      }
    })
    return !expanded && isFunctionalGroup
  }
}
