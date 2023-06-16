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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { ReStruct, ReText } from '../../../render'
import { Text, Vec2 } from 'domain/entities'

import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

interface TextCreateData {
  id?: number
  content: string
  pos: Array<Vec2>
  position: Vec2
}

export class TextCreate extends BaseOperation {
  data: TextCreateData

  constructor(content: string, position: Vec2, pos: Array<Vec2>, id?: number) {
    super(OperationType.TEXT_CREATE)
    this.data = { content, position, pos, id }
  }

  execute(restruct: ReStruct): void {
    const item = new Text(this.data)

    if (this.data.id == null) {
      const index = restruct.molecule.texts.add(item)
      this.data.id = index
    } else {
      restruct.molecule.texts.set(this.data.id!, item)
    }

    const itemId = this.data.id!

    restruct.texts.set(itemId, new ReText(item))

    restruct.molecule.textSetPosition(itemId, new Vec2(this.data.position))
    BaseOperation.invalidateItem(restruct, 'texts', itemId, 1)
  }

  invert(): BaseOperation {
    return new TextDelete(this.data.id!)
  }
}

interface TextDeleteData {
  id: number
  content?: string
  position?: Vec2
  pos?: Array<Vec2> | []
}

export class TextDelete extends BaseOperation {
  data: TextDeleteData

  constructor(id: number) {
    super(OperationType.TEXT_DELETE)
    this.data = { id }
  }

  execute(restruct: ReStruct): void {
    const struct = restruct.molecule
    const item = struct.texts.get(this.data.id)!
    if (!item) return

    this.data.content = item.content!
    this.data.position = item.position

    restruct.markItemRemoved()

    restruct.clearVisel(restruct.texts.get(this.data.id)!.visel)
    restruct.texts.delete(this.data.id)

    struct.texts.delete(this.data.id)
  }

  invert(): BaseOperation {
    return new TextCreate(
      this.data.content!,
      this.data.position!,
      this.data.pos!,
      this.data.id
    )
  }
}
