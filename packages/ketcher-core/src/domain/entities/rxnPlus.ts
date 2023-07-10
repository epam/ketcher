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

import { Point, Vec2 } from './vec2';

export interface RxnPlusAttributes {
  pp?: Point;
}

export class RxnPlus {
  pp: Vec2;

  constructor(attributes?: RxnPlusAttributes) {
    this.pp = attributes?.pp ? new Vec2(attributes.pp) : new Vec2();
  }

  clone() {
    return new RxnPlus(this);
  }
}
