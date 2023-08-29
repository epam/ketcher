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

import { Vec2 } from 'domain/entities';
import { ReStruct } from '../../../render';

import { BaseOperation } from '../base';
import { OperationType } from '../OperationType';
import { MonomerItemType } from 'domain/types';
import { monomerFactory } from './monomerFactory';

type Data = {
  peptide: MonomerItemType;
  position: Vec2;
};

class PeptideAdd extends BaseOperation {
  data: Data;

  constructor(peptide: MonomerItemType, position: Vec2) {
    super(OperationType.ATOM_ADD);
    this.data = { peptide, position };
  }

  execute(restruct: ReStruct) {
    const { peptide, position } = this.data;

    const struct = restruct.molecule;

    const [Monomer, MonomerRenderer] = monomerFactory(peptide);
    const newPeptide = new Monomer(peptide, position);
    const peptideRenderer = new MonomerRenderer(newPeptide);
    struct.peptides.set(newPeptide.id, newPeptide);
    restruct.peptides.set(newPeptide.id, peptideRenderer);
  }

  invert() {
    const inverted = new PeptideAdd(this.data.peptide, this.data.position);
    inverted.data = this.data;
    return inverted;
  }
}

export { PeptideAdd };
