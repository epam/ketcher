/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Operation } from 'domain/entities/Operation';
import type { Atom } from 'domain/entities/CoreAtom';
import type { Bond as MicromoleculesBond } from 'domain/entities/bond';
import type { Atom as MicromoleculesAtom } from 'domain/entities/atom';
import { SGroup } from 'domain/entities/sgroup';
import {
  getSGroupBracketContext,
  SGroupBracketPositionChanges,
} from '../sgroup/sgroupBracketPositions';
import { KetcherLogger } from 'utilities';

interface BondWithIdInMicromolecules {
  bondId: number;
  bond: MicromoleculesBond;
}

interface DeletedMoleculeStructItems {
  atomInMoleculeStruct: MicromoleculesAtom;
  bondsInMoleculeStruct: BondWithIdInMicromolecules[];
}

function addAtomToMoleculeStruct(
  atom: Atom,
  atomInMoleculeStruct: MicromoleculesAtom,
  bondsInMoleculeStruct: BondWithIdInMicromolecules[] = [],
) {
  const moleculeStruct = atom.monomer.monomerItem.struct;

  moleculeStruct.atoms.set(atom.atomIdInMicroMode, atomInMoleculeStruct);

  bondsInMoleculeStruct.forEach(({ bondId, bond }) => {
    moleculeStruct.bonds.set(bondId, bond);
  });
}

function deleteAtomFromMoleculeStruct(atom: Atom) {
  const moleculeStruct = atom.monomer.monomerItem.struct;
  const atomInMoleculeStruct = moleculeStruct.atoms.get(atom.atomIdInMicroMode);

  if (!atomInMoleculeStruct) {
    KetcherLogger.warn('Atom is not found in molecule struct during deletion');

    return;
  }

  const bondsInMoleculeStruct = moleculeStruct.bonds.filter((_, bond) => {
    return (
      bond.begin === atom.atomIdInMicroMode ||
      bond.end === atom.atomIdInMicroMode
    );
  });

  moleculeStruct.atoms.delete(atom.atomIdInMicroMode);

  bondsInMoleculeStruct.forEach((_, bondId) => {
    moleculeStruct.bonds.delete(bondId);
  });

  return {
    atomInMoleculeStruct,
    bondsInMoleculeStruct: [...bondsInMoleculeStruct.entries()].map(
      ([bondId, bond]) => {
        return { bondId, bond };
      },
    ),
  };
}
export class AtomAddOperation implements Operation {
  public atom: Atom;
  private deletedMoleculeStructItems?: DeletedMoleculeStructItems;
  public priority = 2;

  constructor(
    public addAtomChangeModel: (atom?: Atom) => Atom,
    public deleteAtomChangeModel: (atom: Atom) => void,
  ) {
    this.atom = this.addAtomChangeModel();
  }

  public execute() {
    this.atom = this.addAtomChangeModel(this.atom);

    if (this.deletedMoleculeStructItems) {
      addAtomToMoleculeStruct(
        this.atom,
        this.deletedMoleculeStructItems.atomInMoleculeStruct,
        this.deletedMoleculeStructItems.bondsInMoleculeStruct,
      );
    }
  }

  public invert() {
    if (this.atom) {
      this.deleteAtomChangeModel(this.atom);
    }

    this.deletedMoleculeStructItems = deleteAtomFromMoleculeStruct(this.atom);
  }

  public executeAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.addAtom(this.atom);
  }

  public invertAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.deleteAtom(this.atom);
  }
}

export class AtomDeleteOperation implements Operation {
  private deletedMoleculeStructItems?: DeletedMoleculeStructItems;
  private readonly bracketPositions: SGroupBracketPositionChanges;
  private readonly memberships: {
    group: SGroup;
    before: number[];
    after: number[];
  }[];
  public priority = 2;

  constructor(
    public atom: Atom,
    public deleteAtomChangeModel: () => void,
    public addAtomChangeModel: (atom?: Atom) => Atom,
  ) {
    const groups = getSGroupBracketContext(atom)?.groups ?? [];
    this.bracketPositions = new SGroupBracketPositionChanges(groups);
    this.memberships = groups.flatMap((group) => {
      const index = group.atoms.indexOf(atom.atomIdInMicroMode);
      return index < 0
        ? []
        : [
            {
              group,
              before: group.atoms.slice(0, index),
              after: group.atoms.slice(index + 1),
            },
          ];
    });
  }

  public execute() {
    this.deleteAtomChangeModel();
    this.deletedMoleculeStructItems = deleteAtomFromMoleculeStruct(this.atom);
    if (this.deletedMoleculeStructItems) {
      this.memberships.forEach(({ group }) =>
        SGroup.removeAtom(group, this.atom.atomIdInMicroMode),
      );
      this.bracketPositions.toggle(this.atom.monomer.monomerItem.struct);
    }
  }

  public invert() {
    this.addAtomChangeModel(this.atom);

    if (this.deletedMoleculeStructItems) {
      addAtomToMoleculeStruct(
        this.atom,
        this.deletedMoleculeStructItems.atomInMoleculeStruct,
        this.deletedMoleculeStructItems.bondsInMoleculeStruct,
      );
      this.memberships.forEach(({ group, before, after }) => {
        const nextAtom = after.find((atomId) => group.atoms.includes(atomId));
        const previousAtom = [...before]
          .reverse()
          .find((atomId) => group.atoms.includes(atomId));
        const index =
          nextAtom !== undefined
            ? group.atoms.indexOf(nextAtom)
            : previousAtom !== undefined
              ? group.atoms.indexOf(previousAtom) + 1
              : 0;
        group.atoms.splice(index, 0, this.atom.atomIdInMicroMode);
      });
      this.bracketPositions.toggle(this.atom.monomer.monomerItem.struct);
    }
  }

  public invertAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.addAtom(this.atom);
    renderersManager.rerenderSGroups();
  }

  public executeAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.deleteAtom(this.atom);
    renderersManager.rerenderSGroups();
  }
}
