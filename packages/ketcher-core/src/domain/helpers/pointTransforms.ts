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

import { Vec2 } from 'domain/entities/vec2';
import type { FlipDirection } from 'application/editor/shared/utils.types';

export const rotateDelta = (v: Vec2, center: Vec2, angle: number) => {
  let v1 = v.sub(center);
  v1 = v1.rotate(angle);
  v1.add_(center);
  return v1.sub(v);
};

export const flipPointByCenter = (
  pointToFlip: Vec2,
  center: Vec2,
  flipDirection: FlipDirection,
) => {
  const d = new Vec2();
  if (flipDirection === 'horizontal') {
    d.x =
      center.x > pointToFlip.x
        ? 2 * (center.x - pointToFlip.x)
        : -2 * (pointToFlip.x - center.x);
  } else {
    // 'vertical'
    d.y =
      center.y > pointToFlip.y
        ? 2 * (center.y - pointToFlip.y)
        : -2 * (pointToFlip.y - center.y);
  }
  return d;
};
