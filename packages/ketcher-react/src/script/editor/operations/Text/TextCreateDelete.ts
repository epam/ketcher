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

import Restruct, { ReText } from '../../../render/restruct'
import { Text, Vec2 } from 'ketcher-core'

import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

interface TextCreateData {
  id?: number
  label: string
  position: Vec2
}

export class TextCreate extends BaseOperation {
  data: TextCreateData

  constructor(label: string, position: Vec2, id?: number) {
    super(OperationType.TEXT_CREATE)
    this.data = { label, position, id }
  }

  execute(restruct: Restruct): void {
    const struct = restruct.molecule
    const item = new Text(this.data)

    if (this.data.id == null) {
      const index = struct.texts.add(item)
      this.data.id = index
    } else {
      struct.texts.set(this.data.id!, item)
    }

    const itemId = this.data.id!

    restruct.texts.set(itemId, new ReText(item))

    struct.textSetPosition(itemId, new Vec2(this.data.position))
    BaseOperation.invalidateItem(restruct, 'texts', itemId, 1)
  }

  invert(): BaseOperation {
    return new TextDelete(this.data.id!)
  }
}

interface TextDeleteData {
  id: any
  label?: string
  position?: Vec2
}

export class TextDelete extends BaseOperation {
  data: TextDeleteData
  performed: boolean

  constructor(id: number) {
    super(OperationType.TEXT_DELETE)
    this.data = { id }
    this.performed = false
  }

  execute(restruct: Restruct): void {
    const struct = restruct.molecule
    const item = struct.texts.get(this.data.id)!
    if (!item) return

    this.data.label = item.label!
    this.data.position = item.position

    restruct.markItemRemoved()

    restruct.clearVisel(restruct.texts.get(this.data.id)!.visel)
    restruct.texts.delete(this.data.id)

    struct.texts.delete(this.data.id)
  }

  invert(): BaseOperation {
    return new TextCreate(this.data.label!, this.data.position!, this.data.id)
  }
}
