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

import { Atom } from './atom';
import { Pile } from './pile';
import { Struct } from './struct';
import { Vec2 } from './vec2';

enum CIP {
  E = 'E',
  Z = 'Z',
  M = 'M',
  P = 'P',
}

export interface BondAttributes {
  reactingCenterStatus?: number;
  topology?: number;
  stereo?: number;
  xxx?: string;
  type: number;
  end: number;
  begin: number;
  cip?: CIP | null;
  isPreview?: boolean;
}

export class Bond {
  static PATTERN = {
    TYPE: {
      SINGLE: 1,
      DOUBLE: 2,
      TRIPLE: 3,
      AROMATIC: 4,
      SINGLE_OR_DOUBLE: 5,
      SINGLE_OR_AROMATIC: 6,
      DOUBLE_OR_AROMATIC: 7,
      ANY: 8,
      DATIVE: 9,
      HYDROGEN: 10,
    },

    STEREO: {
      NONE: 0,
      UP: 1,
      EITHER: 4,
      DOWN: 6,
      CIS_TRANS: 3,
    },

    TOPOLOGY: {
      EITHER: 0,
      RING: 1,
      CHAIN: 2,
    },

    REACTING_CENTER: {
      NOT_CENTER: -1,
      UNMARKED: 0,
      CENTER: 1,
      UNCHANGED: 2,
      MADE_OR_BROKEN: 4,
      ORDER_CHANGED: 8,
      MADE_OR_BROKEN_AND_CHANGED: 12,
    },
  };

  static attrlist = {
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo: Bond.PATTERN.STEREO.NONE,
    topology: Bond.PATTERN.TOPOLOGY.EITHER,
    reactingCenterStatus: Bond.PATTERN.REACTING_CENTER.UNMARKED,
    cip: null,
  };

  begin: number;
  end: number;
  readonly type: number;
  readonly xxx: string;
  readonly stereo: number;
  readonly topology: number;
  readonly reactingCenterStatus: number;
  len: number;
  sb: number;
  sa: number;
  cip?: CIP | null;
  hb1?: number;
  hb2?: number;
  angle: number;
  center: Vec2;
  isPreview: boolean;

  constructor(attributes: BondAttributes) {
    this.begin = attributes.begin;
    this.end = attributes.end;
    this.type = attributes.type;
    this.xxx = attributes.xxx || '';
    this.stereo = Bond.PATTERN.STEREO.NONE;
    this.topology = Bond.PATTERN.TOPOLOGY.EITHER;
    this.reactingCenterStatus = 0;
    this.cip = attributes.cip ?? null;
    this.len = 0;
    this.sb = 0;
    this.sa = 0;
    this.angle = 0;
    this.isPreview = false;

    if (attributes.stereo) this.stereo = attributes.stereo;
    if (attributes.topology) this.topology = attributes.topology;
    if (attributes.reactingCenterStatus) {
      this.reactingCenterStatus = attributes.reactingCenterStatus;
    }

    this.center = new Vec2();
  }

  static getAttrHash(bond: Bond) {
    const attrs = {};
    for (const attr in Bond.attrlist) {
      if (bond[attr] || attr === 'stereo') {
        attrs[attr] = bond[attr];
      }
    }
    return attrs;
  }

  static getBondNeighbourIds(struct: Struct, bondId: number) {
    const bond = struct.bonds.get(bondId)!;
    const { begin, end } = bond;
    const beginBondIds = Atom.getConnectedBondIds(struct, begin).filter(
      (id) => id !== bondId,
    );
    const endBondIds = Atom.getConnectedBondIds(struct, end).filter(
      (id) => id !== bondId,
    );
    return { beginBondIds, endBondIds };
  }

