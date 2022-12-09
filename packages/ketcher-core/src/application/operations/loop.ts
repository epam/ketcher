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

import { Struct, Vec2 } from 'domain/entities'

import { BaseOperation } from './baseOperation'
import { PerformOperationResult } from './operations.types'
import assert from 'assert'

export class MoveLoop extends BaseOperation {
  #loopId: number
  #delta: Vec2

  constructor(loopId: number, delta: Vec2) {
    assert(delta != null)

    super('LOOP_MOVE')

    this.#loopId = loopId
    this.#delta = delta
  }

  execute(_struct: Struct): PerformOperationResult {
    // not sure if there should be an action to move a loop in the first place
    // but we have to somehow move the aromatic ring,
    // which is associated with the loop, rather than with any of the bonds

    // TODO: move to renderer
    // const { id, d } = this.data
    // const reloop = restruct.reloops.get(id)

    // if (reloop && reloop.visel) {
    //   const scaled = Scale.increaseBy(d, restruct.render.options)
    //   reloop.visel.translate(scaled)
    // }
    // this.data.d = d.negated()

    const inverseOperation = new MoveLoop(this.#loopId, this.#delta.negated())

    return {
      inverseOperation,
      entityId: this.#loopId,
      operationType: this.type
    }
  }
}
