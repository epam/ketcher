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
  performed: boolean

  constructor(label: string, position: Vec2) {
    super(OperationType.TEXT_CREATE)
    this.data = { label, position }
    this.performed = false
  }

  execute(restruct: Restruct): void {
    const struct = restruct.molecule

    if (!this.performed) {
      this.data.id = struct.texts.add(new Text(this.data))
      this.performed = true
    } else {
      struct.texts.set(this.data.id!, new Text(this.data))
    }
    const textId = this.data.id!
    restruct.texts.set(textId, new ReText(struct.texts.get(textId)))

    struct.textSetPosition(textId, new Vec2(this.data.position))
    BaseOperation.invalidateItem(restruct, 'texts', textId, 1)
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

    if (!this.performed) {
      const item = struct.texts.get(this.data.id)!

      if (item) {
        this.data.label = item.label!
        this.data.position = item.position
        this.performed = true
      }
    }

    restruct.markItemRemoved()

    restruct.clearVisel(restruct.texts.get(this.data.id)!.visel)
    restruct.texts.delete(this.data.id)

    struct.texts.delete(this.data.id)
  }

  invert(): BaseOperation {
    return new TextCreate(this.data.label!, this.data.position!)
  }
}
