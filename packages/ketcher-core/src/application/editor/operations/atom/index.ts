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

import { Atom, Pile, Vec2 } from 'domain/entities'
import { ReAtom, ReStruct } from '../../../render'

import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  aid: any
  atom: any
  pos: any
}

class AtomAdd extends BaseOperation {
  data: Data

  constructor(atom?: any, pos?: any) {
    super(OperationType.ATOM_ADD)
    this.data = { atom, pos, aid: null }
  }

  execute(restruct: ReStruct) {
    const { atom, pos } = this.data

    const struct = restruct.molecule

    const pp: { label: string } = { label: '' }
    if (atom) {
      Object.keys(atom).forEach((p) => {
        pp[p] = atom[p]
      })
    }

    pp.label = pp.label || 'C'
    if (typeof this.data.aid !== 'number') {
      this.data.aid = struct.atoms.add(new Atom(pp))
    } else {
      struct.atoms.set(this.data.aid, new Atom(pp))
    }

    const { aid } = this.data

    // notifyAtomAdded
    const atomData = new ReAtom(struct.atoms.get(aid)!)

    atomData.component = restruct.connectedComponents.add(new Pile([aid]))
    restruct.atoms.set(aid, atomData)
    restruct.markAtom(aid, 1)

    struct.atomSetPos(aid, new Vec2(pos))

    const arrow = struct.rxnArrows.get(0)
    if (arrow) {
      const atom = struct.atoms.get(aid)!
      atom.rxnFragmentType = struct.defineRxnFragmentTypeForAtomset(
        new Pile([aid]),
        arrow.pos[0].x
      )
    }
  }

  invert() {
    const inverted = new AtomDelete()
    inverted.data = this.data
    return inverted
  }
}

class AtomDelete extends BaseOperation {
  data: Data

  constructor(atomId?: any) {
    super(OperationType.ATOM_DELETE, 5)
    this.data = { aid: atomId, atom: null, pos: null }
  }

  execute(restruct: ReStruct) {
    const { aid } = this.data

    const struct = restruct.molecule
    if (!this.data.atom) {
      this.data.atom = struct.atoms.get(aid)
      this.data.pos = this.data.atom.pp
    }

    // notifyAtomRemoved(aid);
    const restructedAtom = restruct.atoms.get(aid)
    if (!restructedAtom) {
      return
    }

    const set = restruct.connectedComponents.get(restructedAtom.component)
    set.delete(aid)
    if (set.size === 0) {
      restruct.connectedComponents.delete(restructedAtom.component)
    }

    restruct.clearVisel(restructedAtom.visel)
    restruct.atoms.delete(aid)
    restruct.markItemRemoved()
    struct.atoms.delete(aid)
  }

  invert() {
    const inverted = new AtomAdd()
    inverted.data = this.data
    return inverted
  }
}

export { AtomAdd, AtomDelete }
export * from './AtomAttr'
export * from './AtomMove'
