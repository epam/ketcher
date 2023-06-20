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

type Data = {
  bid: any
  attribute: any
  value: any
}

export class BondAttr extends BaseOperation {
  data: Data | null
  data2: Data | null

  constructor(bondId?: any, attribute?: any, value?: any) {
    super(OperationType.BOND_ATTR, 2)
    this.data = { bid: bondId, attribute, value }
    this.data2 = null
  }

  execute(restruct: ReStruct) {
    if (this.data) {
      const { attribute, bid, value } = this.data
      const bond = restruct.molecule.bonds.get(bid)!

      if (!this.data2) {
        this.data2 = {
          bid,
          attribute,
          value: bond[attribute]
        }
      }

      bond[attribute] = value

      BaseOperation.invalidateBond(restruct, bid)
      if (attribute === 'type') {
        BaseOperation.invalidateLoop(restruct, bid)
      }
    }
  }

  isDummy(restruct: ReStruct) {
    if (this.data) {
      const { attribute, bid, value } = this.data
      const bond = restruct.molecule.bonds.get(bid)!
      return bond[attribute] === value
    }
    return false
  }

  invert() {
    const inverted = new BondAttr()
    inverted.data = this.data2
    inverted.data2 = this.data
    return inverted
  }
}
