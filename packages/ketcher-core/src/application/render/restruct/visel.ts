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
import { Box2Abs } from 'domain/entities/box2Abs';
import { Vec2 } from 'domain/entities/vec2';

export interface RaphaelPath {
  translateAbs(x: number, y: number): void;
  rotate(degree: number, cx: number, cy: number): void;
  insertBefore(element: unknown): void;
  remove(): void;
  next?: RaphaelPath;
  [key: string]: unknown;
}

class Visel {
  public type: string;
  public paths: RaphaelPath[];
  public boxes: Box2Abs[];
  public boundingBox: Box2Abs | null;
  public oldBoundingBox: Box2Abs | null;
  public exts: Box2Abs[];

  constructor(type: string) {
    this.type = type;
    this.paths = [];
    this.boxes = [];
    this.boundingBox = null;
    this.oldBoundingBox = null;
    this.exts = [];
  }

  add(path: RaphaelPath, bb?: Box2Abs | null, ext?: Box2Abs | null): void {
    this.paths.push(path);
    if (bb) {
      this.boxes.push(bb);
      this.boundingBox =
        this.boundingBox === null ? bb : Box2Abs.union(this.boundingBox, bb);
    }
    if (ext) {
      this.exts.push(ext);
    }
  }

  clear(): void {
    this.paths = [];
    this.boxes = [];
    this.exts = [];
    if (this.boundingBox !== null) {
      this.oldBoundingBox = this.boundingBox.clone();
    }
    this.boundingBox = null;
  }

  translate(vector: Vec2): void;
  translate(x: number, y: number): void;
  translate(...args: [Vec2] | [number, number]): void {
    if (args.length === 1) {
      const vector = args[0] as Vec2;
      this.translate(vector.x, vector.y);
    } else {
      const [x, y] = args;
      const delta = new Vec2(x, y);
      for (const path of this.paths) {
        path.translateAbs(x, y);
      }
      this.boxes = this.boxes.map((box) => box.translate(delta));
      if (this.boundingBox !== null) {
        this.boundingBox = this.boundingBox.translate(delta);
      }
    }
  }

  rotate(degree: number, center: Vec2): void {
    for (const path of this.paths) {
      path.rotate(degree, center.x, center.y);
    }

    this.boxes = this.boxes.map((box) =>
      box.transform(
        (point) => point.rotateAroundOrigin(degree, center),
        undefined,
      ),
    );
    if (this.boundingBox !== null) {
      this.boundingBox = this.boundingBox.transform(
        (point) => point.rotateAroundOrigin(degree, center),
        undefined,
      );
    }
  }
}

export default Visel;
