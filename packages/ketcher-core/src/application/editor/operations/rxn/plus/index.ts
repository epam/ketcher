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

import { type ReStruct, ReRxnPlus } from '../../../../render';
import { RxnPlus } from 'domain/entities/rxnPlus';
import { Vec2 } from 'domain/entities/vec2';

import { BaseOperation } from '../../BaseOperation';
import { OperationType } from '../../OperationType';

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  plid: number | null;
  pos: Vec2 | null;
};

class RxnPlusAdd extends BaseOperation<Data> {
  data: Data;

  constructor(pos?: Vec2) {
    super(OperationType.RXN_PLUS_ADD);
    this.data = { plid: null, pos: pos ?? null };
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;

    const newRxn = new RxnPlus();
    if (typeof this.data.plid === 'number') {
      struct.rxnPluses.set(this.data.plid, newRxn);
    } else {
      this.data.plid = struct.rxnPluses.add(newRxn);
    }

    const { pos } = this.data;
    const plid = this.data.plid as number;

    const structRxn = struct.rxnPluses.get(plid);
    if (!structRxn) return;
    // notifyRxnPlusAdded
    restruct.rxnPluses.set(plid, new ReRxnPlus(structRxn));

    struct.rxnPlusSetPos(plid, pos ? new Vec2(pos) : new Vec2());

    BaseOperation.invalidateItem(restruct, 'rxnPluses', plid, 1);
  }

  invert(): RxnPlusDelete {
    const inverted = new RxnPlusDelete();
    inverted.data = this.data;
    return inverted;
  }
}

class RxnPlusDelete extends BaseOperation {
  data: Data;

  constructor(plid?: number) {
    super(OperationType.RXN_PLUS_DELETE);
    this.data = { plid: plid ?? null, pos: null };
  }

  execute(restruct: ReStruct) {
    const { plid } = this.data;
    if (plid === null) return;

    const struct = restruct.molecule;
    if (!this.data.pos) {
      this.data.pos = struct.rxnPluses.get(plid)!.pp;
    }

    // notifyRxnPlusRemoved
    restruct.markItemRemoved();
    const rxn = restruct.rxnPluses.get(plid);
    if (!rxn) return;
    restruct.clearVisel(rxn.visel);
    restruct.rxnPluses.delete(plid);

    struct.rxnPluses.delete(plid);
  }

  invert() {
    const inverted = new RxnPlusAdd();
    inverted.data = this.data;
    return inverted;
  }
}

export { RxnPlusAdd, RxnPlusDelete };
export * from './RxnPlusMove';
