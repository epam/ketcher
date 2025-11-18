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

export function simpleObjectToStruct(ketItem: any, struct: Struct): Struct {
  // Convert old circle data to ellipse format (circles have been migrated to ellipses)
  let object;
  if (ketItem.data.mode === 'circle') {
    const radius = Vec2.dist(ketItem.data.pos[1], ketItem.data.pos[0]);
    const pos0 = ketItem.data.pos[0];
    object = {
      mode: SimpleObjectMode.ellipse,
      pos: [
        {
          x: pos0.x - Math.abs(radius),
          y: pos0.y - Math.abs(radius),
          z: pos0.z - Math.abs(radius),
        },
        {
          x: pos0.x + Math.abs(radius),
          y: pos0.y + Math.abs(radius),
          z: pos0.z + Math.abs(radius),
        },
      ],
    };
  } else {
    object = ketItem.data;
  }
  const simpleObject = new SimpleObject(getNodeWithInvertedYCoord(object));
  simpleObject.setInitiallySelected(ketItem.selected);
  struct.simpleObjects.add(simpleObject);
  return struct;
}
