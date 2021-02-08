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
import Base, { invalidateItem, OperationType } from '../base'
import scale from '../../../util/scale'

class SimpleObjectMoveData {
  id: string
  d: any
  noinvalidate: boolean

  constructor(id: string, d: any, noinvalidate: boolean) {
    this.id = id
    this.d = d
    this.noinvalidate = noinvalidate
  }
}

export class SimpleObjectMove extends Base {
  data: SimpleObjectMoveData

  constructor(id: string, d: any, noinvalidate: boolean) {
    super(OperationType.SIMPLE_OBJECT_MOVE)
    this.data = new SimpleObjectMoveData(id, d, noinvalidate)
  }
  execute(restruct: any): void {
    console.log('move')
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    const item = struct.simpleObjects.get(id)
    item.pos.forEach(p => p.add_(d))
    restruct.simpleObjects
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate)
      invalidateItem(restruct, 'simpleObjects', id, 1)
  }
}
