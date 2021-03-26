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

interface TextUpdateData {
  id?: any
  label?: string
  position?: Vec2
  type?: string
  previousLabel?: string
}

export class TextUpdate extends BaseOperation {
  data: TextUpdateData

  constructor(
    id?: any,
    label?: string,
    position?: Vec2,
    type?: string,
    previousLabel?: string
  ) {
    super(OperationType.TEXT_UPDATE)
    this.data = { id, label, position, type, previousLabel }
  }

  execute(restruct: Restruct) {
    const { id, label } = this.data
    const text = restruct.molecule.texts.get(id)

    if (text) {
      text.label = label
    }

    BaseOperation.invalidateItem(restruct, 'texts', id, 1)
  }

  invert() {
    const inverted = new TextUpdate(this.data.id)
    inverted.data.label = this.data.previousLabel
    inverted.data.previousLabel = this.data.label
    return inverted
  }
}
