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

import { Vec2 } from './vec2';
import assert from 'assert';

/** @internal */
export class HalfBond {
  begin: number;
  end: number;
  bid: number;
  dir: Vec2;
  norm: Vec2;
  ang: number;
  p: Vec2;
  loop: number;
  contra: number;
  next: number;
  leftSin: number;
  leftCos: number;
  leftNeighbor: number;
  rightSin: number;
  rightCos: number;
  rightNeighbor: number;

  constructor(begin: number, end: number, bid: number) {
    assert(arguments.length === 3, 'Invalid parameter number.');

    this.begin = begin;
    this.end = end;
    this.bid = bid;

    // rendering properties
    this.dir = new Vec2(); // direction
    this.norm = new Vec2(); // left normal
    this.ang = 0; // angle to (1,0), used for sorting the bonds
    this.p = new Vec2(); // corrected origin position
    this.loop = -1; // left loop id if the half-bond is in a loop, otherwise -1
    this.contra = -1; // the half bond contrary to this one
    this.next = -1; // the half-bond next ot this one in CCW order
    this.leftSin = 0;
    this.leftCos = 0;
    this.leftNeighbor = 0;
    this.rightSin = 0;
    this.rightCos = 0;
    this.rightNeighbor = 0;
  }
}
