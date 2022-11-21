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
import { FunctionalGroupsProvider } from '../helpers'
import { SGroup } from './sgroup'
import { Struct } from './struct'
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

  static isFunctionalGroup(sgroup): boolean {
    const provider = FunctionalGroupsProvider.getInstance()
    const types = provider.getFunctionalGroupsList()
    return (
      types.some((type) => type.name === sgroup.data.name) &&
      sgroup.type === 'SUP'
    )
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

  /**
   * This function determines, if an atom is used for attachment to other structure.
   * For example, having sgroup CF3, which looks like
   *              F
   *              |
   *            F-C-F
   *              |
   *         other struct
   * C – is an attachment point
   */
  static isAttachmentPointAtom(atomId: number, molecule: Struct): boolean {
    const { sgroups, bonds } = molecule
    const isAtomInSameFunctionalGroup = (otherAtomId, sgroup) =>
      sgroup.atoms.includes(otherAtomId)
    for (const sgroup of sgroups.values()) {
      const isFunctionalGroup = FunctionalGroup.isFunctionalGroup(sgroup)
      const isSGroupFound = sgroup.atoms.includes(atomId)
      if (!isFunctionalGroup || !isSGroupFound) {
        continue
      }
      for (const bond of bonds.values()) {
        const isBondBeginInSGroupAndBondEndOutside =
          bond.begin === atomId &&
          !isAtomInSameFunctionalGroup(bond.end, sgroup)
        const isBondEndInSGroupAndBondBeginOutside =
          bond.end === atomId &&
          !isAtomInSameFunctionalGroup(bond.begin, sgroup)
        const isAttachmentBond =
          isBondBeginInSGroupAndBondEndOutside ||
          isBondEndInSGroupAndBondBeginOutside
        if (isAttachmentBond) {
          return true
        }
      }
    }
    return false
  }

  static isFirstAtomInFunctionalGroup(sgroups, aid): boolean {
    for (const sg of sgroups.values()) {
      if (FunctionalGroup.isFunctionalGroup(sg) && aid === sg.atoms[0]) {
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
