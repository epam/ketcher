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
export class Vec2 {
  static ZERO = new Vec2(0, 0)
  static UNIT = new Vec2(1, 1)

  x: number
  y: number
  z: number

  constructor(x?: number, y?: number, z?: number) {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y, this.z)
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  equals(v: Vec2): boolean {
    return this.x === v.x && this.y === v.y
  }

  add(v: Vec2): Vec2 {
    this.x += v.x
    this.y += v.y
    this.z += v.z

    return this
  }

  normalize(): boolean {
    const l = this.length()

    if (l < 0.000001) return false

    this.x /= l
    this.y /= l

    return true
  }

  oxAngle(): number {
    return Math.atan2(this.y, this.x)
  }

  coordStr(): string {
    return this.x.toString() + ' , ' + this.y.toString()
  }

  toString(): string {
    return '(' + this.x.toFixed(2) + ',' + this.y.toFixed(2) + ')'
  }

  static getXY0(v: Vec2): Vec2 {
    return new Vec2(v.x, v.y)
  }

  static sub(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
  }

  static scale(v: Vec2, s: number): Vec2 {
    return new Vec2(v.x * s, v.y * s, v.z * s)
  }

  static negate(v: Vec2): Vec2 {
    return new Vec2(-v.x, -v.y, -v.z)
  }

  static turnLeft(v: Vec2): Vec2 {
    return new Vec2(-v.y, v.x, v.z)
  }

  static floor(v: Vec2): Vec2 {
    return new Vec2(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z))
  }

  static max(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(
      Math.max(v1.x, v2.x),
      Math.max(v1.y, v2.y),
      Math.max(v1.z, v2.z)
    )
  }

  static min(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(
      Math.min(v1.x, v2.x),
      Math.min(v1.y, v2.y),
      Math.min(v1.z, v2.z)
    )
  }

  static sum(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
  }

  static dot(v1: Vec2, v2: Vec2): number {
    return v1.x * v2.x + v1.y * v2.y
  }

  static ceil(v: Vec2): Vec2 {
    return new Vec2(Math.ceil(v.x), Math.ceil(v.y), Math.ceil(v.z))
  }

  static rotate(v: Vec2, angle: number): Vec2 {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)

    return Vec2.rotateSC(v, sin, cos)
  }

  static rotateSC(v: Vec2, sin: number, cos: number): Vec2 {
    return new Vec2(v.x * cos - v.y * sin, v.x * sin + v.y * cos, v.z)
  }

  static cross(v1: Vec2, v2: Vec2): number {
    return v1.x * v2.y - v1.y * v2.x
  }

  static angle(v1: Vec2, v2: Vec2): number {
    return Math.atan2(Vec2.cross(v1, v2), Vec2.dot(v1, v2))
  }

  static diff(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
  }

  static dist(v1: Vec2, v2: Vec2): number {
    return Vec2.diff(v1, v2).length()
  }

  static yComplement(v: Vec2, y1: number) {
    y1 = y1 || 0
    return new Vec2(v.x, y1 - v.y, v.z)
  }

  static normalize = function (v: Vec2): Vec2 {
    return Vec2.scale(v, 1 / v.length())
  }

  static lc2(v1: Vec2, s1: number, v2: Vec2, s2: number): Vec2 {
    return new Vec2(
      v1.x * s1 + v2.x * s2,
      v1.y * s1 + v2.y * s2,
      v1.z * s1 + v2.z * s2
    )
  }

  static lc(...args: Array<Vec2 | number>): Vec2 {
    let v1 = new Vec2()
    for (let i = 0; i < args.length / 2; ++i) {
      const v2 = Vec2.scale(args[2 * i] as Vec2, ((2 * i) as number) + 1)
      v1 = Vec2.sum(v1, v2)
    }
    return v1
  }

  static center(v1: Vec2, v2: Vec2): Vec2 {
    return Vec2.lc2(v1, 0.5, v2, 0.5)
  }
}
