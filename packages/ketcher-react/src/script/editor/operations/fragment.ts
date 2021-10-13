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

import { Fragment, ReEnhancedFlag, ReFrag, ReStruct } from 'ketcher-core'

import { BaseOperation } from './base'
import { OperationType } from './OperationType'

// todo: separate classes: now here is circular dependency in `invert` method

class FragmentAdd extends BaseOperation {
  frid: any

  constructor(fragmentId?: any) {
    super(OperationType.FRAGMENT_ADD)
    this.frid = typeof fragmentId === 'undefined' ? null : fragmentId
  }

  execute(ReStruct: ReStruct) {
    const struct = ReStruct.molecule
    const frag = new Fragment()

    if (this.frid === null) {
      this.frid = struct.frags.add(frag)
    } else {
      struct.frags.set(this.frid, frag)
    }

    ReStruct.frags.set(this.frid, new ReFrag(frag)) // TODO add ReStruct.notifyFragmentAdded
    ReStruct.enhancedFlags.set(this.frid, new ReEnhancedFlag())
  }

  invert() {
    return new FragmentDelete(this.frid)
  }
}

class FragmentDelete extends BaseOperation {
  frid: any

  constructor(fragmentId: any) {
    super(OperationType.FRAGMENT_DELETE, 100)
    this.frid = fragmentId
  }

  execute(ReStruct: ReStruct) {
    const struct = ReStruct.molecule
    if (!struct.frags.get(this.frid)) {
      return
    }

    BaseOperation.invalidateItem(ReStruct, 'frags', this.frid, 1)
    ReStruct.frags.delete(this.frid)
    struct.frags.delete(this.frid) // TODO add ReStruct.notifyFragmentRemoved

    const enhancedFalg = ReStruct.enhancedFlags.get(this.frid)
    if (!enhancedFalg) return
    ReStruct.clearVisel(enhancedFalg.visel)
    ReStruct.enhancedFlags.delete(this.frid)
  }

  invert() {
    return new FragmentAdd(this.frid)
  }
}

export { FragmentAdd, FragmentDelete }
