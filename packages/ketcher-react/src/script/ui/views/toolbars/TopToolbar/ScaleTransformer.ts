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

import { zoomList } from 'src/script/ui/action/zoom';

export class ScaleTransformer {
  a: number;
  b: number;
  zoomList: number[];

  constructor(inputMax: number) {
    // Exponential formula is y = a * (b ** x)
    // Where y is zoom, and x is position of input slider. Calculating a and b for our scale below

    this.zoomList = zoomList;

    // Assuming input range min is 0 (it should be), x ** 0 is 1, so y = a * 1 at the beginning of scale
    this.a = Math.min(...this.zoomList);

    // b is nth root of (y / a)
    this.b = Math.pow(Math.max(...this.zoomList) / this.a, 1 / inputMax);
  }

  getSliderValue(zoom: number) {
    // Calculating x as logarighm of (y/a) to base b
    const sliderValue = Math.round(
      Math.log2(zoom / this.a) / Math.log2(this.b)
    );
    return sliderValue;
  }

  getZoomValue(sliderValue: number) {
    // Exponential formula is y = a * (b ** x)
    const computedZoomValue = this.a * this.b ** sliderValue;
    const zoomValue = this.pickNearestFromList(
      computedZoomValue,
      this.zoomList
    );
    return zoomValue;
  }

  private pickNearestFromList(value: number, list) {
    const nearest = list.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    return nearest;
  }
}
