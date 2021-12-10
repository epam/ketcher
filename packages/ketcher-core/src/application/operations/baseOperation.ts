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

import {
  Operation,
  OperationType,
  PerformOperationResult
} from './operations.types'

import { Struct } from 'domain/entities'
import assert from 'assert'

export abstract class BaseOperation implements Operation {
  #type: OperationType
  #priority: number

  get priority(): number {
    return this.#priority
  }

  get type(): OperationType {
    return this.#type
  }

  constructor(type: OperationType, priority = 0) {
    this.#type = type
    this.#priority = priority
  }

  protected abstract execute(struct: Struct): PerformOperationResult

  perform(struct: Struct): PerformOperationResult {
    assert(struct != null)

    return this.execute(struct)
  }
}