  static getFusingConditions(bond: Bond, bondBegin: Bond, bondEnd: Bond) {
    const { DOUBLE, SINGLE } = this.PATTERN.TYPE;
    const isFusingToDoubleBond =
      bondBegin.type === SINGLE &&
      bond.type === DOUBLE &&
      bondEnd.type === SINGLE;
    const isFusingToSingleBond =
      bondBegin.type === DOUBLE &&
      bond.type === SINGLE &&
      bondEnd.type === DOUBLE;
    const isFusingDoubleSingleSingle =
      bondBegin.type === DOUBLE &&
      bond.type === SINGLE &&
      bondEnd.type === SINGLE;
    const isFusingSingleSingleDouble =
      bondBegin.type === SINGLE &&
      bond.type === SINGLE &&
      bondEnd.type === DOUBLE;
    const isAllSingle =
      bondBegin.type === SINGLE &&
      bond.type === SINGLE &&
      bondEnd.type === SINGLE;
    return {
      isFusingToSingleBond,
      isFusingToDoubleBond,
      isFusingDoubleSingleSingle,
      isFusingSingleSingleDouble,
      isAllSingle,
    };
  }

  static getBenzeneConnectingBondType(
    bond: Bond,
    bondBegin: Bond,
    bondEnd: Bond,
  ): number | null {
    const { DOUBLE, SINGLE } = this.PATTERN.TYPE;
    const { isFusingToSingleBond, isFusingToDoubleBond } =
      Bond.getFusingConditions(bond, bondBegin, bondEnd);

    if (isFusingToDoubleBond) {
      return DOUBLE;
    } else if (isFusingToSingleBond) {
      return SINGLE;
    }
    return null;
  }

  static getCyclopentadieneFusingBondType(
    bond: Bond,
    bondBegin: Bond,
    bondEnd: Bond,
  ): number | null {
    const { DOUBLE, SINGLE } = this.PATTERN.TYPE;
    const {
      isFusingToSingleBond,
      isFusingToDoubleBond,
      isFusingDoubleSingleSingle,
      isAllSingle,
    } = Bond.getFusingConditions(bond, bondBegin, bondEnd);

    if (isFusingToDoubleBond) {
      return DOUBLE;
    } else if (
      isFusingToSingleBond ||
      isAllSingle ||
      isFusingDoubleSingleSingle
    ) {
      return SINGLE;
    }
    return null;
  }

  static getCyclopentadieneDoubleBondIndexes(
    bond: Bond,
    bondBegin: Bond,
    bondEnd: Bond,
  ) {
    const {
      isFusingToSingleBond,
      isFusingToDoubleBond,
      isFusingDoubleSingleSingle,
    } = Bond.getFusingConditions(bond, bondBegin, bondEnd);

    if (isFusingToSingleBond || isFusingToDoubleBond) {
      return [1];
    }

    if (isFusingDoubleSingleSingle) {
      return [2, 3];
    }

    return [1, 4];
  }

  static attrGetDefault(attr: string) {
    if (attr in Bond.attrlist) {
      return Bond.attrlist[attr];
    }
  }

  hasRxnProps(): boolean {
    return !!this.reactingCenterStatus;
  }

  getCenter(struct: any): Vec2 {
    const p1 = struct.atoms.get(this.begin).pp;
    const p2 = struct.atoms.get(this.end).pp;
    return Vec2.lc2(p1, 0.5, p2, 0.5);
  }

  getDir(struct: any): Vec2 {
    const p1 = struct.atoms.get(this.begin)!.pp;
    const p2 = struct.atoms.get(this.end)!.pp;
    return p2.sub(p1).normalized();
  }

  clone(aidMap?: Map<number, number> | null): Bond {
    const cp = new Bond(this);
    if (aidMap) {
      cp.begin = aidMap.get(cp.begin)!;
      cp.end = aidMap.get(cp.end)!;
    }
    return cp;
  }

  getAttachedSGroups(struct: Struct) {
    const sGroupsWithBeginAtom =
      struct.atoms.get(this.begin)?.sgs || new Pile();
    const sGroupsWithEndAtom = struct.atoms.get(this.end)?.sgs || new Pile();
    return sGroupsWithBeginAtom?.intersection(sGroupsWithEndAtom);
  }
}
