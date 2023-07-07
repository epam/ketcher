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

export enum SimpleObjectMode {
  ellipse = 'ellipse',
  rectangle = 'rectangle',
  line = 'line',
}

export interface SimpleObjectAttributes {
  mode: SimpleObjectMode;
  pos?: Array<Point>;
}

export class SimpleObject {
  pos: Array<Vec2>;
  mode: SimpleObjectMode;

  constructor(attributes?: SimpleObjectAttributes) {
    this.pos = [];

    if (attributes?.pos) {
      for (let i = 0; i < attributes.pos.length; i++) {
        const currentP = attributes.pos[i];
        this.pos[i] = currentP ? new Vec2(attributes.pos[i]) : new Vec2();
      }
    }

    this.mode = attributes?.mode || SimpleObjectMode.line;
  }

  clone(): SimpleObject {
    return new SimpleObject(this);
  }

  center(): Vec2 {
    switch (this.mode) {
      case SimpleObjectMode.rectangle: {
        return Vec2.centre(this.pos[0], this.pos[1]);
      }
      default:
        return this.pos[0];
    }
  }
}
