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
import { Bond } from 'domain/entities/CoreBond';
import { Bond as MicromoleculesBond } from 'domain/entities/bond';

function addBondToMoleculeStruct(
  bond: Bond,
  bondInMoleculeStruct: MicromoleculesBond,
) {
  const moleculeStruct = bond.firstAtom.monomer.monomerItem.struct;

  moleculeStruct.bonds.set(bond.bondIdInMicroMode, bondInMoleculeStruct);
}

function deleteBondFromMoleculeStruct(bond: Bond) {
  const moleculeStruct = bond.firstAtom.monomer.monomerItem.struct;
  const bondInMoleculeStruct = moleculeStruct.bonds.get(bond.bondIdInMicroMode);

  moleculeStruct.bonds.delete(bond.bondIdInMicroMode);

  return bondInMoleculeStruct;
}

export class BondAddOperation implements Operation {
  public bond: Bond;
  private bondInMoleculeStruct?: MicromoleculesBond;
  constructor(
    public addBondChangeModel: (bond?: Bond) => Bond,
    public deleteBondChangeModel: (bond: Bond) => void,
  ) {
    this.bond = this.addBondChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.bond = this.addBondChangeModel(this.bond);
    renderersManager.addBond(this.bond);

    if (this.bondInMoleculeStruct) {
      addBondToMoleculeStruct(this.bond, this.bondInMoleculeStruct);
    }
  }

  public invert(renderersManager: RenderersManager) {
    if (this.bond) {
      this.deleteBondChangeModel(this.bond);
      renderersManager.deleteBond(this.bond);
    }

    this.bondInMoleculeStruct = deleteBondFromMoleculeStruct(this.bond);
  }
}

export class BondDeleteOperation implements Operation {
  private bondInMoleculeStruct?: MicromoleculesBond;

  constructor(
    public bond: Bond,
    public deleteBondChangeModel: (bond: Bond) => void,
    public addBondChangeModel: (bond: Bond) => Bond,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteBondChangeModel(this.bond);
    renderersManager.deleteBond(this.bond);

    this.bondInMoleculeStruct = deleteBondFromMoleculeStruct(this.bond);
  }

  public invert() {
    this.addBondChangeModel(this.bond);

    if (this.bondInMoleculeStruct) {
      addBondToMoleculeStruct(this.bond, this.bondInMoleculeStruct);
    }
  }

  public invertAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.addBond(this.bond);
  }
}
