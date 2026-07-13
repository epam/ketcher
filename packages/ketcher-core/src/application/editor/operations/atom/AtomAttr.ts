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

import { BaseOperation } from '../BaseOperation';
import { OperationPriority, OperationType } from '../OperationType';
import type { ReStruct } from '../../../render';

type Data = {
  aid?: number;
  attribute?: string;
  value?: unknown;
};

export class AtomAttr extends BaseOperation {
  data: Data | null;
  data2: Data | null;

  constructor(atomId?: number, attribute?: string, value?: unknown) {
    super(OperationType.ATOM_ATTR, OperationPriority.ATOM_ATTR);
    this.data = { aid: atomId, attribute, value };
    this.data2 = null;
  }

  execute(restruct: ReStruct) {
    if (this.data) {
      const { aid, attribute, value } = this.data;
      if (aid === undefined || attribute === undefined) {
        return;
      }

      const atom = restruct.molecule.atoms.get(aid)!;
      if (!this.data2) {
        this.data2 = {
          aid,
          attribute,
          value: Reflect.get(atom, attribute),
        };
      }

      Reflect.set(atom, attribute, value);
      BaseOperation.invalidateAtom(restruct, aid);
    }
  }

  invert() {
    const inverted = new AtomAttr();
    inverted.data = this.data2;
    inverted.data2 = this.data;
    return inverted;
  }

  isDummy(restruct: ReStruct) {
    const data = this.data;
    if (!data) {
      return false;
    }
    const { aid, attribute, value } = data;
    if (aid === undefined || attribute === undefined) {
      return false;
    }
    const atom = restruct.molecule.atoms.get(aid);
    if (!atom) {
      return false;
    }
    return Reflect.get(atom, attribute) === value;
  }
}
