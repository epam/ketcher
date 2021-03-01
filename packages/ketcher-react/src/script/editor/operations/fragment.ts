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
import { Fragment } from 'ketcher-core'
import Restruct, { ReEnhancedFlag, ReFrag } from '../../render/restruct'
import { BaseOperation } from './base'
import { OperationType } from './OperationType'

// todo: separate classes: now here is circular dependency in `invert` method

class FragmentAdd extends BaseOperation {
  frid: any

  constructor(fragmentId: any) {
    super(OperationType.FRAGMENT_ADD)
    this.frid = typeof fragmentId === 'undefined' ? null : fragmentId
  }

  execute(restruct: Restruct) {
    const struct = restruct.molecule
    const frag = new Fragment()

    if (this.frid === null) {
      this.frid = struct.frags.add(frag)
    } else {
      struct.frags.set(this.frid, frag)
    }

    restruct.frags.set(this.frid, new ReFrag(frag)) // TODO add ReStruct.notifyFragmentAdded
    restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag(null, null))
  }

  invert() {
    return new FragmentDelete(this.frid)
  }
}

class FragmentDelete extends BaseOperation {
  frid: any

  constructor(fragmentId: any) {
    super(OperationType.FRAGMENT_DELETE)
    this.frid = fragmentId
  }

  execute(restruct: Restruct) {
    const struct = restruct.molecule
    if (!struct.frags.get(this.frid)) {
      return
    }

    BaseOperation.invalidateItem(restruct, 'frags', this.frid, 1)
    restruct.frags.delete(this.frid)
    struct.frags.delete(this.frid) // TODO add ReStruct.notifyFragmentRemoved

    restruct.clearVisel(restruct.enhancedFlags.get(this.frid).visel)
    restruct.enhancedFlags.delete(this.frid)
  }

  invert() {
    return new FragmentAdd(this.frid)
  }
}

export { FragmentAdd, FragmentDelete }
