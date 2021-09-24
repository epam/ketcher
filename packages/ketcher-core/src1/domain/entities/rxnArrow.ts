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

import { Point, Vec2 } from './vec2'

import assert from 'assert'

export type RxnArrowMode =
  | 'OPEN_ANGLE'
  | 'FILLED_TRIANGLE'
  | 'FILLED_BOW'
  | 'DASHED_OPEN_ANGLE'
  | 'FAILED'
  | 'BOTH_ENDS_FILLED_TRIANGLE'
  | 'EQUILIBRIUM_FILLED_TRIANGLE'
  | 'EQUILIBRIUM_FILLED_HALF_BOW'
  | 'EQUILIBRIUM_OPEN_ANGLE'
  | 'UNBALANCED_EQUILIBRIUM_FILLED_HALF_BOW'
  | 'UNBALANCED_EQUILIBRIUM_OPEN_HALF_ANGLE'
  | 'UNBALANCED_EQUILIBRIUM_LARGE_FILLED_HALF_BOW'
  | 'UNBALANCED_EQUILIBRIUM_FILLED_HALF_TRIANGLE'

export interface RxnArrowAttributes {
  mode: RxnArrowMode
  points: Array<Point>
}

export class RxnArrow {
  #mode: RxnArrowMode
  #points: Array<Vec2>

  get mode(): RxnArrowMode {
    return this.#mode
  }

  get points(): Array<Vec2> {
    return this.#points
  }

  constructor(attributes: RxnArrowAttributes) {
    assert(attributes != null)
    assert(attributes.points?.length > 0)

    this.#mode = attributes.mode
    this.#points = attributes.points.map(point => new Vec2(point))
  }

  clone() {
    return new RxnArrow(this)
  }

  center(): Vec2 {
    return Vec2.centre(this.points[0], this.points[1])
  }
}
