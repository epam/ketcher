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

import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'
import { Text, Vec2 } from 'ketcher-core'
import Restruct, { ReText } from '../../../render/restruct'

interface TextCreateData {
  id?: any
  label: string
  position: Vec2
  type: string
}

export class TextCreate extends BaseOperation {
  data: TextCreateData
  performed: boolean

  constructor(id: any, label: string, position: Vec2, type: string) {
    super(OperationType.TEXT_CREATE)
    this.data = { id, label, position, type }
    this.performed = false
  }

  execute(restruct: Restruct): void {
    const struct = restruct.molecule

    if (!this.performed) {
      this.data.id = struct.texts.add(new Text(this.data))
      this.performed = true
    } else {
      struct.texts.set(this.data.id, new Text(this.data))
    }

    if (this.data.id != null) {
      restruct.texts.set(
        this.data.id,
        new ReText(struct.texts.get(this.data.id))
      )
      const { id, position } = this.data
      struct.textSetPosition(id, new Vec2(position))
      BaseOperation.invalidateItem(restruct, 'texts', this.data.id, 1)
    }
  }

  invert(): BaseOperation {
    const { id, label, position, type } = this.data

    return new TextDelete(id, label, position, type)
  }
}

interface TextDeleteData {
  id: any
  label: string
  position: Vec2
  type?: string
}

export class TextDelete extends BaseOperation {
  data: TextDeleteData
  performed: boolean

  constructor(id: any, label: string, position: Vec2, type: string) {
    super(OperationType.TEXT_DELETE)
    this.data = { id, label, position, type }
    this.performed = false
  }

  execute(restruct: Restruct): void {
    const struct = restruct.molecule

    if (!this.performed) {
      const item = struct.texts.get(this.data.id)

      if (item) {
        // @ts-ignore
        this.data.label = item.label
        // @ts-ignore
        this.data.position = item.position
        this.data.type = item.type
        this.performed = true
      }
    }

    restruct.markItemRemoved()

    if (this.data.id != null) {
      restruct.clearVisel(restruct.texts.get(this.data.id)?.visel)
      restruct.texts.delete(this.data.id)

      struct.texts.delete(this.data.id)
    }
  }

  invert(): BaseOperation {
    return new TextCreate(
      this.data.id,
      this.data.label,
      this.data.position,
      // @ts-ignore
      this.data.type
    )
  }
}
