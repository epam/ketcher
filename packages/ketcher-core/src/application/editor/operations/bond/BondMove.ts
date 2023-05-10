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

import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'
import { ReStruct } from '../../../render'
import { Scale } from 'domain/helpers'

export class BondMove extends BaseOperation {
  data: {
    bid: any
    d: any
  }

  constructor(bondId?: any, d?: any) {
    super(OperationType.BOND_MOVE, 2)
    this.data = { bid: bondId, d }
  }

  execute(restruct: ReStruct) {
    const { bid, d } = this.data
    const bond = restruct.bonds.get(bid)
    if (!bond) return

    const scaled = Scale.obj2scaled(d, restruct.render.options)
    bond.visel.translate(scaled)
    this.data.d = d.negated()
  }

  invert() {
    const inverted = new BondMove()
    inverted.data = this.data
    return inverted
  }
}
