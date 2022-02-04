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
import { HttpFunctionalGroupsProvider } from '../helpers'
import { SGroup } from './sgroup'
import assert from 'assert'

export class FunctionalGroup {
  #sgroup: SGroup

  constructor(sgroup: SGroup) {
    assert(sgroup != null)

    this.#sgroup = sgroup
  }

  get name(): string {
    return this.#sgroup.data.name
  }

  get relatedSGroupId(): number {
    return this.#sgroup.id
  }

  get isExpanded(): boolean {
    return this.#sgroup.data.expanded
  }

  get relatedSGroup(): SGroup {
    return this.#sgroup
  }

  static atomsInFunctionalGroup(functionalGroups, atom): number | null {
    if (functionalGroups.size === 0) {
      return null
    }
    for (const fg of functionalGroups.values()) {
      if (fg.relatedSGroup.atoms.includes(atom)) return atom
    }
    return null
  }

  static bondsInFunctionalGroup(
    molecule,
    functionalGroups,
    bond
  ): number | null {
    if (functionalGroups.size === 0) {
      return null
    }
    for (const fg of functionalGroups.values()) {
      const bonds = SGroup.getBonds(molecule, fg.relatedSGroup)
      if (bonds.includes(bond)) return bond
    }
    return null
  }

  static findFunctionalGroupByAtom(functionalGroups, atom): number | null {
    for (const fg of functionalGroups.values()) {
      if (fg.relatedSGroup.atoms.includes(atom)) return fg.relatedSGroupId
    }
    return null
  }

  static findFunctionalGroupByBond(
    molecule,
    functionalGroups,
    bond
  ): number | null {
    for (const fg of functionalGroups.values()) {
      const bonds = SGroup.getBonds(molecule, fg.relatedSGroup)
      if (bonds.includes(bond)) return fg.relatedSGroupId
    }
    return null
  }

  static clone(functionalGroup: FunctionalGroup): FunctionalGroup {
    return new FunctionalGroup(functionalGroup.#sgroup)
  }

  static isFirstAtomInFunctionalGroup(sgroups, aid): boolean {
    for (const sg of sgroups.values()) {
      if (
        HttpFunctionalGroupsProvider.isFunctionalGroup(sg) &&
        aid === sg.atoms[0]
      ) {
        return true
      }
    }
    return false
  }

  static isAtomInContractedFunctionalGroup(
    atom,
    sgroups,
    functionalGroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    const contractedFunctionalGroups: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach((sg) => {
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
      sgroups.forEach((sg) => {
        if (
          FunctionalGroup.isContractedFunctionalGroup(sg.id, functionalGroups)
        ) {
          contractedFunctionalGroups.push(sg.id)
        }
      })
    }
    return contractedFunctionalGroups.some((sg) => atom.sgs.has(sg))
  }

  static isBondInContractedFunctionalGroup(
    bond,
    sgroups,
    functionalGroups,
    sgroupsFromReStruct: boolean
  ): boolean {
    const contractedFunctionalGroupsAtoms: number[] = []
    if (sgroupsFromReStruct) {
      sgroups.forEach((sg) => {
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
      sgroups.forEach((sg) => {
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
    functionalGroups.forEach((fg) => {
      if (fg.relatedSGroupId === sgroupId) {
        isFunctionalGroup = true
        expanded = fg.isExpanded
      }
    })
    return !expanded && isFunctionalGroup
  }
}
