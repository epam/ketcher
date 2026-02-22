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
import type { ReSGroup } from 'application/render';
import assert from 'assert';
import { FunctionalGroupsProvider, SaltsAndSolventsProvider } from '../helpers';
import type { Atom } from './atom';
import type { Bond } from './bond';
import { Pool } from './pool';
import type { SGroup } from './sgroup';
import { Struct } from './struct';
import type { HalfBond } from './halfBond';

const isSaltOrSolvent = (moleculeName: string): boolean => {
  const saltsAndSolventsProvider = SaltsAndSolventsProvider.getInstance();
  const saltsAndSolvents = saltsAndSolventsProvider.getSaltsAndSolventsList();
  return saltsAndSolvents.some(
    ({ name, abbreviation }) =>
      name === moleculeName || moleculeName === abbreviation,
  );
};

const getSGroupBonds = (molecule: Struct, sgroup: SGroup): number[] => {
  const atoms = sgroup.allAtoms
    ? Array.from(molecule.atoms.keys())
    : (sgroup.atoms as number[]);
  const bonds: number[] = [];

  molecule.bonds.forEach((bond, bid) => {
    if (atoms.includes(bond.begin) && atoms.includes(bond.end)) {
      bonds.push(bid);
    }
  });

  return bonds;
};

const isSGroupLike = (
  sgroup: unknown,
): sgroup is Pick<SGroup, 'functionalGroup' | 'atoms' | 'data'> =>
  Boolean(
    sgroup &&
      typeof sgroup === 'object' &&
      'functionalGroup' in sgroup &&
      'atoms' in sgroup &&
      'data' in sgroup,
  );

export class FunctionalGroup {
  readonly #sgroup: SGroup;

  constructor(sgroup: SGroup) {
    assert(sgroup != null);

    this.#sgroup = sgroup;
    sgroup.setFunctionalGroup(this);
  }

  get name(): string {
    return this.#sgroup.data.name;
  }

  get relatedSGroupId(): number {
    return this.#sgroup.id;
  }

  get isExpanded(): boolean {
    return this.#sgroup.data.expanded;
  }

  get relatedSGroup(): SGroup {
    return this.#sgroup;
  }

  static isFunctionalGroup(sgroup): boolean {
    const provider = FunctionalGroupsProvider.getInstance();
    const functionalGroups = provider.getFunctionalGroupsList();
    const {
      data: { name },
      type,
    } = sgroup;
    return (
      type === 'SUP' &&
      (functionalGroups.some((type) => type.name === name) ||
        isSaltOrSolvent(name))
    );
  }

  static atomsInFunctionalGroup(
    functionalGroups,
    atom,
    isNeedCheckForGroups = false,
  ): number | null {
    if (functionalGroups.size === 0) {
      return null;
    }
    for (const fg of functionalGroups.values()) {
      const isFunctionalGroup = isNeedCheckForGroups
        ? this.isFunctionalGroup(fg.relatedSGroup)
        : true;
      if (isFunctionalGroup && fg.relatedSGroup.atoms.includes(atom))
        return atom;
    }
    return null;
  }

  static bondsInFunctionalGroup(
    molecule,
    functionalGroups,
    bond,
  ): number | null {
    if (functionalGroups.size === 0) {
      return null;
    }
    for (const fg of functionalGroups.values()) {
      const bonds = getSGroupBonds(molecule, fg.relatedSGroup);
      if (bonds.includes(bond)) return bond;
    }
    return null;
  }

  static isRGroupAttachmentPointInsideFunctionalGroup(
    molecule: Struct,
    id: number,
  ) {
    const rgroupAttachmentPoint = molecule.rgroupAttachmentPoints.get(id);
    assert(rgroupAttachmentPoint != null);
    const attachedAtom = rgroupAttachmentPoint.atomId;
    return FunctionalGroup.atomsInFunctionalGroup(
      molecule.functionalGroups,
      attachedAtom,
    );
  }

  static findFunctionalGroupByAtom(
    functionalGroups: Pool<FunctionalGroup>,
    atomId: number,
  ): number | null;

  static findFunctionalGroupByAtom(
    functionalGroups: Pool<FunctionalGroup>,
    atomId: number,
    isFunctionalGroupReturned: true,
  ): FunctionalGroup | null;

