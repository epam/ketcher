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
import Vec2 from '../../../util/vec2'

export function makeCircleFromEllipse(position0: Vec2, position1: Vec2): Vec2 {
  const diff = Vec2.diff(position1, position0)
  const min = Math.abs(diff.x) < Math.abs(diff.y) ? diff.x : diff.y
  return new Vec2(
    position0.x + (diff.x > 0 ? 1 : -1) * Math.abs(min),
    position0.y + (diff.y > 0 ? 1 : -1) * Math.abs(min),
    0
  )
}


