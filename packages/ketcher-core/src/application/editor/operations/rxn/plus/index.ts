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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { ReRxnPlus, ReStruct } from '../../../../render'
import { RxnPlus, Vec2 } from 'domain/entities'

import { BaseOperation } from '../../base'
import { OperationType } from '../../OperationType'

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  plid: any
  pos: any
}

class RxnPlusAdd extends BaseOperation {
  data: Data

  constructor(pos?: any) {
    super(OperationType.RXN_PLUS_ADD)
    this.data = { plid: null, pos }
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule

    const newRxn = new RxnPlus()
    if (typeof this.data.plid === 'number') {
      struct.rxnPluses.set(this.data.plid, newRxn)
    } else {
      this.data.plid = struct.rxnPluses.add(newRxn)
    }

    const { pos, plid } = this.data

    const structRxn = struct.rxnPluses.get(plid)
    // notifyRxnPlusAdded
    restruct.rxnPluses.set(plid, new ReRxnPlus(structRxn))

    struct.rxnPlusSetPos(plid, new Vec2(pos))

    BaseOperation.invalidateItem(restruct, 'rxnPluses', plid, 1)
  }

  invert() {
    const inverted = new RxnPlusDelete()
    inverted.data = this.data
    return inverted
  }
}

class RxnPlusDelete extends BaseOperation {
  data: Data

  constructor(plid?: any) {
    super(OperationType.RXN_PLUS_DELETE)
    this.data = { plid, pos: null }
  }

  execute(restruct: ReStruct) {
    const { plid } = this.data

    const struct = restruct.molecule
    if (!this.data.pos) {
      this.data.pos = struct.rxnPluses.get(plid)!.pp
    }

    // notifyRxnPlusRemoved
    restruct.markItemRemoved()
    const rxn = restruct.rxnPluses.get(plid)
    if (!rxn) return
    restruct.clearVisel(rxn.visel)
    restruct.rxnPluses.delete(plid)

    struct.rxnPluses.delete(plid)
  }

  invert() {
    const inverted = new RxnPlusAdd()
    inverted.data = this.data
    return inverted
  }
}

export { RxnPlusAdd, RxnPlusDelete }
export * from './RxnPlusMove'
