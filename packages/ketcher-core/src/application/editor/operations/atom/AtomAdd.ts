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

import { Atom, AtomAttributes, Pile, Point, Vec2 } from 'domain/entities';
import { ReAtom, ReStruct } from '../../../render';

import { BaseOperation } from '../BaseOperation';
import { OperationType } from '../OperationType';
import { AtomDelete } from './AtomDelete';

type Data = {
  aid: number | null;
  atom: Partial<AtomAttributes> | null;
  pos: Point | null;
};

class AtomAdd extends BaseOperation {
  data: Data;

  constructor(atom?: Partial<AtomAttributes>, pos?: Point) {
    super(OperationType.ATOM_ADD);
    this.data = { atom: atom ?? null, pos: pos ?? null, aid: null };
  }

  execute(restruct: ReStruct) {
    const { atom, pos } = this.data;

    const struct = restruct.molecule;

    const pp: Partial<AtomAttributes> & { label: string } = {
      label: '',
      ...(atom ?? {}),
    };
    pp.label = pp.label || 'C';

    let aid: number;
    if (typeof this.data.aid !== 'number') {
      aid = struct.atoms.add(new Atom(pp));
      this.data.aid = aid;
    } else {
      aid = this.data.aid;
      struct.atoms.set(aid, new Atom(pp));
    }

    // notifyAtomAdded
    const reAtom = struct.atoms.get(aid);
    if (!reAtom) return;
    const atomData = new ReAtom(reAtom);

    atomData.component = restruct.connectedComponents.add(new Pile([aid]));
    restruct.atoms.set(aid, atomData);
    restruct.markAtom(aid, 1);

    struct.atomSetPos(aid, new Vec2(pos as Point));

    const arrow = struct.rxnArrows.get(0);
    if (arrow) {
      const atomInstance = struct.atoms.get(aid);
      if (atomInstance) {
        atomInstance.rxnFragmentType = struct.defineRxnFragmentTypeForAtomset(
          new Pile([aid]),
          arrow.pos[0].x,
        );
      }
    }
  }

  invert() {
    const inverted = new AtomDelete();
    inverted.data = this.data;
    return inverted;
  }
}

export { AtomAdd };
