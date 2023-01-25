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
import { SGroup } from 'domain/entities'

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  sgid: any
  aid: any
}

class SGroupAtomAdd extends BaseOperation {
  data: Data

  constructor(sgroupId?: any, aid?: any) {
    super(OperationType.S_GROUP_ATOM_ADD, 3)
    this.data = { sgid: sgroupId, aid }
  }

  execute(restruct: ReStruct) {
    const { aid, sgid } = this.data

    const struct = restruct.molecule
    const atom = struct.atoms.get(aid)!
    const sgroup = struct.sgroups.get(sgid)!

    if (sgroup.atoms.indexOf(aid) >= 0) {
      throw new Error(
        'The same atom cannot be added to an S-group more than once'
      )
    }

    if (!atom) {
      throw new Error('OpSGroupAtomAdd: Atom ' + aid + ' not found')
    }

    struct.atomAddToSGroup(sgid, aid)
    BaseOperation.invalidateAtom(restruct, aid)
  }

  invert() {
    const inverted = new SGroupAtomRemove()
    inverted.data = this.data
    return inverted
  }
}

class SGroupAtomRemove extends BaseOperation {
  data: Data

  constructor(sgroupId?: any, aid?: any) {
    super(OperationType.S_GROUP_ATOM_REMOVE, 4)
    this.data = { sgid: sgroupId, aid }
  }

  execute(restruct: ReStruct) {
    const { aid, sgid } = this.data

    const struct = restruct.molecule
    const atom = struct.atoms.get(aid)!
    const sgroup = struct.sgroups.get(sgid)!

    if (!atom || !sgroup) {
      return
    }

    SGroup.removeAtom(sgroup, aid)
    atom.sgs.delete(sgid)
    BaseOperation.invalidateAtom(restruct, aid)
  }

  invert() {
    const inverted = new SGroupAtomAdd()
    inverted.data = this.data
    return inverted
  }
}

export { SGroupAtomAdd, SGroupAtomRemove }
