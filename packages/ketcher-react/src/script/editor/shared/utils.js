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

import { Vec2, fracAngle } from 'ketcher-core'

function calcAngle(pos0, pos1) {
  const v = Vec2.diff(pos1, pos0)
  return Math.atan2(v.y, v.x)
}

function calcNewAtomPos(pos0, pos1, ctrlKey) {
  const v = new Vec2(1, 0).rotate(
    ctrlKey ? calcAngle(pos0, pos1) : fracAngle(pos0, pos1)
  )
  v.add_(pos0) // eslint-disable-line no-underscore-dangle
  return v
}

function degrees(angle) {
  let degree = Math.round((angle / Math.PI) * 180)
  if (degree > 180) degree -= 360
  else if (degree <= -180) degree += 360
  return degree
}

export default {
  calcAngle,
  fracAngle,
  calcNewAtomPos,
  degrees
}
