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

import { ReStruct } from 'application/render'
import { Operation, PerformOperationResult } from '../operations'

import assert from 'assert'

export class Action {
  #operations: Array<Operation>

  constructor(operations: Array<Operation>) {
    assert(operations != null)

    this.#operations = operations
  }

  mergeWith(action: Action): Action {
    this.#operations = this.#operations.concat(action.#operations)

    return this
  }

  perform(restruct: ReStruct): Action {
    const results: Array<PerformOperationResult> = []

    const sortedOperations = [...this.#operations].sort(
      (a, b) => a.priority - b.priority
    )
    sortedOperations.forEach((operation) => {
      const result = operation.perform(restruct)
      results.push(result)
    })

    const invertedAction = new Action(
      results.reduce((operations: Array<Operation>, result) => {
        operations.push(result.inverseOperation)
        return operations
      }, [])
    )

    return invertedAction
  }

  addOperation(operation: Operation): Action {
    assert(operation != null)

    this.#operations.push(operation)

    return this
  }
}
