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

// Single entry point to Raphaël library

import { Vec2 } from 'domain/entities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Raphael: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let raphaelModule: any;

if (typeof window !== 'undefined') {
  raphaelModule = require('raphael');
  // Some environments (vite, webpack etc) might resolve this import differently
  // this is a workaround to make it work in all environments
  Raphael =
    typeof raphaelModule === 'function' ? raphaelModule : raphaelModule.default;

  // TODO: refactor ugly prototype extensions to plain old functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: remove any for raphael
  (Raphael.el as any).translateAbs = function (x: number, y: number): void {
    this.delta = this.delta || new Vec2();
    // TODO check that only numbers might be passed to this function
    this.delta.x += x - 0;
    this.delta.y += y - 0;
    this.transform(
      't' + this.delta.x.toString() + ',' + this.delta.y.toString(),
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: remove any for raphael
  (Raphael.st as any).translateAbs = function (x: number, y: number): void {
    this.forEach((el) => {
      el.translateAbs(x, y);
    });
  };
}

export default Raphael;
