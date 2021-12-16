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

import { AttrValueType, PerformOperationResult } from './operations.types'
import { Point, SGroup, Struct, Vec2 } from 'domain/entities'

import { BaseOperation } from './baseOperation'
import assert from 'assert'

class AddSGroup extends BaseOperation {
  #sgroupType: string
  #pp?: Point
  #name?: string
  #expanded?: boolean
  #sgroupId?: number

  constructor(
    type: string,
    pp?: Point,
    expanded?: boolean,
    name?: string,
    sgroupId?: any
  ) {
    super('S_GROUP_ADD')

    this.#sgroupType = type
    this.#pp = pp
    this.#expanded = expanded
    this.#name = name
    this.#sgroupId = sgroupId
  }

  execute(struct: Struct): PerformOperationResult {
    const sgroup = new SGroup(this.#sgroupType)

    if (this.#pp) {
      sgroup.pp = new Vec2(this.#pp)
    }

    if (this.#expanded) {
      sgroup.data.expanded = this.#expanded
    }

    if (this.#name) {
      sgroup.data.name = this.#name
    }

    let sgroupId: number

    if (typeof this.#sgroupId === 'number') {
      struct.sgroups.set(this.#sgroupId, sgroup)
      sgroupId = this.#sgroupId
    } else {
      sgroupId = struct.sgroups.add(sgroup)
    }

    sgroup.id = sgroupId

    // TODO: move to renderer
    // restruct.sgroups.set(sgid, new ReSGroup(struct.sgroups.get(sgid)))
    // if (
    //   FunctionalGroup.isFunctionalGroup(
    //     FunctionalGroupsProvider.getInstance().getFunctionalGroupsList(),
    //     sgroup
    //   )
    // ) {
    //   restruct.molecule.functionalGroups.add(
    //     new FunctionalGroup(sgroup.data.name, sgroup.id, sgroup.data.expanded)
    //   )
    // }

    const inverseOperation = new DeleteSGroup(sgroupId)

    return { inverseOperation, entityId: sgroupId, operationType: this.type }
  }
}

class DeleteSGroup extends BaseOperation {
  #sgroupId: number

  constructor(sgroupId: number) {
    super('S_GROUP_DELETE', 95)

    this.#sgroupId = sgroupId
  }

  execute(struct: Struct): PerformOperationResult {
    const sgroup = struct.sgroups.get(this.#sgroupId)!

    // TODO: move to renderer
    // if (sgroup.item.type === 'DAT' && sgroupData) {
    //   restruct.clearVisel(sgroupData.visel)
    //   restruct.sgroupData.delete(sgid)
    // }

    // restruct.clearVisel(sgroup.visel)
    // if (sgroup.item.atoms.length !== 0) {
    //   throw new Error('S-Group not empty!')
    // }

    // restruct.sgroups.delete(sgid)
    struct.sgroups.delete(this.#sgroupId)

    const inverseOperation = new AddSGroup(
      sgroup.type,
      sgroup.pp!,
      sgroup.data.expanded,
      sgroup.data.name,
      this.#sgroupId
    )

    return {
      inverseOperation,
      entityId: this.#sgroupId,
      operationType: this.type
    }
  }
}

export class AddSGroupAtom extends BaseOperation {
  #sgroupId: number
  #atomId: number

  constructor(sgroupId: number, atomId: number) {
    super('S_GROUP_ATOM_ADD', 3)

    this.#sgroupId = sgroupId
    this.#atomId = atomId
  }

  execute(struct: Struct): PerformOperationResult {
    const atom = struct.atoms.get(this.#atomId)
    const sgroup = struct.sgroups.get(this.#sgroupId)

    assert(atom != null, `Atom ${this.#atomId} not found.`)
    assert(sgroup != null, `S-group ${this.#sgroupId} not found.`)
    assert(
      sgroup.atoms.indexOf(this.#atomId) < 0,
      'The same atom cannot be added to an S-group more than once.'
    )

    SGroup.addAtom(sgroup, this.#atomId)
    atom.sgs.add(this.#sgroupId)
    // BaseOperation.invalidateAtom(restruct, aid)

    const inverseOperation = new DeleteSGroupAtom(this.#sgroupId, this.#atomId)

    return {
      inverseOperation,
      entityId: this.#sgroupId,
      operationType: this.type
    }
  }
}

export class DeleteSGroupAtom extends BaseOperation {
  #sgroupId: number
  #atomId: number

  constructor(sgroupId: number, atomId: number) {
    super('S_GROUP_ATOM_DELETE')

    this.#sgroupId = sgroupId
    this.#atomId = atomId
  }

  execute(struct: Struct): PerformOperationResult {
    const atom = struct.atoms.get(this.#atomId)
    const sgroup = struct.sgroups.get(this.#sgroupId)

    assert(atom != null, `Atom ${this.#atomId} not found.`)
    assert(sgroup != null, `S-group ${this.#sgroupId} not found.`)

    SGroup.removeAtom(sgroup, this.#atomId)
    atom.sgs.delete(this.#sgroupId)
    // BaseOperation.invalidateAtom(restruct, aid)

    const inverseOperation = new AddSGroupAtom(this.#sgroupId, this.#atomId)

    return {
      inverseOperation,
      entityId: this.#sgroupId,
      operationType: this.type
    }
  }
}

export class SetSGroupAttr extends BaseOperation {
  #sgroupId: number
  #attribute: string
  #value: AttrValueType

  constructor(sgroupId: number, attribute: string, value: AttrValueType) {
    super('S_GROUP_ATTR', 4)

    this.#sgroupId = sgroupId
    this.#attribute = attribute
    this.#value = value
  }

  execute(struct: Struct): PerformOperationResult {
    const sgroup = struct.sgroups.get(this.#sgroupId)

    assert(sgroup != null, `S-group ${this.#sgroupId} not found.`)
    // TODO: move to renderer
    // const sgroupData = restruct.sgroupData.get(sgroupId)
    // if (sgroup.type === 'DAT' && sgroupData) {
    //   // clean the stuff here, else it might be left behind if the sgroups is set to "attached"
    //   restruct.clearVisel(sgroupData.visel)
    //   restruct.sgroupData.delete(sgroupId)
    // }

    const previousValue = sgroup.setAttr(
      this.#attribute,
      this.#value
    ) as AttrValueType

    const inverseOperation = new SetSGroupAttr(
      this.#sgroupId,
      this.#attribute,
      previousValue
    )

    return {
      inverseOperation,
      entityId: this.#sgroupId,
      operationType: this.type
    }
  }
}

export class MoveSGroupData extends BaseOperation {
  #sgroupId: number
  #delta: Vec2

  constructor(sgroupId: number, delta: Vec2) {
    super('S_GROUP_DATA_MOVE')

    this.#sgroupId = sgroupId
    this.#delta = delta
  }

  execute(struct: Struct): PerformOperationResult {
    const sgroup = struct.sgroups.get(this.#sgroupId)

    assert(sgroup != null, `S-group ${this.#sgroupId} not found.`)

    sgroup.pp?.add_(this.#delta)

    // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
    // BaseOperation.invalidateItem(restruct, 'sgroupData', id, 1)

    const inverseOperation = new MoveSGroupData(
      this.#sgroupId,
      this.#delta.negated()
    )

    return {
      inverseOperation,
      entityId: this.#sgroupId,
      operationType: this.type
    }
  }
}

export class AddSGroupToHierarchy extends BaseOperation {
  #sgroupId: number
  #parent?: number
  #children?: number[]

  constructor(sgroupId: number, parent?: number, children?: number[]) {
    super('S_GROUP_ADD_TO_HIERACHY', 4)

    this.#sgroupId = sgroupId
    this.#parent = parent
    this.#children = children
  }

  execute(struct: Struct): PerformOperationResult {
    const sgroup = struct.sgroups.get(this.#sgroupId)

    assert(sgroup != null, `S-group ${this.#sgroupId} not found.`)

    struct.sGroupForest.insert(sgroup, this.#parent, this.#children)
    const inverseOperation = new DeleteSGroupFromHierarchy(this.#sgroupId)

    return {
      inverseOperation,
      entityId: this.#sgroupId,
      operationType: this.type
    }
  }
}

class DeleteSGroupFromHierarchy extends BaseOperation {
  #sgroupId: number

  constructor(sgroupId: number) {
    super('S_GROUP_REMOVE_FROM_HIERACHY')

    this.#sgroupId = sgroupId
  }

  execute(struct: Struct): PerformOperationResult {
    const parent = struct.sGroupForest.parent.get(this.#sgroupId)
    const children = struct.sGroupForest.children.get(this.#sgroupId)

    struct.sGroupForest.remove(this.#sgroupId)

    const inverseOperation = new AddSGroupToHierarchy(
      this.#sgroupId,
      parent,
      children
    )

    return {
      inverseOperation,
      entityId: this.#sgroupId,
      operationType: this.type
    }
  }
}
