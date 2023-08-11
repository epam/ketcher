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

import { ReStruct } from '../../../render';

import { BaseOperation } from '../base';
import { OperationType } from '../OperationType';
import { PolymerBond } from 'domain/entities/PolymerBond';

type Data = {
  polymerBond: PolymerBond;
};

class PolymerBondDelete extends BaseOperation {
  data: Data;

  constructor(polymerBond: PolymerBond) {
    super(OperationType.POLYMER_BOND_DELETE);
    this.data = { polymerBond };
  }

  execute(restruct: ReStruct) {
    const { polymerBond } = this.data;
    const struct = restruct.molecule;
    const polymerBondRenderer = restruct.polymerBonds.get(polymerBond.id);
    struct.polymerBonds.delete(polymerBond.id);
    polymerBond.firstMonomer.turnOffSelection();
    polymerBond.firstMonomer.removePotentialBonds();
    polymerBond.secondMonomer?.turnOffSelection();
    polymerBond.secondMonomer?.removePotentialBonds();
    polymerBondRenderer?.remove();
    restruct.polymerBonds.delete(polymerBond.id);
  }

  invert() {
    const inverted = new PolymerBondDelete(this.data.polymerBond);
    inverted.data = this.data;
    return inverted;
  }
}

export { PolymerBondDelete };
