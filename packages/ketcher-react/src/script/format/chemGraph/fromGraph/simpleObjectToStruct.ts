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
import { SimpleObject, SimpleObjectMode, Vec2 } from 'ketcher-core'

export function simpleObjectToStruct(graphItem, struct) {
  const object =
    graphItem.data.mode === 'circle'
      ? circleToEllipse(graphItem)
      : graphItem.data
  struct.simpleObjects.add(new SimpleObject(object))
  return struct
}

/**
 * @deprecated TODO to remove after release 2.3
 * As circle has been migrated to ellipses here is function for converting old files data with circles to ellipse type
 * @param graphItem
 */
function circleToEllipse(graphItem) {
  const radius = Vec2.dist(graphItem.data.pos[1], graphItem.data.pos[0])
  const pos0 = graphItem.data.pos[0]
  return {
    mode: SimpleObjectMode.ellipse,
    pos: [
      {
        x: pos0.x - Math.abs(radius),
        y: pos0.y - Math.abs(radius),
        z: pos0.z - Math.abs(radius)
      },
      {
        x: pos0.x + Math.abs(radius),
        y: pos0.y + Math.abs(radius),
        z: pos0.z + Math.abs(radius)
      }
    ]
  }
}
