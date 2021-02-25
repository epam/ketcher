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

import { Vec2 } from './Vec2'

export class Box2Abs {
  readonly p0: Vec2
  readonly p1: Vec2

  constructor(p: Vec2)
  constructor(p0: Vec2, p1: Vec2)
  constructor(x0: number, y0: number, x1: number, y1: number)
  constructor(...args: any) {
    if (args.length === 1 && 'min' in args[0] && 'max' in args[0]) {
      this.p0 = args[0].min
      this.p1 = args[0].max
    }

    if (args.length === 2) {
      this.p0 = args[0]
      this.p1 = args[1]
    } else if (args.length === 4) {
      this.p0 = new Vec2(args[0], args[1])
      this.p1 = new Vec2(args[2], args[3])
    } else if (args.length === 0) {
      this.p0 = new Vec2()
      this.p1 = new Vec2()
    } else {
      throw new Error(
        'Box2Abs constructor only accepts 4 numbers or 2 vectors or no args!'
      )
    }
  }

  static extend(b: Box2Abs, lp: Vec2, rb: Vec2) {
    return new Box2Abs(Vec2.sub(b.p1, lp), Vec2.sum(b.p1, rb || lp))
  }

  static include(b: Box2Abs, p: Vec2) {
    return new Box2Abs(Vec2.min(b.p0, p), Vec2.max(b.p1, p))
  }

  static union(b1: Box2Abs, b2: Box2Abs) {
    return new Box2Abs(Vec2.min(b1.p0, b2.p0), Vec2.max(b1.p1, b2.p1))
  }

  static segmentIntersection(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
    const dc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x)
    const dd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x)
    const da = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x)
    const db = (c.x - b.x) * (d.y - b.y) - (c.y - b.y) * (d.x - b.x)

    return dc * dd <= 0 && da * db <= 0
  }

  static translate(b: Box2Abs, d: Vec2): Box2Abs {
    return new Box2Abs(Vec2.sum(b.p0, d), Vec2.sum(b.p1, d))
  }

  static transform(
    b: Box2Abs,
    f: (p: Vec2, options: any) => Vec2,
    options: any
  ): Box2Abs {
    return new Box2Abs(f(b.p0, options), f(b.p1, options))
  }

  static fromRelBox(relBox: any) {
    return new Box2Abs(
      relBox.x,
      relBox.y,
      relBox.x + relBox.width,
      relBox.y + relBox.height
    )
  }

  clone(): Box2Abs {
    return new Box2Abs(this.p0, this.p1)
  }

  contains(p: Vec2, ext: number = 0.0) {
    return (
      p.x >= this.p0.x - ext &&
      p.x <= this.p1.x + ext &&
      p.y >= this.p0.y - ext &&
      p.y <= this.p1.y + ext
    )
  }

  size(): Vec2 {
    return Vec2.sub(this.p1, this.p0)
  }

  center(): Vec2 {
    return Vec2.center(this.p0, this.p1)
  }

  pos(): Vec2 {
    return this.p0
  }

  toString(): string {
    return this.p0.toString() + ' ' + this.p1.toString()
  }
}
