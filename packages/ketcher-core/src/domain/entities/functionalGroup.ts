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
import { ReSGroup } from 'application/render'
import assert from 'assert'
import { FunctionalGroupsProvider } from '../helpers'
import { Bond } from './bond'
import { Pool } from './pool'
import { SGroup } from './sgroup'
import { Struct } from './struct'

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
    const functionalGroups = provider.getFunctionalGroupsList()
    const {
      data: { name },
      type
    } = sgroup
    return (
      type === 'SUP' &&
      (functionalGroups.some((type) => type.name === name) ||
        SGroup.isSaltOrSolvent(name))
    )
  }

  static getFunctionalGroupByName(searchName: string): Struct | null {
    const provider = FunctionalGroupsProvider.getInstance()
    const functionalGroups = provider.getFunctionalGroupsList()

    let foundGroup
    if (searchName) {
      foundGroup = functionalGroups.find(({ name, abbreviation }) => {
        return name === searchName || abbreviation === searchName
      })
    }

    return foundGroup || null
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

  static findFunctionalGroupByAtom(
    functionalGroups: Pool<FunctionalGroup>,
    atomId: number
  ): number | null

  static findFunctionalGroupByAtom(
    functionalGroups: Pool<FunctionalGroup>,
    atomId: number,
    isFunctionalGroupReturned: true
  ): FunctionalGroup | null

  static findFunctionalGroupByAtom(
    functionalGroups: Pool<FunctionalGroup>,
    atomId: number,
    isFunctionalGroupReturned?: boolean
  ): number | FunctionalGroup | null {
    for (const fg of functionalGroups.values()) {
      if (fg.relatedSGroup.atoms.includes(atomId))
        return isFunctionalGroupReturned ? fg : fg.relatedSGroupId
    }
    return null
  }

  static findFunctionalGroupByBond(
    molecule: Struct,
    functionalGroups: Pool<FunctionalGroup>,
    bondId: number | null
  ): number | null

  static findFunctionalGroupByBond(
    molecule: Struct,
    functionalGroups: Pool<FunctionalGroup>,
    bondId: number | null,
    isFunctionalGroupReturned: true
  ): FunctionalGroup | null

  static findFunctionalGroupByBond(
    molecule: Struct,
    functionalGroups: Pool<FunctionalGroup>,
    bondId: number | null,
    isFunctionalGroupReturned?: boolean
  ): FunctionalGroup | number | null {
    for (const fg of functionalGroups.values()) {
      const bonds = SGroup.getBonds(molecule, fg.relatedSGroup)
      if (bonds.includes(bondId)) {
        return isFunctionalGroupReturned ? fg : fg.relatedSGroupId
      }
    }
    return null
  }

  static findFunctionalGroupBySGroup(
    functionalGroups: Pool<FunctionalGroup>,
    sGroup?: SGroup
  ) {
    const key = functionalGroups.find(
      (_, functionalGroup) => functionalGroup.relatedSGroupId === sGroup?.id
    )
    return key !== null ? functionalGroups.get(key) : undefined
  }

  static clone(functionalGroup: FunctionalGroup): FunctionalGroup {
    return new FunctionalGroup(functionalGroup.#sgroup)
  }

  static isAttachmentBond(sgroup, { begin, end }) {
    return (
      (sgroup.atoms.includes(begin) && !sgroup.atoms.includes(end)) ||
      (sgroup.atoms.includes(end) && !sgroup.atoms.includes(begin))
    )
  }

  // Checks, if S-Group is standalone or attached to some other structure
  static isAttachedSGroup(sgroup, molecule) {
    const { bonds } = molecule
    for (const bond of bonds.values()) {
      if (FunctionalGroup.isAttachmentBond(sgroup, bond)) {
        return true
      }
    }
    return false
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
      const isSGroup =
        FunctionalGroup.isFunctionalGroup(sgroup) || SGroup.isSuperAtom(sgroup)
      const isSGroupFound = sgroup.atoms.includes(atomId)
      if (!isSGroup || !isSGroupFound) {
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
      // if atom in S-Group, which is not attached to any structure, then
      // atoms[0] is considered as attachment point
      if (!this.isAttachedSGroup(sgroup, molecule)) {
        return sgroup.atoms[0] === atomId
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
    bond: Bond,
    sGroups: Map<number, ReSGroup> | Pool<SGroup>,
    functionalGroups: Pool<FunctionalGroup>
  ) {
    return [...sGroups.values()].some((sGroup) => {
      const sGroupId = 'item' in sGroup ? sGroup.item.id : sGroup.id
      const atomsInSGroup = 'item' in sGroup ? sGroup.item.atoms : sGroup.atoms
      const isContracted = FunctionalGroup.isContractedFunctionalGroup(
        sGroupId,
        functionalGroups
      )
      return (
        isContracted &&
        atomsInSGroup.includes(bond.begin) &&
        atomsInSGroup.includes(bond.end)
      )
    })
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
