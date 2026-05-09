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

import { ReBond, ReStruct } from '../../../render';

import { BaseOperation } from '../BaseOperation';
import { Bond, BondAttributes } from 'domain/entities';
import { OperationPriority, OperationType } from '../OperationType';

type Data = {
  bond: Partial<BondAttributes> | null;
  begin: number | null;
  end: number | null;
  bid: number | null;
  needInvalidateAtoms?: boolean;
};

class BondAdd extends BaseOperation {
  data: Data;
  static InverseConstructor: new (bondId?: number) => BaseOperation;

  constructor(
    begin?: number,
    end?: number,
    bond?: Partial<BondAttributes>,
    needInvalidateAtoms = true,
  ) {
    super(OperationType.BOND_ADD, OperationPriority.BOND_ADD);
    this.data = {
      bond: bond ?? null,
      begin: begin ?? null,
      end: end ?? null,
      bid: null,
      needInvalidateAtoms,
    };
  }

  execute(restruct: ReStruct) {
    const { begin, bond, end } = this.data;
    // eslint-disable-line max-statements
    const struct = restruct.molecule;

    if (begin === end) {
      throw new Error('Distinct atoms expected');
    }

    if (this.data.needInvalidateAtoms) {
      BaseOperation.invalidateAtom(restruct, begin as number, 1);
      BaseOperation.invalidateAtom(restruct, end as number, 1);
    }

    const pp: BondAttributes = {
      type: Bond.PATTERN.TYPE.SINGLE,
      begin: begin as number,
      end: end as number,
      ...(bond ?? {}),
    };
    pp.type = pp.type || Bond.PATTERN.TYPE.SINGLE;
    pp.begin = begin as number;
    pp.end = end as number;

    const newBond = new Bond(pp);
    let bid: number;
    if (typeof this.data.bid === 'number') {
      bid = this.data.bid;
      struct.bonds.set(bid, newBond);
    } else {
      bid = struct.bonds.add(newBond);
      this.data.bid = bid;
    }

    const structBond = struct.bonds.get(bid);
    if (!structBond) return;

    struct.bondInitHalfBonds(bid);
    struct.atomAddNeighbor(structBond.hb1);
    struct.atomAddNeighbor(structBond.hb2);

    // notifyBondAdded
    restruct.bonds.set(bid, new ReBond(structBond));
    restruct.markBond(bid, 1);
  }

  invert() {
    const inverted = new BondAdd.InverseConstructor();
    inverted.data = this.data;
    return inverted;
  }
}

export { BondAdd };
