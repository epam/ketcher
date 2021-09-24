import { Operation } from 'application/operations'
import { Struct } from 'domain/entities'
import assert from 'assert'

export class Action {
  #operations: Array<Operation>

  get operations(): Array<Operation> {
    return this.#operations || []
  }

  constructor(operations: Array<Operation> = []) {
    this.#operations = operations
  }

  addOpepation(operation: Operation): Action {
    assert(operation != null)

    this.#operations.push(operation)

    return this
  }

  mergeWith(action: Action): Action {
    this.#operations = this.#operations.concat(action.operations)
    return this
  }

  perform(target: Struct): Action {
    const action = new Action()
    const sortedOperations = [...this.operations].sort(
      (a, b) => a.priority - b.priority
    )
    sortedOperations.forEach(operation => {
      const invertedOperation = operation.perform(target)
      action.addOpepation(invertedOperation)
    })

    return action
  }
}
