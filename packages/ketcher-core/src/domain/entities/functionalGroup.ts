/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { FunctionalGroupsProvider } from './../helpers/functionalGroupsProvider'

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
    const provider = FunctionalGroupsProvider.getInstance()
    const types = provider.getFunctionalGroupsList()
    return (
      types.some(type => type.name === sgroup.data.name) &&
      sgroup.type === 'SUP'
    )
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
