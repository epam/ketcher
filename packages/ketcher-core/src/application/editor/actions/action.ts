/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { BaseOperation } from '../operations/BaseOperation';
import { OperationType } from '../operations/OperationType';
import type { ReStruct } from '../../render';

const sGroupLifecycleTypes = new Set<string>([
  OperationType.S_GROUP_CREATE,
  OperationType.S_GROUP_DELETE,
  OperationType.S_GROUP_ADD_TO_HIERACHY,
  OperationType.S_GROUP_REMOVE_FROM_HIERACHY,
]);

function reorderSGroupLifecycleInverses(
  operations: BaseOperation[],
  groupOrder: ReadonlyMap<number, number>,
  hierarchyOrder: ReadonlyMap<number, number>,
): void {
  const hierarchyIds = new Set<number>();
  const hierarchyParents: number[] = [];
  operations.forEach((operation) => {
    if (
      operation.type !== OperationType.S_GROUP_ADD_TO_HIERACHY &&
      operation.type !== OperationType.S_GROUP_REMOVE_FROM_HIERACHY
    ) {
      return;
    }

    const data = operation.data;
    if (typeof data !== 'object' || data === null) {
      return;
    }
    if ('sgid' in data && typeof data.sgid === 'number') {
      hierarchyIds.add(data.sgid);
    }
    if ('parent' in data && typeof data.parent === 'number') {
      hierarchyParents.push(data.parent);
    }
  });
  if (!hierarchyParents.some((parent) => hierarchyIds.has(parent))) {
    return;
  }

  const positions = new Map<string, number[]>();
  operations.forEach((operation, index) => {
    if (sGroupLifecycleTypes.has(operation.type)) {
      const indices = positions.get(operation.type) ?? [];
      indices.push(index);
      positions.set(operation.type, indices);
    }
  });
  positions.forEach((indices, type) => {
    const order =
      type === OperationType.S_GROUP_CREATE
        ? groupOrder
        : type === OperationType.S_GROUP_ADD_TO_HIERACHY
          ? hierarchyOrder
          : undefined;
    const sorted = indices.map((index) => operations[index]);
    if (order) {
      const rank = (operation: BaseOperation): number => {
        const data = operation.data;
        if (
          typeof data !== 'object' ||
          data === null ||
          !('sgid' in data) ||
          typeof data.sgid !== 'number'
        ) {
          return Number.MAX_SAFE_INTEGER;
        }
        return order.get(data.sgid) ?? Number.MAX_SAFE_INTEGER;
      };
      sorted.sort((a, b) => rank(a) - rank(b));
    } else {
      sorted.reverse();
    }
    indices.forEach((index, i) => {
      operations[index] = sorted[i];
    });
  });
}
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
    this.operations = [...this.operations, ...action.operations];
    return this;
  }

  /**
  Perform action and return inverted one
  */
  perform(restruct: ReStruct): Action {
    const action = new Action();
    const hierarchyOperationCount = this.operations.filter(
      (operation) =>
        operation.type === OperationType.S_GROUP_ADD_TO_HIERACHY ||
        operation.type === OperationType.S_GROUP_REMOVE_FROM_HIERACHY,
    ).length;
    // Restore the original pool order and parent-before-child hierarchy order
    // without changing unrelated operations or the order of DATA groups.
    const groupOrder = new Map<number, number>();
    const hierarchyOrder = new Map<number, number>();
    if (hierarchyOperationCount > 1) {
      [...restruct.molecule.sgroups.keys()].forEach((id, index) =>
        groupOrder.set(id, index),
      );
      restruct.molecule.sGroupForest
        .getSGroupsBFS()
        .forEach((id, index) => hierarchyOrder.set(id, index));
    }
    const sortedOperations = [...this.operations].sort(
      (a, b) => a.priority - b.priority,
    );
    sortedOperations.forEach((operation) => {
      const invertedOperation = operation.perform(restruct);
      action.addOp(invertedOperation);
    });

    reorderSGroupLifecycleInverses(
      action.operations,
      groupOrder,
      hierarchyOrder,
    );
    return action;
  }

  isDummy(restruct?: ReStruct) {
    // An action is a dummy when every one of its operations is a no-op.
    // When `restruct` is provided each operation is asked whether it changes
    // anything (operations that don't override `isDummy` always count as a
    // real change). Without `restruct` we can only tell that an action with no
    // operations is a dummy.
    return !this.operations.some((operation) =>
      restruct ? !operation.isDummy(restruct) : true,
    );
  }
}
