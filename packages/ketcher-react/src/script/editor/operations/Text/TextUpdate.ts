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
import { Vec2 } from 'ketcher-core'
import Restruct from '../../../render/restruct'
import { RawDraftContentState } from 'draft-js'

interface TextUpdateData {
  id: any
  rawContent?: RawDraftContentState
  position?: Vec2
  type?: string
  previousRawContent?: RawDraftContentState
}

export class TextUpdate extends BaseOperation {
  data: TextUpdateData

  constructor(
    id: any,
    rawContent?: RawDraftContentState,
    position?: Vec2,
    type?: string,
    previousRawContent?: RawDraftContentState
  ) {
    super(OperationType.TEXT_UPDATE)
    this.data = { id, rawContent, position, type, previousRawContent }
  }

  execute(restruct: Restruct) {
    const { id, rawContent } = this.data
    const text = restruct.molecule.texts.get(id)

    if (text) {
      text.rawContent = rawContent!
    }

    BaseOperation.invalidateItem(restruct, 'texts', id, 1)
  }

  invert() {
    const inverted = new TextUpdate(this.data)
    inverted.data.rawContent = this.data.previousRawContent
    inverted.data.previousRawContent = this.data.rawContent
    return inverted
  }
}
