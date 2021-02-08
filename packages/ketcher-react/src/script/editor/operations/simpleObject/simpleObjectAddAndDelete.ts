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
import { makeCircleFromEllipse } from './simpleObjectUtil'

interface SimpleObjectAddData {
  id?: string
  pos: Array<Vec2>
  mode: SimpleObjectMode
  toCircle: boolean
}
export class SimpleObjectAdd extends Base {
  data: SimpleObjectAddData
  performed: boolean

  constructor(
    pos: Array<Vec2> = [],
    mode: SimpleObjectMode = SimpleObjectMode.line,
    toCircle: boolean = false
  ) {
    super(OperationType.SIMPLE_OBJECT_ADD)
    // here is "tempValue is used
    this.data = { pos, mode, toCircle }
    this.performed = false
  }

  execute(restruct: any): void {
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
  invert(): Base {
    //@ts-ignore
    return new SimpleObjectDelete(this.data.id)
  }
}

interface SimpleObjectDeleteData {
  id: string
  pos?: Array<Vec2>
  mode?: SimpleObjectMode
  toCircle?: boolean
}

export class SimpleObjectDelete extends Base {
  data: SimpleObjectDeleteData
  performed: boolean

  constructor(id: string) {
    super(OperationType.SIMPLE_OBJECT_DELETE)
    this.data = { id, pos: [], mode: SimpleObjectMode.line, toCircle: false }
    this.performed = false
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    if (!this.performed) {
      const item = struct.simpleObjects.get(this.data.id) as any
      //save to data current values. In future they could be used in invert for restoring simple object
      this.data.pos = item.pos
      this.data.mode = item.mode
      this.data.toCircle = item.toCircle
      this.performed = true
    }

    restruct.markItemRemoved()
    restruct.clearVisel(restruct.simpleObjects.get(this.data.id).visel)
    restruct.simpleObjects.delete(this.data.id)

    struct.simpleObjects.delete(this.data.id)
  }

  invert(): Base {
    return new SimpleObjectAdd(this.data.pos, this.data.mode, this.data.toCircle)
  }
}