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

import { RxnArrow, RxnPlus, Struct } from 'domain/entities'

export function rxnToStruct(graphItem: any, struct: Struct): Struct {
  if (graphItem.type === 'arrow') {
    struct.rxnArrows.add(new RxnArrow(graphItem.data))
  } else {
    struct.rxnPluses.add(
      new RxnPlus({
        position: {
          x: graphItem.location[0],
          y: graphItem.location[1],
          z: graphItem.location[2]
        }
      })
    )
  }
  return struct
}
