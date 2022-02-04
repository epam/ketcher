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

import { FunctionalGroup, SGroup, Vec2 } from 'domain/entities'
import { ReSGroup, ReStruct } from '../../../render'

import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'
import { HttpFunctionalGroupsProvider } from 'domain/helpers'

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  sgid: any
  type?: any
  pp?: any
  expanded?: boolean
  name?: string
}

class SGroupCreate extends BaseOperation {
  data: Data

  constructor(
    sgroupId?: any,
    type?: any,
    pp?: any,
    expanded?: boolean,
    name?: string
  ) {
    super(OperationType.S_GROUP_CREATE)
    this.data = {
      sgid: sgroupId,
      type,
      pp,
      expanded,
      name
    }
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule
    const sgroup = new SGroup(this.data.type)
    const { sgid, pp, expanded, name } = this.data

    sgroup.id = sgid
    struct.sgroups.set(sgid, sgroup)

    if (pp) {
      struct.sgroups.get(sgid)!.pp = new Vec2(pp)
    }

    if (expanded) {
      sgroup.data.expanded = expanded
    }

    if (name) {
      sgroup.data.name = name
    }

    restruct.sgroups.set(sgid, new ReSGroup(struct.sgroups.get(sgid)))
    if (HttpFunctionalGroupsProvider.isFunctionalGroup(sgroup)) {
      restruct.molecule.functionalGroups.add(new FunctionalGroup(sgroup))
    }
    this.data.sgid = sgid
  }

  invert() {
    const inverted = new SGroupDelete()
    inverted.data = this.data
    return inverted
  }
}

class SGroupDelete extends BaseOperation {
  data: Data

  constructor(sgroupId?: any) {
    super(OperationType.S_GROUP_DELETE, 95)
    this.data = { sgid: sgroupId }
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule
    const { sgid } = this.data
    const sgroup = restruct.sgroups.get(sgid)
    const sgroupData = restruct.sgroupData.get(sgid)
    if (!sgroup) return
    this.data.type = sgroup.item.type
    this.data.pp = sgroup.item.pp

    if (sgroup.item.type === 'DAT' && sgroupData) {
      restruct.clearVisel(sgroupData.visel)
      restruct.sgroupData.delete(sgid)
    }

    restruct.clearVisel(sgroup.visel)
    if (sgroup.item.atoms.length !== 0) {
      throw new Error('S-Group not empty!')
    }

    if (HttpFunctionalGroupsProvider.isFunctionalGroup(sgroup.item)) {
      let relatedFGroupId
      this.data.name = sgroup.item.data.name
      this.data.expanded = sgroup.item.expanded
      restruct.molecule.functionalGroups.forEach((fg, fgid) => {
        if (fg.relatedSGroupId === sgid) {
          relatedFGroupId = fgid
        }
      })
      restruct.molecule.functionalGroups.delete(relatedFGroupId)
    }

    restruct.sgroups.delete(sgid)
    struct.sgroups.delete(sgid)
  }

  invert() {
    const inverted = new SGroupCreate()
    inverted.data = this.data
    return inverted
  }
}

export { SGroupCreate, SGroupDelete }
export * from './sgroupAtom'
export * from './SGroupAttr'
export * from './SGroupDataMove'
export * from './sgroupHierarchy'
