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
  rgid: any
  attribute: any
  value: any
}

export class RGroupAttr extends BaseOperation {
  data: Data | null
  data2: Data | null

  constructor(rgroupId?: any, attribute?: any, value?: any) {
    super(OperationType.R_GROUP_ATTR)
    this.data = { rgid: rgroupId, attribute, value }
    this.data2 = null
  }

  execute(restruct: ReStruct) {
    if (this.data) {
      const { rgid, attribute, value } = this.data

      const rgp = restruct.molecule.rgroups.get(rgid)!

      if (!rgp) {
        return
      }

      if (!this.data2) {
        this.data2 = {
          rgid,
          attribute,
          value: rgp[attribute]
        }
      }

      rgp[attribute] = value

      BaseOperation.invalidateItem(restruct, 'rgroups', rgid)
    }
  }

  invert() {
    const inverted = new RGroupAttr()
    inverted.data = this.data2
    inverted.data2 = this.data
    return inverted
  }

  isDummy(restruct: ReStruct) {
    if (this.data) {
      const { rgid, attribute, value } = this.data
      const rgroup = restruct.molecule.rgroups.get(rgid)!
      return rgroup[attribute] === value
    }
    return false
  }
}
