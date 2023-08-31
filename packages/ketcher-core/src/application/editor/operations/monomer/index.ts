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
  monomer: MonomerItemType;
  position: Vec2;
};

class MonomerAdd extends BaseOperation {
  data: Data;

  constructor(monomer: MonomerItemType, position: Vec2) {
    super(OperationType.ATOM_ADD);
    this.data = { monomer, position };
  }

  execute(restruct: ReStruct) {
    const { monomer, position } = this.data;

    const struct = restruct.molecule;

    const [Monomer, MonomerRenderer] = monomerFactory(monomer);
    const newMonomer = new Monomer(monomer, position);
    const monomerRenderer = new MonomerRenderer(newMonomer);
    struct.monomers.set(newMonomer.id, newMonomer);
    restruct.monomers.set(newMonomer.id, monomerRenderer);
  }

  invert() {
    const inverted = new MonomerAdd(this.data.monomer, this.data.position);
    inverted.data = this.data;
    return inverted;
  }
}

export { MonomerAdd };
