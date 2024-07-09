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

import { BaseMicromoleculeEntity } from 'domain/entities/BaseMicromoleculeEntity';
import { Vec2 } from 'domain/entities/vec2';

type Position = [Vec2, Vec2];

export const RASTER_IMAGE_KEY = 'rasterImage';

export class RasterImage extends BaseMicromoleculeEntity {
  constructor(public bitmap: string, public position: [Vec2, Vec2]) {
    super();
  }

  clone(): RasterImage {
    return new RasterImage(
      this.bitmap,
      this.position.map((item) => item) as Position,
    );
  }

  addPositionOffset(offset: Vec2) {
    this.position = this.position.map((item) => item.add(offset)) as Position;
  }

  rescalePosition(scale: number): void {
    this.position = this.position.map((item) => item.scaled(scale)) as Position;
  }
}
