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

import { SimpleObject, SimpleObjectMode, Struct, Vec2 } from 'domain/entities';
import { getNodeWithInvertedYCoord } from '../helpers';

type SimpleObjectPoint = {
  x: number;
  y: number;
  z?: number;
};

type CircleSimpleObjectData = {
  mode: 'circle';
  pos: [SimpleObjectPoint, SimpleObjectPoint];
};

type SimpleObjectData = CircleSimpleObjectData | {
  mode: SimpleObjectMode;
  pos: SimpleObjectPoint[];
};

export function simpleObjectToStruct(
  ketItem: { data: SimpleObjectData; selected: boolean },
  struct: Struct,
): Struct {
  const object =
    ketItem.data.mode === 'circle'
      ? convertCircleSimpleObjectToEllipse(ketItem.data)
      : ketItem.data;
  const simpleObject = new SimpleObject(getNodeWithInvertedYCoord(object));
  simpleObject.setInitiallySelected(ketItem.selected);
  struct.simpleObjects.add(simpleObject);
  return struct;
}

function convertCircleSimpleObjectToEllipse(
  data: CircleSimpleObjectData,
): { mode: SimpleObjectMode; pos: SimpleObjectPoint[] } {
  const [center, perimeterPoint] = data.pos;
  const radius = Vec2.dist(new Vec2(perimeterPoint), new Vec2(center));
  const normalizedRadius = Math.abs(radius);
  const centerZ = center.z ?? 0;

  return {
    mode: SimpleObjectMode.ellipse,
    pos: [
      {
        x: center.x - normalizedRadius,
        y: center.y - normalizedRadius,
        z: centerZ - normalizedRadius,
      },
      {
        x: center.x + normalizedRadius,
        y: center.y + normalizedRadius,
        z: centerZ + normalizedRadius,
      },
    ],
  };
}
