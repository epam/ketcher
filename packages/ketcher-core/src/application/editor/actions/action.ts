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

import type { BaseOperation } from '../operations/BaseOperation';
import type { ReStruct } from '../../render';
//
// Undo/redo actions
//
export class Action {
  operations: BaseOperation[];

  constructor(operations: BaseOperation[] = []) {
    this.operations = operations;
  }

  addOp(operation: BaseOperation, restruct?: ReStruct): BaseOperation {
    if (!restruct || !operation.isDummy(restruct)) {
      this.operations.push(operation);
    }

    return operation;
  }

  mergeWith(action) {
    this.operations = this.operations.concat(action.operations);
    return this;
  }

  /** Perform action and return inverted one */
  perform(restruct: ReStruct): Action {
    const action = new Action();
    const sortedOperations = [...this.operations].sort(
      (a, b) => a.priority - b.priority,
    );
    sortedOperations.forEach((operation) => {
      const invertedOperation = operation.perform(restruct);
      action.addOp(invertedOperation);
    });

    return action;
  }

  isDummy(restruct?: ReStruct) {
    // An action is a dummy when every one of its operations is a no-op.
    // When `restruct` is provided each operation is asked whether it changes
    // anything (operations that don't override `isDummy` always count as a
    // real change). Without `restruct` we can only tell that an action with no
    // operations is a dummy.
    return (
      this.operations.find((operation) =>
        restruct ? !operation.isDummy(restruct) : true,
      ) === undefined
    );
  }
}
