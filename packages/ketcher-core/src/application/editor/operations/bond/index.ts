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

import { ReBond, ReStruct } from '../../../render';

import { BaseOperation } from '../base';
import { Bond } from 'domain/entities';
import { OperationPriority, OperationType } from '../OperationType';

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  bond: any;
  begin: any;
  end: any;
  bid: any;
};

class BondAdd extends BaseOperation {
  data: Data;

  constructor(begin?: any, end?: any, bond?: any) {
    super(OperationType.BOND_ADD, OperationPriority.BOND_ADD);
    this.data = { bond, begin, end, bid: null };
  }

  execute(restruct: ReStruct) {
    const { begin, bond, end } = this.data;
    // eslint-disable-line max-statements
    const struct = restruct.molecule;

    if (begin === end) {
      throw new Error('Distinct atoms expected');
    }

    BaseOperation.invalidateAtom(restruct, begin, 1);
    BaseOperation.invalidateAtom(restruct, end, 1);

    const pp: {
      type: number;
      begin: number;
      end: number;
    } = {
      type: 0,
      begin: 0,
      end: 0,
    };

    if (bond) {
      Object.keys(bond).forEach((p) => {
        pp[p] = bond[p];
      });
    }

    pp.type = pp.type || Bond.PATTERN.TYPE.SINGLE;
    pp.begin = begin;
    pp.end = end;

    const newBond = new Bond(pp);
    if (typeof this.data.bid === 'number') {
      struct.bonds.set(this.data.bid, newBond);
    } else {
      this.data.bid = struct.bonds.add(newBond);
    }

    const { bid } = this.data;
    const structBond = struct.bonds.get(bid)!;

    struct.bondInitHalfBonds(bid);
    struct.atomAddNeighbor(structBond.hb1);
    struct.atomAddNeighbor(structBond.hb2);

    // notifyBondAdded
    restruct.bonds.set(bid, new ReBond(structBond));
    restruct.markBond(bid, 1);
  }

  invert() {
    const inverted = new BondDelete();
    inverted.data = this.data;
    return inverted;
  }
}

class BondDelete extends BaseOperation {
  data: Data;

  constructor(bondId?: any) {
    super(OperationType.BOND_DELETE, OperationPriority.BOND_DELETE);
    this.data = { bid: bondId, bond: null, begin: null, end: null };
  }

  execute(restruct: ReStruct) {
    const { bid } = this.data;

    // eslint-disable-line max-statements
    const struct = restruct.molecule;
    if (!this.data.bond) {
      this.data.bond = struct.bonds.get(bid);
      this.data.begin = this.data.bond.begin;
      this.data.end = this.data.bond.end;
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

    const structBond = struct.bonds.get(bid)!;
    [structBond.hb1, structBond.hb2].forEach((hbid) => {
      const halfBond = struct.halfBonds.get(hbid!);
      if (!halfBond) {
        return;
      }

      const atom = struct.atoms.get(halfBond.begin)!;
      const pos = atom.neighbors.indexOf(hbid!);
      const prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length;
      const next = (pos + 1) % atom.neighbors.length;
      struct.setHbNext(atom.neighbors[prev], atom.neighbors[next]);
      atom.neighbors.splice(pos, 1);
    });
    struct.halfBonds.delete(structBond.hb1!);
    struct.halfBonds.delete(structBond.hb2!);

    struct.bonds.delete(bid);
  }

  invert() {
    const inverted = new BondAdd();
    inverted.data = this.data;
    return inverted;
  }
}

export { BondAdd, BondDelete };
export * from './BondAttr';
export * from './BondMove';
