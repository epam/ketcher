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

import { Atom, AtomAttributes, Struct, Vec2 } from 'domain/entities'
import { AttrValueType, PerformOperationResult } from './operations.types'

import { BaseOperation } from './baseOperation'

export class SetAtomAttr extends BaseOperation {
  #atomId: number
  #attribute: string
  #value: AttrValueType

  constructor(atomId: number, attribute: string, value: AttrValueType) {
    super('ATOM_ATTR', 1)

    this.#atomId = atomId
    this.#attribute = attribute
    this.#value = value
  }

  execute(struct: Struct): PerformOperationResult {
    const atom = struct.atoms.get(this.#atomId)!
    const previousValue = atom[this.#attribute]
    atom[this.#attribute] = this.#value

    const inverseOperation = new SetAtomAttr(
      this.#atomId,
      this.#attribute,
      previousValue
    )
    return {
      inverseOperation,
      entityId: this.#atomId,
      operationType: this.type
    }
  }
}

export class MoveAtom extends BaseOperation {
  #atomId: number
  #delta: Vec2

  constructor(atomId: number, delta: Vec2) {
    super('ATOM_MOVE', 2)

    this.#atomId = atomId
    this.#delta = delta
  }

  execute(struct: Struct): PerformOperationResult {
    const atom = struct.atoms.get(this.#atomId)!
    atom.pp.add_(this.#delta)
    // TODO: move to renderer
    // const reatom = restruct.atoms.get(aid)
    // if (reatom) {
    //   const scaled = Scale.obj2scaled(d, restruct.render.options)
    //   reatom.visel.translate(scaled)
    // }

    const inverseOperation = new MoveAtom(this.#atomId, this.#delta.negated())

    return {
      inverseOperation,
      entityId: this.#atomId,
      operationType: this.type
    }
  }
}

class AddAtom extends BaseOperation {
  #atomId?: number
  #atomAttributes?: AtomAttributes

  constructor(atomAttributes: AtomAttributes, atomId?: number) {
    super('ATOM_ADD')

    this.#atomId = atomId
    this.#atomAttributes = atomAttributes
  }

  execute(struct: Struct): PerformOperationResult {
    const atomAttributes: AtomAttributes = {
      ...{ label: 'C' },
      ...this.#atomAttributes
    }

    let atomId: number
    if (typeof this.#atomId !== 'number') {
      atomId = struct.atoms.add(new Atom(atomAttributes))
    } else {
      struct.atoms.set(this.#atomId, new Atom(atomAttributes))
      atomId = this.#atomId!
    }

    // TODO: move to renderer
    // notifyAtomAdded
    // const atomData = new ReAtom(struct.atoms.get(aid)!)

    // atomData.component = restruct.connectedComponents.add(new Pile([aid]))
    // restruct.atoms.set(aid, atomData)
    // restruct.markAtom(aid, 1)

    const inverseOperation = new DeleteAtom(atomId)

    return {
      inverseOperation,
      entityId: atomId,
      operationType: this.type
    }
  }
}

class DeleteAtom extends BaseOperation {
  #atomId: number

  constructor(atomId: number) {
    super('ATOM_DELETE', 4)

    this.#atomId = atomId
  }

  execute(struct: Struct): PerformOperationResult {
    const atom = struct.atoms.get(this.#atomId)!

    // TODO: to delete
    // const set = restruct.connectedComponents.get(restructedAtom.component)
    // set.delete(aid)
    // if (set.size === 0) {
    //   restruct.connectedComponents.delete(restructedAtom.component)
    // }

    // restruct.clearVisel(restructedAtom.visel)
    // restruct.atoms.delete(aid)
    // restruct.markItemRemoved()
    struct.atoms.delete(this.#atomId)

    const inverseOperation = new AddAtom(atom, this.#atomId)

    return {
      inverseOperation,
      entityId: this.#atomId,
      operationType: this.type
    }
  }
}
