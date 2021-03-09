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
import Restruct from '../../../render/restruct'
import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

type Data = {
  bid: any
  attribute: any
  value: any
}

export class BondAttr extends BaseOperation {
  data: Data
  data2: Data | null

  constructor(bondId?: any, attribute?: any, value?: any) {
    super(OperationType.BOND_ATTR)
    this.data = { bid: bondId, attribute, value }
    this.data2 = null
  }

  execute(restruct: Restruct) {
    const { attribute, bid, value } = this.data
    const bond = restruct.molecule.bonds.get(bid)!

    if (!this.data2) {
      this.data2 = {
        bid: bid,
        attribute: attribute,
        value: bond[attribute]
      }
    }

    bond[attribute] = value

    BaseOperation.invalidateBond(restruct, bid)
    if (attribute === 'type') {
      BaseOperation.invalidateLoop(restruct, bid)
    }
  }

  isDummy(restruct: Restruct) {
    const { attribute, bid, value } = this.data
    const bond = restruct.molecule.bonds.get(bid)!
    return bond[attribute] === value
  }

  invert() {
    const inverted = new BondAttr()
    // @ts-ignore
    inverted.data = this.data2
    inverted.data2 = this.data
    return inverted
  }
}
