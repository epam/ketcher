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

import { Point, RxnPlus, Struct, Vec2 } from 'domain/entities'

import { BaseOperation } from './baseOperation'
import { PerformOperationResult } from './operations.types'

class AddRxnPlus extends BaseOperation {
  #position: Point
  #rxnPlusId?: number

  constructor(position: Point, rxnPlusId?: number) {
    super('RXN_PLUS_ADD')

    this.#position = position
    this.#rxnPlusId = rxnPlusId
  }

  execute(struct: Struct): PerformOperationResult {
    const rxnPlus = new RxnPlus({ pp: this.#position })

    let rxnPlusId: number
    if (typeof this.#rxnPlusId === 'number') {
      struct.rxnPluses.set(this.#rxnPlusId, rxnPlus)
      rxnPlusId = this.#rxnPlusId
    } else {
      rxnPlusId = struct.rxnPluses.add(rxnPlus)
    }

    // TODO: move to renderer
    // const structRxn = struct.rxnPluses.get(plid)
    // // notifyRxnPlusAdded
    // restruct.rxnPluses.set(plid, new ReRxnPlus(structRxn))

    // BaseOperation.invalidateItem(restruct, 'rxnPluses', plid, 1)

    const inverseOperation = new DeleteRxnPlus(rxnPlusId)

    return { inverseOperation, entityId: rxnPlusId, operationType: this.type }
  }
}

class DeleteRxnPlus extends BaseOperation {
  #rxnPlusId: number

  constructor(rxnPlusId: number) {
    super('RXN_PLUS_DELETE')

    this.#rxnPlusId = rxnPlusId
  }

  execute(struct: Struct): PerformOperationResult {
    const rxnPlus = struct.rxnPluses.get(this.#rxnPlusId)!

    // TODO: move to renderer
    // // notifyRxnPlusRemoved
    // restruct.markItemRemoved()
    // const rxn = restruct.rxnPluses.get(plid)
    // if (!rxn) return
    // restruct.clearVisel(rxn.visel)
    // restruct.rxnPluses.delete(plid)

    struct.rxnPluses.delete(this.#rxnPlusId)

    const inverseOperation = new AddRxnPlus(rxnPlus.pp, this.#rxnPlusId)

    return {
      inverseOperation,
      entityId: this.#rxnPlusId,
      operationType: this.type
    }
  }
}

export class MoveRxnPlus extends BaseOperation {
  #rxnPlusId: number
  #delta: Vec2

  constructor(rxnPlusId: number, delta: Vec2) {
    super('RXN_PLUS_MOVE')

    this.#rxnPlusId = rxnPlusId
    this.#delta = delta
  }

  execute(struct: Struct): PerformOperationResult {
    const rxnPlus = struct.rxnPluses.get(this.#rxnPlusId)!
    rxnPlus.pp.add_(this.#delta)

    // TODO: move to renderer
    // const rxn = restruct.rxnPluses.get(id)!
    // const scaled = Scale.obj2scaled(d, restruct.render.options)
    // rxn.visel.translate(scaled)

    const inverseOperation = new MoveRxnPlus(
      this.#rxnPlusId,
      this.#delta.negated()
    )

    return {
      inverseOperation,
      entityId: this.#rxnPlusId,
      operationType: this.type
    }
  }
}
