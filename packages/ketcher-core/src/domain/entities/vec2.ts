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

import assert from 'assert';
import { tfx } from 'utilities';

export interface Point {
  x?: number;
  y?: number;
  z?: number;
}
export class Vec2 {
  static ZERO = new Vec2(0, 0);
  static UNIT = new Vec2(1, 1);

  x: number;
  y: number;
  z: number;

  constructor(point: Point);
  constructor(x?: number, y?: number, z?: number);
  constructor(...args: Array<any>) {
    if (args.length === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    } else if (arguments.length === 1) {
      this.x = parseFloat(args[0].x || 0);
      this.y = parseFloat(args[0].y || 0);
      this.z = parseFloat(args[0].z || 0);
    } else if (arguments.length === 2) {
      this.x = parseFloat(args[0] || 0);
      this.y = parseFloat(args[1] || 0);
      this.z = 0;
    } else if (arguments.length === 3) {
      this.x = parseFloat(args[0]);
      this.y = parseFloat(args[1]);
      this.z = parseFloat(args[2]);
    } else {
      throw new Error('Vec2(): invalid arguments');
    }
  }

  static dist(a: Vec2, b: Vec2): number {
    return Vec2.diff(a, b).length();
  }

  static max(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(
      Math.max(v1.x, v2.x),
      Math.max(v1.y, v2.y),
      Math.max(v1.z, v2.z),
    );
  }

  static min(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(
      Math.min(v1.x, v2.x),
      Math.min(v1.y, v2.y),
      Math.min(v1.z, v2.z),
    );
  }

  static sum(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }

  static dot(v1: Vec2, v2: Vec2): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static cross(v1: Vec2, v2: Vec2): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static angle(v1: Vec2, v2: Vec2): number {
    return Math.atan2(Vec2.cross(v1, v2), Vec2.dot(v1, v2));
  }

  static diff(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  // assume arguments v1, f1, v2, f2, v3, f3, etc.
  // where v[i] are vectors and f[i] are corresponding coefficients
  static lc(...args: Array<Vec2 | number>): Vec2 {
    let v = new Vec2();
    for (let i = 0; i < arguments.length / 2; ++i) {
      v = v.addScaled(args[2 * i] as Vec2, args[2 * i + 1] as number);
    }
    return v;
  }

  static lc2(v1: Vec2, f1: number, v2: Vec2, f2: number): Vec2 {
    return new Vec2(
      v1.x * f1 + v2.x * f2,
      v1.y * f1 + v2.y * f2,
      v1.z * f1 + v2.z * f2,
    );
  }

  static centre(v1: Vec2, v2: Vec2) {
    return Vec2.lc2(v1, 0.5, v2, 0.5);
  }

  static getLinePoint(lineStart: Vec2, lineEnd: Vec2, length) {
    const difference = lineStart.sub(lineEnd);
    const distance = difference.length();
    const ratio = length / distance;
    return new Vec2(
      lineStart.x + difference.x * ratio,
      lineStart.y + difference.y * ratio,
    );
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  equals(v: Vec2): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  add_(v: Vec2): void {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  get_xy0(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(
      Number((this.x - v.x).toFixed(8)),
      Number((this.y - v.y).toFixed(8)),
      this.z - v.z,
    );
  }

  scaled(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s, this.z * s);
  }

  negated(): Vec2 {
    return new Vec2(-this.x, -this.y, -this.z);
  }

  yComplement(y1: number): Vec2 {
    y1 = y1 || 0;
    return new Vec2(this.x, y1 - this.y, this.z);
  }

  addScaled(v: Vec2, f: number): Vec2 {
    return new Vec2(this.x + v.x * f, this.y + v.y * f, this.z + v.z * f);
  }

  normalized(): Vec2 {
    return this.scaled(1 / this.length());
  }

  normalize(): boolean {
    const l = this.length();

    if (l < 0.000001) return false;

    this.x /= l;
    this.y /= l;

    return true;
  }

  turnLeft(): Vec2 {
    return new Vec2(-this.y, this.x, this.z);
  }

  coordStr(): string {
    return this.x.toString() + ' , ' + this.y.toString();
  }

  toString(): string {
    return '(' + this.x.toFixed(2) + ',' + this.y.toFixed(2) + ')';
  }

  max(v: Vec2): Vec2 {
    assert(v != null);

    return Vec2.max(this, v);
  }

  min(v: Vec2): Vec2 {
    return Vec2.min(this, v);
  }

  ceil(): Vec2 {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
  }

  floor(): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }

  rotate(angle: number) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    return this.rotateSC(sin, cos);
  }

  rotateSC(sin: number, cos: number): Vec2 {
    assert(sin === 0 || !!sin);
    assert(cos === 0 || !!cos);

    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos,
      this.z,
    );
  }

  rotateAroundOrigin(angleInDegrees: number, origin: Vec2) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    const offsetX = this.x - origin.x;
    const offsetY = this.y - origin.y;

    const rotatedX =
      Math.cos(angleInRadians) * offsetX - Math.sin(angleInRadians) * offsetY;
    const rotatedY =
      Math.sin(angleInRadians) * offsetX + Math.cos(angleInRadians) * offsetY;

    const x = rotatedX + origin.x;
    const y = rotatedY + origin.y;

    return new Vec2(Number(tfx(x)), Number(tfx(y)), this.z || 0);
  }

  isInsidePolygon(points: Vec2[]) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
    const { x, y } = this;
    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x || 0;
      const yi = points[i].y || 0;
      const xj = points[j].x || 0;
      const yj = points[j].y || 0;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  oxAngle(): number {
    return Math.atan2(this.y, this.x);
  }
}
