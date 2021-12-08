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
import { RGroup, RGroupAttributes, Struct } from 'domain/entities'

import { BaseOperation } from './baseOperation'
import assert from 'assert'

export class AddRGroup extends BaseOperation {
  #rgroupId?: number
  #rgroupAttributes: RGroupAttributes

  constructor(rgroupAttributes: RGroupAttributes, rgroupId?: number) {
    super('R_GROUP_ADD')

    this.#rgroupId = rgroupId
    this.#rgroupAttributes = rgroupAttributes
  }

  execute(struct: Struct): PerformOperationResult {
    assert(
      struct.rgroups.find(
        // @ts-ignore
        (_key, rgroup) => rgroup.index === this.#rgroupAttributes.index
      ) === null,
      // @ts-ignore
      `R-group with index ${this.#rgroupAttributes.index} already exists.`
    )

    const rgroup = new RGroup(this.#rgroupAttributes)

    let rgroupId: number

    if (typeof this.#rgroupId === 'number') {
      struct.rgroups.set(this.#rgroupId, rgroup)
      rgroupId = this.#rgroupId
    } else {
      rgroupId = struct.rgroups.add(rgroup)
    }

    const inverseOperation = new DeleteRGroup(rgroupId)

    return { inverseOperation, entityId: rgroupId, operationType: this.type }
  }
}

export class DeleteRGroup extends BaseOperation {
  #rgroupId: number

  constructor(rgroupId: number) {
    super('R_GROUP_DELETE')

    this.#rgroupId = rgroupId
  }

  execute(struct: Struct): PerformOperationResult {
    const rgroup = struct.rgroups.get(this.#rgroupId)

    assert(rgroup != null, `R-group ${this.#rgroupId} not found.`)

    struct.rgroups.delete(this.#rgroupId)

    const inverseOperation = new AddRGroup(rgroup, this.#rgroupId)

    return {
      inverseOperation,
      entityId: this.#rgroupId,
      operationType: this.type
    }
  }
}

export class AddFragmentToRGroup extends BaseOperation {
  #rgroupId: number
  #fragmentId: number

  constructor(rgroupId: number, fragmentId: number) {
    super('R_GROUP_ADD_FRAGMENT')

    this.#rgroupId = rgroupId
    this.#fragmentId = fragmentId
  }

  execute(struct: Struct): PerformOperationResult {
    const rgroup = struct.rgroups.get(this.#rgroupId)

    assert(rgroup != null, `R-group ${this.#rgroupId} not found.`)
    assert(
      struct.frags.get(this.#fragmentId) != null,
      `Fragment ${this.#fragmentId} not found.`
    )

    rgroup.frags.add(this.#fragmentId)

    const inverseOperation = new DeleteFragmentFromRGroup(
      this.#rgroupId,
      this.#fragmentId
    )

    return {
      inverseOperation,
      entityId: this.#rgroupId,
      operationType: this.type
    }
  }
}

export class DeleteFragmentFromRGroup extends BaseOperation {
  #rgroupId: number
  #fragmentId: number

  constructor(rgroupId: number, fragmentId: number) {
    super('R_GROUP_DELETE_FRAGMENT')

    this.#rgroupId = rgroupId
    this.#fragmentId = fragmentId
  }

  execute(struct: Struct): PerformOperationResult {
    const rgroup = struct.rgroups.get(this.#rgroupId)

    assert(rgroup != null, `R-group ${this.#rgroupId} not found.`)

    rgroup.frags.delete(this.#fragmentId)

    const inverseOperation = new AddFragmentToRGroup(
      this.#rgroupId,
      this.#fragmentId
    )

    return {
      inverseOperation,
      entityId: this.#rgroupId,
      operationType: this.type
    }
  }
}

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

    // BaseOperation.invalidateItem(restruct, 'rgroups', rgid)

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

export class UpdateIfThen extends BaseOperation {
  #newRgroupIndex: number
  #previousRgroupIndex: number

  constructor(newRgroupIndex: number, previousRgroupIndex: number) {
    super('R_GROUP_UPDATE_IF_THEN')

    this.#newRgroupIndex = newRgroupIndex
    this.#previousRgroupIndex = previousRgroupIndex
  }

  execute(struct: Struct): PerformOperationResult {
    struct.rgroups.forEach((rg) => {
      if (rg.ifthen === this.#previousRgroupIndex) {
        rg.ifthen = this.#newRgroupIndex
      }
    })

    const inverseOperation = new UpdateIfThen(
      this.#previousRgroupIndex,
      this.#newRgroupIndex
    )

    return {
      inverseOperation,
      entityId: this.#newRgroupIndex,
      operationType: this.type
    }
  }
}