  static findFunctionalGroupByAtom(
    functionalGroups: Pool<FunctionalGroup>,
    atomId: number,
    isFunctionalGroupReturned?: boolean,
  ): number | FunctionalGroup | null {
    for (const fg of functionalGroups.values()) {
      if (
        !fg.relatedSGroup.isSuperatomWithoutLabel &&
        fg.relatedSGroup.atoms.includes(atomId)
      )
        return isFunctionalGroupReturned ? fg : fg.relatedSGroupId;
    }
    return null;
  }

  static findFunctionalGroupByBond(
    molecule: Struct,
    functionalGroups: Pool<FunctionalGroup>,
    bondId: number | null,
  ): number | null;

  static findFunctionalGroupByBond(
    molecule: Struct,
    functionalGroups: Pool<FunctionalGroup>,
    bondId: number | null,
    isFunctionalGroupReturned: true,
  ): FunctionalGroup | null;

  static findFunctionalGroupByBond(
    molecule: Struct,
    functionalGroups: Pool<FunctionalGroup>,
    bondId: number | null,
    isFunctionalGroupReturned?: boolean,
  ): FunctionalGroup | number | null {
    for (const fg of functionalGroups.values()) {
      const bonds = getSGroupBonds(molecule, fg.relatedSGroup);
      if (
        bondId !== null &&
        !fg.relatedSGroup.isSuperatomWithoutLabel &&
        bonds.includes(bondId)
      ) {
        return isFunctionalGroupReturned ? fg : fg.relatedSGroupId;
      }
    }
    return null;
  }

  static findFunctionalGroupBySGroup(
    functionalGroups: Pool<FunctionalGroup>,
    sGroup?: SGroup,
  ) {
    const key = functionalGroups.find(
      (_, functionalGroup) => functionalGroup.relatedSGroupId === sGroup?.id,
    );
    return key !== null ? functionalGroups.get(key) : undefined;
  }

  static clone(functionalGroup: FunctionalGroup): FunctionalGroup {
    return new FunctionalGroup(functionalGroup.#sgroup);
  }

  static isAtomInContractedFunctionalGroup(
    atom: Atom,
    sgroups: Map<number, ReSGroup> | Pool<SGroup>,
    functionalGroups,
  ): boolean {
    return [...atom.sgs.values()].some((sgid) => {
      const sgroup = sgroups.get(sgid);

      if (!sgroup) {
        return false;
      }

      return FunctionalGroup.isContractedFunctionalGroup(
        'item' in sgroup ? sgroup.item : sgroup,
        functionalGroups,
      );
    });
  }

  static isBondInContractedFunctionalGroup(
    bond: Bond,
    sGroups: Map<number, ReSGroup> | Pool<SGroup>,
    functionalGroups: Pool<FunctionalGroup>,
  ) {
    return [...sGroups.values()].some((_sGroup) => {
      const sGroup = 'item' in _sGroup ? _sGroup?.item : _sGroup;
      const atomsInSGroup = sGroup?.atoms;
      const isContracted = FunctionalGroup.isContractedFunctionalGroup(
        sGroup,
        functionalGroups,
      );
      return (
        isContracted &&
        atomsInSGroup.includes(bond.begin) &&
        atomsInSGroup.includes(bond.end)
      );
    });
  }

  static isHalfBondInContractedFunctionalGroup(
    halfBond: HalfBond,
    struct: Struct,
  ) {
    const bond = struct.bonds.get(halfBond.bid);
    assert(bond != null);
    return this.isBondInContractedFunctionalGroup(
      bond,
      struct.sgroups,
      struct.functionalGroups,
    );
  }

  static isContractedFunctionalGroup(sgroup, functionalGroups): boolean {
    let isFunctionalGroup = false;
    let expanded = false;

    if (isSGroupLike(sgroup)) {
      if (sgroup.functionalGroup) {
        isFunctionalGroup = true;
        expanded = sgroup.functionalGroup.isExpanded;
      }
    } else {
      functionalGroups.forEach((fg) => {
        if (fg.relatedSGroupId === sgroup) {
          isFunctionalGroup = true;
          expanded = fg.isExpanded;
        }
      });
    }
    return !expanded && isFunctionalGroup;
  }
}
