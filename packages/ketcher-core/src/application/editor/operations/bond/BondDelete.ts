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

import { ReStruct } from '../../../render';

import { BaseOperation } from '../BaseOperation';
import { BondAttributes } from 'domain/entities';
import { OperationPriority, OperationType } from '../OperationType';
import { BondAdd } from './BondAdd';

type Data = {
  bond: Partial<BondAttributes> | null;
  begin: number | null;
  end: number | null;
  bid: number | null;
  needInvalidateAtoms?: boolean;
};

class BondDelete extends BaseOperation {
  data: Data;

  constructor(bondId?: number) {
    super(OperationType.BOND_DELETE, OperationPriority.BOND_DELETE);
    this.data = {
      bid: bondId ?? null,
      bond: null,
      begin: null,
      end: null,
      needInvalidateAtoms: true,
    };
  }

  execute(restruct: ReStruct) {
    const { bid } = this.data;
    if (bid === null) return;

    // eslint-disable-line max-statements
    const struct = restruct.molecule;
    if (!this.data.bond) {
      const bondFromStruct = struct.bonds.get(bid);
      if (!bondFromStruct) return;
      this.data.bond = bondFromStruct;
      this.data.begin = bondFromStruct.begin;
      this.data.end = bondFromStruct.end;
    }

    BaseOperation.invalidateBond(restruct, bid);

    // notifyBondRemoved
    const rebond = restruct.bonds.get(bid);
    if (!rebond) return;
    [rebond.b.hb1, rebond.b.hb2].forEach((hbid) => {
      if (hbid === undefined) return;
      const halfBond = restruct.molecule.halfBonds.get(hbid);
      if (halfBond && halfBond.loop >= 0) {
        restruct.loopRemove(halfBond.loop);
      }
    }, restruct);
    restruct.clearVisel(rebond.visel);
    restruct.bonds.delete(bid);
    restruct.markItemRemoved();

    const structBond = struct.bonds.get(bid);
    if (!structBond) return;
    [structBond.hb1, structBond.hb2].forEach((hbid) => {
      if (hbid === undefined) return;
      const halfBond = struct.halfBonds.get(hbid);
      if (!halfBond) {
        return;
      }

      const atom = struct.atoms.get(halfBond.begin);
      if (!atom) return;
      const pos = atom.neighbors.indexOf(hbid);
      const prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length;
      const next = (pos + 1) % atom.neighbors.length;
      struct.setHbNext(atom.neighbors[prev], atom.neighbors[next]);
      atom.neighbors.splice(pos, 1);
    });
    if (structBond.hb1 !== undefined) struct.halfBonds.delete(structBond.hb1);
    if (structBond.hb2 !== undefined) struct.halfBonds.delete(structBond.hb2);

    struct.bonds.delete(bid);
  }

  invert() {
    const inverted = new BondAdd();
    inverted.data = this.data;
    return inverted;
  }
}

export { BondDelete };
