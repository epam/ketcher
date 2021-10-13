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

import { RGroup, ReRGroup, ReStruct } from 'ketcher-core'

import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

export class RGroupFragment extends BaseOperation {
  rgid_new: any
  rg_new: any
  rgid_old: any
  rg_old: any
  frid: any

  constructor(rgroupId: any, fragmentId: any, rg: any) {
    super(OperationType.R_GROUP_FRAGMENT)
    this.rgid_new = rgroupId
    this.rg_new = rg
    this.rgid_old = null
    this.rg_old = null
    this.frid = fragmentId
  }

  execute(ReStruct: ReStruct) {
    // eslint-disable-line max-statements
    const struct = ReStruct.molecule
    this.rgid_old =
      this.rgid_old || RGroup.findRGroupByFragment(struct.rgroups, this.frid)

    this.rg_old = this.rgid_old ? struct.rgroups.get(this.rgid_old) : null

    this.removeOld(struct, ReStruct)
    this.setNew(struct, ReStruct)
  }

  private removeOld(struct: any, ReStruct: any) {
    if (!this.rg_old) {
      return
    }

    this.rg_old.frags.delete(this.frid)
    ReStruct.clearVisel(ReStruct.rgroups.get(this.rgid_old).visel)

    if (this.rg_old.frags.size === 0) {
      ReStruct.rgroups.delete(this.rgid_old)
      struct.rgroups.delete(this.rgid_old)
      ReStruct.markItemRemoved()
    } else {
      ReStruct.markItem('rgroups', this.rgid_old, 1)
    }
  }

  private setNew(struct: any, ReStruct: ReStruct) {
    if (!this.rgid_new) {
      return
    }

    let rgNew = struct.rgroups.get(this.rgid_new)
    if (!rgNew) {
      rgNew = this.rg_new || new RGroup()
      struct.rgroups.set(this.rgid_new, rgNew)
      ReStruct.rgroups.set(this.rgid_new, new ReRGroup(rgNew))
    } else {
      ReStruct.markItem('rgroups', this.rgid_new, 1)
    }

    rgNew.frags.add(this.frid)
  }

  invert() {
    return new RGroupFragment(this.rgid_old, this.frid, this.rg_old)
  }
}
