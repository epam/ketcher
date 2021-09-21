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

import { assert } from 'console'

export type SimpleObjectMode = 'ELLIPSE' | 'RECTANGLE' | 'LINE'

export interface SimpleObjectAttributes {
  mode: SimpleObjectMode
  points: Array<Point>
}

export class SimpleObject {
  #mode: SimpleObjectMode
  #points: Array<Vec2>

  get mode(): SimpleObjectMode {
    return this.#mode
  }

  get points(): Array<Vec2> {
    return this.#points
  }

  constructor(attributes: SimpleObjectAttributes) {
    assert(attributes != null)

    this.#points = attributes.points.map(point => new Vec2(point))
    this.#mode = attributes.mode
  }

  clone(): SimpleObject {
    return new SimpleObject(this)
  }

  center(): Vec2 {
    switch (this.mode) {
      case 'RECTANGLE': {
        return Vec2.centre(this.points[0], this.points[1])
      }
      default:
        return this.points[0]
    }
  }
}
