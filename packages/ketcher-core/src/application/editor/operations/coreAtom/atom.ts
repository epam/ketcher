/* eslint-disable @typescript-eslint/no-unused-vars */
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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { Atom } from 'domain/entities/CoreAtom';
import {
  Bond as MicromoleculesBond,
  Atom as MicromoleculesAtom,
} from 'domain/entities';
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

  constructor(
    public addAtomChangeModel: (atom?: Atom) => Atom,
    public deleteAtomChangeModel: (atom: Atom) => void,
  ) {
    this.atom = this.addAtomChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.atom = this.addAtomChangeModel(this.atom);
    renderersManager.addAtom(this.atom);

    if (this.deletedMoleculeStructItems) {
      addAtomToMoleculeStruct(
        this.atom,
        this.deletedMoleculeStructItems.atomInMoleculeStruct,
        this.deletedMoleculeStructItems.bondsInMoleculeStruct,
      );
    }
  }

  public invert(renderersManager: RenderersManager) {
    if (this.atom) {
      this.deleteAtomChangeModel(this.atom);
      renderersManager.deleteAtom(this.atom);
    }

    this.deletedMoleculeStructItems = deleteAtomFromMoleculeStruct(this.atom);
  }
}

export class AtomDeleteOperation implements Operation {
  private deletedMoleculeStructItems?: DeletedMoleculeStructItems;

  constructor(
    public atom: Atom,
    public deleteAtomChangeModel: () => void,
    public addAtomChangeModel: (atom?: Atom) => Atom,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteAtomChangeModel();
    renderersManager.deleteAtom(this.atom);

    this.deletedMoleculeStructItems = deleteAtomFromMoleculeStruct(this.atom);
  }

  public invert() {
    this.addAtomChangeModel(this.atom);

    if (this.deletedMoleculeStructItems) {
      addAtomToMoleculeStruct(
        this.atom,
        this.deletedMoleculeStructItems.atomInMoleculeStruct,
        this.deletedMoleculeStructItems.bondsInMoleculeStruct,
      );
    }
  }

  public invertAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.addAtom(this.atom);
  }
}
