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

import { Bond } from './bond';
import type { Struct } from './struct';
import { assert } from 'utilities';

export class Loop {
  hbs: number[];
  dblBonds: number;
  aromatic: boolean;
  convex: boolean;

  constructor(hbs: Array<number>, struct: Struct, isConvex: boolean) {
    this.hbs = hbs; // set of half-bonds involved
    this.dblBonds = 0; // number of double bonds in the loop
    this.aromatic = true;
    this.convex = isConvex || false;

    hbs.forEach((hb) => {
      const halfBond = struct.halfBonds.get(hb);
      assert(
        halfBond,
        `Expected half-bond ${hb} to exist when constructing loop`,
      );

      const bond: Bond | undefined = struct.bonds.get(halfBond.bid);
      assert(
        bond,
        `Expected bond ${halfBond.bid} to exist for half-bond ${hb} when constructing loop`,
      );

      if (bond.type !== Bond.PATTERN.TYPE.AROMATIC) this.aromatic = false;
      if (bond.type === Bond.PATTERN.TYPE.DOUBLE) this.dblBonds++;
    });
  }
}
