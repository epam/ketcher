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

import { AttrValueType, PerformOperationResult } from './operations.types'

import { BaseOperation } from './baseOperation'
import { Struct } from 'domain/entities'

export class SetRGroupAttr extends BaseOperation {
  #rgroupId: number
  #attribute: string
  #value: AttrValueType

  constructor(rgroupId: number, attribute: string, value: AttrValueType) {
    super('R_GROUP_ATTR')

    this.#rgroupId = rgroupId
    this.#attribute = attribute
    this.#value = value
  }

  execute(struct: Struct): PerformOperationResult {
    const rgroup = struct.rgroups.get(this.#rgroupId)!
    const previousValue = rgroup[this.#attribute]

    rgroup[this.#attribute] = this.#value

    //BaseOperation.invalidateItem(restruct, 'rgroups', rgid)

    const inverseOperation = new SetRGroupAttr(
      this.#rgroupId,
      this.#attribute,
      previousValue
    )

    return {
      inverseOperation,
      entityId: this.#rgroupId,
      operationType: this.type
    }
  }
}
