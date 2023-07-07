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

import { RxnArrow, RxnPlus, Struct } from 'domain/entities';
import { getNodeWithInvertedYCoord } from '../helpers';

export function rxnToStruct(ketItem: any, struct: Struct): Struct {
  if (ketItem.type === 'arrow') {
    struct.rxnArrows.add(new RxnArrow(getNodeWithInvertedYCoord(ketItem.data)));
  } else {
    struct.rxnPluses.add(
      new RxnPlus({
        pp: {
          x: ketItem.location[0],
          y: -ketItem.location[1],
          z: ketItem.location[2],
        },
      })
    );
  }
  return struct;
}
