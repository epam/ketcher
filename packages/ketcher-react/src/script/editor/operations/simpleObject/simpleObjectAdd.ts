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
import Base, { invalidateItem, OperationType } from '../base'
import { ReSimpleObject } from '../../../render/restruct'
import { SimpleObject, SimpleObjectMode } from 'src/script/chem/struct'
import {makeCircleFromEllipse} from "./simpleObjectUtil";

class SimpleObjectAddData {
  id: string|null
  pos: Array<Vec2>
  mode: SimpleObjectMode
  toCircle: boolean

  constructor(id: string, pos: Array<Vec2>, mode:SimpleObjectMode, toCircle: boolean) {
    this.id = id;
    this.pos = pos;
    this.mode = mode;
    this.toCircle = toCircle;
  }
}
export class SimpleObjectAdd extends Base {
  data: SimpleObjectAddData
  performed: boolean

  constructor(
    pos: Array<Vec2>,
    mode: SimpleObjectMode,
    toCircle: boolean
  ) {
    super(OperationType.SIMPLE_OBJECT_ADD)
    // here is "tempValue is used
    this.data = new SimpleObjectAddData("tempValue", pos, mode, toCircle)
    this.performed = false
  }

  execute(restruct: any): void {
    console.log("add")
    const struct = restruct.molecule
    if (!this.performed) {
      this.data.id = struct.simpleObjects.add(
        new SimpleObject({ mode: this.data.mode })
      )
      this.performed = true
    } else {
      struct.simpleObjects.set(
        this.data.id,
        new SimpleObject({ mode: this.data.mode })
      )
    }

    restruct.simpleObjects.set(
      this.data.id,
      new ReSimpleObject(struct.simpleObjects.get(this.data.id))
    )

    const positions = [...this.data.pos]
    if (this.data.toCircle) {
      positions[1] = makeCircleFromEllipse(positions[0], positions[1])
    }
    struct.simpleObjectSetPos(
      this.data.id,
      positions.map(p => new Vec2(p))
    )

    invalidateItem(restruct, 'simpleObjects', this.data.id, 1)
  }
}