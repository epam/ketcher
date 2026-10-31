/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Vec2 } from './vec2';
import { assert } from 'utilities';

interface RelativeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AbsoluteBox {
  min: Vec2;
  max: Vec2;
}

export class Box2Abs {
  readonly p0: Vec2;
  readonly p1: Vec2;

  constructor();
  constructor(p: Vec2);
  constructor(box: AbsoluteBox);
  constructor(p0: Vec2, p1: Vec2);
  constructor(x0: number, y0: number, x1: number, y1: number);
  constructor(
    ...arguments_:
      | []
      | [Vec2]
      | [Vec2, Vec2]
      | [number, number, number, number]
      | [AbsoluteBox]
  ) {
    if (arguments_.length === 1 && arguments_[0] instanceof Vec2) {
      this.p0 = arguments_[0];
      this.p1 = arguments_[0];
    } else if (
      arguments_.length === 1 &&
      'min' in arguments_[0] &&
      'max' in arguments_[0]
    ) {
      const boxArgument = arguments_[0] as AbsoluteBox;
      this.p0 = boxArgument.min;
      this.p1 = boxArgument.max;
    } else if (arguments_.length === 2) {
      this.p0 = arguments_[0];
      this.p1 = arguments_[1];
    } else if (arguments_.length === 4) {
      this.p0 = new Vec2(arguments_[0], arguments_[1]);
      this.p1 = new Vec2(arguments_[2], arguments_[3]);
    } else if (arguments_.length === 0) {
      this.p0 = new Vec2();
      this.p1 = new Vec2();
    } else {
      throw new Error(
        'Box2Abs constructor only accepts a point, box bounds, 2 vectors, 4 numbers, or no args!',
      );
    }
  }

  toString(): string {
    return this.p0.toString() + ' ' + this.p1.toString();
  }

  clone(): Box2Abs {
    return new Box2Abs(this.p0, this.p1);
  }

  extend(lp: Vec2, rb: Vec2): Box2Abs {
    rb = rb || lp;
    return new Box2Abs(this.p0.sub(lp), this.p1.add(rb));
  }

  include(p: Vec2): Box2Abs {
    assert(p != null);

    return new Box2Abs(this.p0.min(p), this.p1.max(p));
  }

  contains(p: Vec2, extension = 0): boolean {
    assert(p != null);

    return (
      p.x >= this.p0.x - extension &&
      p.x <= this.p1.x + extension &&
      p.y >= this.p0.y - extension &&
      p.y <= this.p1.y + extension
    );
  }

  translate(d: Vec2): Box2Abs {
    return new Box2Abs(this.p0.add(d), this.p1.add(d));
  }

  transform<T>(f: (p: Vec2, options: T) => Vec2, options: T): Box2Abs {
    assert(typeof f === 'function');

    return new Box2Abs(f(this.p0, options), f(this.p1, options));
  }

  sz(): Vec2 {
    return this.p1.sub(this.p0);
  }

  centre(): Vec2 {
    return Vec2.centre(this.p0, this.p1);
  }

  pos() {
    return this.p0;
  }

  hasZeroArea() {
    const size = this.sz();
    return size.x === 0 && size.y === 0;
  }

  static fromRelBox(relatedBox: RelativeBox): Box2Abs {
    return new Box2Abs(
      relatedBox.x,
      relatedBox.y,
      relatedBox.x + relatedBox.width,
      relatedBox.y + relatedBox.height,
    );
  }

  static union(b1: Box2Abs, b2: Box2Abs): Box2Abs {
    return new Box2Abs(Vec2.min(b1.p0, b2.p0), Vec2.max(b1.p1, b2.p1));
  }

  static segmentIntersection(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
    const dc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    const dd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
    const da = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
    const database = (c.x - b.x) * (d.y - b.y) - (c.y - b.y) * (d.x - b.x);

    if (dc === 0 && dd === 0 && da === 0 && database === 0) {
      // Check for collinearity and overlapping cases
      return (
        Box2Abs.#isPointOnSegment(a, b, c) ||
        Box2Abs.#isPointOnSegment(a, b, d) ||
        Box2Abs.#isPointOnSegment(c, d, a) ||
        Box2Abs.#isPointOnSegment(c, d, b)
      );
    } else return dc * dd < 0 && da * database < 0;
  }

  // Helper function to check if a point is on a line segment
  static #isPointOnSegment(
    segPointA: Vec2,
    segPointB: Vec2,
    point: Vec2,
  ): boolean {
    const minX = Math.min(segPointA.x, segPointB.x);
    const maxX = Math.max(segPointA.x, segPointB.x);
    const minY = Math.min(segPointA.y, segPointB.y);
    const maxY = Math.max(segPointA.y, segPointB.y);

    return (
      point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    );
  }
}
