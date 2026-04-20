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

import { AtomAttributes, Point } from 'domain/entities';
import { ReStruct } from '../../../render';

import { BaseOperation } from '../BaseOperation';
import { OperationPriority, OperationType } from '../OperationType';

type Data = {
  aid: number | null;
  atom: Partial<AtomAttributes> | null;
  pos: Point | null;
};

class AtomDelete extends BaseOperation {
  data: Data;
  static InverseConstructor: new () => BaseOperation;

  constructor(atomId?: number) {
    super(OperationType.ATOM_DELETE, OperationPriority.ATOM_DELETE);
    this.data = { aid: atomId ?? null, atom: null, pos: null };
  }

  execute(restruct: ReStruct) {
    const { aid } = this.data;
    if (aid === null) return;

    const struct = restruct.molecule;
    if (!this.data.atom) {
      const atomFromStruct = struct.atoms.get(aid);
      if (!atomFromStruct) return;
      this.data.atom = atomFromStruct;
      this.data.pos = atomFromStruct.pp;
    }

    const restructedAtom = restruct.atoms.get(aid);
    if (!restructedAtom) {
      return;
    }

    const set = restruct.connectedComponents.get(restructedAtom.component);
    set.delete(aid);
    if (set.size === 0) {
      restruct.connectedComponents.delete(restructedAtom.component);
    }

    restruct.clearVisel(restructedAtom.visel);
    restruct.atoms.delete(aid);
    restruct.markItemRemoved();
    struct.atoms.delete(aid);
  }

  invert() {
    const inverted = new AtomDelete.InverseConstructor();
    inverted.data = this.data;
    return inverted;
  }
}

export { AtomDelete };
