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
import { ReStruct } from '../../../render'

interface TextUpdateData {
  id: number
  content: string
  previousContent?: string
}

export class TextUpdate extends BaseOperation {
  data: TextUpdateData

  constructor(id: number, content: string) {
    super(OperationType.TEXT_UPDATE)
    this.data = { id, content }
  }

  execute(restruct: ReStruct) {
    const { id, content } = this.data
    const text = restruct.molecule.texts.get(id)

    if (text) {
      this.data.previousContent = text.content!
      text.content = content
    }

    BaseOperation.invalidateItem(restruct, 'texts', id, 1)
  }

  invert() {
    const inverted = new TextUpdate(this.data.id, this.data.previousContent!)

    inverted.data.previousContent = this.data.content
    return inverted
  }
}
