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

import Raphael from 'raphael';
import { Vec2 } from 'domain/entities';

// TODO: refactor ugly prototype extensions to plain old functions
Raphael.el.translateAbs = function (x: number, y: number): void {
  this.delta = this.delta || new Vec2();
  // TODO check that only numbers might be passed to this function
  this.delta.x += x - 0;
  this.delta.y += y - 0;
  this.transform('t' + this.delta.x.toString() + ',' + this.delta.y.toString());
};

Raphael.st.translateAbs = function (x: number, y: number): void {
  this.forEach((el) => {
    el.translateAbs(x, y);
  });
};

export default Raphael;
