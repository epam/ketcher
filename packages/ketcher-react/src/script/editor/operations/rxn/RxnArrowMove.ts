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

import { scale } from 'ketcher-core'
import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'
import Restruct from '../../../render/restruct'

export class RxnArrowMove extends BaseOperation {
  data: {
    id: any
    d: any
    noinvalidate: any
  }

  constructor(id?: any, d?: any, noinvalidate?: any) {
    super(OperationType.RXN_ARROW_MOVE)
    this.data = { id, d, noinvalidate }
  }

  execute(restruct: Restruct) {
    const { d, id, noinvalidate } = this.data

    const struct = restruct.molecule
    struct.rxnArrows.get(id)!.pp.add_(d) // eslint-disable-line no-underscore-dangle

    const rxn = restruct.rxnArrows.get(id)
    const scaled = scale.obj2scaled(d, restruct.render.options)
    rxn.visel.translate(scaled)

    this.data.d = d.negated()
    if (!noinvalidate) {
      BaseOperation.invalidateItem(restruct, 'rxnArrows', id, 1)
    }
  }

  invert() {
    const inverted = new RxnArrowMove()
    inverted.data = this.data
    return inverted
  }
}
