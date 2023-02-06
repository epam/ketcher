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

export class SGroupAttr extends BaseOperation {
  data: {
    sgid: any
    attr: any
    value: any
  }

  constructor(sgroupId?: any, attribute?: any, value?: any) {
    super(OperationType.S_GROUP_ATTR, 4)
    this.data = {
      sgid: sgroupId,
      attr: attribute,
      value
    }
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule
    const sgroupId = this.data.sgid!
    const sgroup = struct.sgroups.get(sgroupId)!

    if (!sgroup) {
      return
    }

    const sgroupData = restruct.sgroupData.get(sgroupId)
    if (sgroup.type === 'DAT' && sgroupData) {
      // clean the stuff here, else it might be left behind if the sgroups is set to "attached"
      restruct.clearVisel(sgroupData.visel)
      restruct.sgroupData.delete(sgroupId)
    }

    this.data.value = sgroup.setAttr(this.data.attr, this.data.value)
  }

  invert() {
    const inverted = new SGroupAttr()
    inverted.data = this.data
    return inverted
  }
}
