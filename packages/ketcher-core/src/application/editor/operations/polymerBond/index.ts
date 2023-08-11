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
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';

type Data = {
  firstMonomer;
  startPosition;
  endPosition;
};

class PolymerBondAdd extends BaseOperation {
  data: Data;

  constructor(data: Data) {
    super(OperationType.POLYMER_BOND_ADD);
    this.data = data;
  }

  execute(restruct: ReStruct) {
    const { firstMonomer, startPosition, endPosition } = this.data;
    const struct = restruct.molecule;
    const polymerBond = new PolymerBond(firstMonomer);
    const polymerBondRenderer = new PolymerBondRenderer(polymerBond);
    struct.polymerBonds.set(polymerBond.id, polymerBond);
    restruct.polymerBonds.set(polymerBond.id, polymerBondRenderer);
    firstMonomer.setPotentialBond(
      firstMonomer.firstFreeAttachmentPoint,
      polymerBond,
    );
    polymerBond.moveBondStartAbsolute(startPosition.x, startPosition.y);
    polymerBond.moveBondEndAbsolute(endPosition.x, endPosition.y);
  }

  invert() {
    const inverted = new PolymerBondAdd(this.data.firstMonomer);
    inverted.data = this.data;
    return inverted;
  }
}

export { PolymerBondAdd };
