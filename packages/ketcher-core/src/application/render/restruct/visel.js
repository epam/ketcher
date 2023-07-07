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

// Visel is a shorthand for VISual ELement
// It corresponds to a visualization (i.e. set of paths) of an atom or a bond.
import { Box2Abs, Vec2 } from 'domain/entities';

class Visel {
  constructor(type) {
    this.type = type;
    this.paths = [];
    /** @type {Box2Abs[]} */
    this.boxes = [];
    /** @type {Box2Abs | null} */
    this.boundingBox = null;
    this.oldBoundingBox = null;
    this.exts = [];
  }

  add(path, bb, ext) {
    this.paths.push(path);
    if (bb) {
      this.boxes.push(bb);
      this.boundingBox =
        this.boundingBox == null ? bb : Box2Abs.union(this.boundingBox, bb);
    }
    if (ext) this.exts.push(ext);
  }

  clear() {
    this.paths = [];
    this.boxes = [];
    this.exts = [];
    if (this.boundingBox !== null) {
      this.oldBoundingBox = this.boundingBox.clone();
    }
    this.boundingBox = null;
  }

  translate(...args) {
    if (args.length > 2) {
      // TODO: replace to debug time assert
      throw new Error('One vector or two scalar arguments expected');
    }
    if (args.length === 1) {
      const vector = args[0];
      this.translate(vector.x, vector.y);
    } else {
      const x = args[0];
      const y = args[1];
      const delta = new Vec2(x, y);
      for (let i = 0; i < this.paths.length; ++i) {
        this.paths[i].translateAbs(x, y);
      }
      for (let j = 0; j < this.boxes.length; ++j) {
        this.boxes[j] = this.boxes[j].translate(delta);
      }
      if (this.boundingBox !== null) {
        this.boundingBox = this.boundingBox.translate(delta);
      }
    }
  }

  /**
   * @param {number} degree
   * @param {Vec2} center
   */
  rotate(degree, center) {
    for (let i = 0; i < this.paths.length; ++i) {
      this.paths[i].rotate(degree, center.x, center.y);
    }

    for (let j = 0; j < this.boxes.length; ++j) {
      this.boxes[j] = this.boxes[j].transform((point) =>
        point.rotateAroundOrigin(degree, center)
      );
    }
    if (this.boundingBox !== null) {
      this.boundingBox = this.boundingBox.transform((point) =>
        point.rotateAroundOrigin(degree, center)
      );
    }
  }
}

export default Visel;
