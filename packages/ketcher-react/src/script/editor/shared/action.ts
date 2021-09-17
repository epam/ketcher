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

import { BaseOperation } from '../operations/base'
import Restruct from '../../render/restruct'
//
// Undo/redo actions
//
class Action {
  operations: BaseOperation[]

  constructor(operations = []) {
    this.operations = operations
  }

  addOp(operation: BaseOperation, restruct?: Restruct): BaseOperation {
    if (!restruct || !operation.isDummy(restruct)) {
      this.operations.push(operation)
    }

    return operation
  }

  mergeWith(action) {
    this.operations = this.operations.concat(action.operations)
    return this
  }

  // Perform action and return inverted one
  perform(restruct: Restruct) {
    const action = new Action()
    const sortedOperations = [...this.operations].sort(
      (a, b) => a.priority - b.priority
    )
    sortedOperations.forEach(operation => {
      const invertedOperation = operation.perform(restruct)
      action.addOp(invertedOperation)
    })

    return action
  }

  isDummy(restruct?: Restruct) {
    return (
      this.operations.find(
        // TODO [RB] the condition is always true for op.* operations
        operation => (restruct ? !operation.isDummy(restruct) : true)
      ) === undefined
    )
  }
}

export default Action
