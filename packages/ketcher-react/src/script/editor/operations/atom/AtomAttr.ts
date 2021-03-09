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
  aid?: any
  attribute?: any
  value?: any
}

export class AtomAttr extends BaseOperation {
  data: Data
  data2: Data | null

  constructor(atomId?: any, attribute?: any, value?: any) {
    super(OperationType.ATOM_ATTR)
    this.data = { aid: atomId, attribute, value }
    this.data2 = null
  }

  execute(restruct: Restruct) {
    const { aid, attribute, value } = this.data

    const atom = restruct.molecule.atoms.get(aid)!
    if (!this.data2) {
      this.data2 = {
        aid,
        attribute,
        value: atom[attribute]
      }
    }

    atom[attribute] = value
    BaseOperation.invalidateAtom(restruct, aid)
  }

  invert() {
    const inverted = new AtomAttr()
    // @ts-ignore
    inverted.data = this.data2
    inverted.data2 = this.data
    return inverted
  }

  isDummy(restruct: Restruct) {
    return (
      restruct.molecule.atoms.get(this.data.aid)![this.data.attribute] ===
      this.data.value
    )
  }
}
