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

import { Point, Struct, Vec2 } from 'domain/entities';
import { getNodeWithInvertedYCoord } from '../helpers';
import { RasterImage } from 'domain/entities/rasterImage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rasterImageToStruct(ketItem: any, struct: Struct): Struct {
  const { bitmap, position } = getNodeWithInvertedYCoord(ketItem.data);
  const vectorPosition = position.map((item: Point) => new Vec2(item));
  const rasterImage = new RasterImage(bitmap, vectorPosition);
  rasterImage.setInitiallySelected(ketItem.selected);
  struct.rasterImages.add(rasterImage);
  return struct;
}
