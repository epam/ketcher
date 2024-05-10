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

import { ReRGroup, ReStruct } from '../../../render';

import { BaseOperation } from '../base';
import { OperationType } from '../OperationType';
import { RGroup } from 'domain/entities';

export class RGroupFragment extends BaseOperation {
  rgid_new: any;
  rg_new: any;
  rgid_old: any;
  rg_old: any;
  frid: any;

  constructor(rgroupId: any, fragmentId: any, rg?: any) {
    super(OperationType.R_GROUP_FRAGMENT);
    this.rgid_new = rgroupId;
    this.rg_new = rg;
    this.rgid_old = null;
    this.rg_old = null;
    this.frid = fragmentId;
  }

  execute(restruct: ReStruct) {
    // eslint-disable-line max-statements
    const struct = restruct.molecule;
    this.rgid_old =
      this.rgid_old || RGroup.findRGroupByFragment(struct.rgroups, this.frid);

    this.rg_old = this.rgid_old ? struct.rgroups.get(this.rgid_old) : null;

    this.removeOld(struct, restruct);
    this.setNew(struct, restruct);
  }

  private removeOld(struct: any, restruct: any) {
    if (!this.rg_old) {
      return;
    }

    this.rg_old.frags.delete(this.frid);
    restruct.clearVisel(restruct.rgroups.get(this.rgid_old).visel);

    if (this.rg_old.frags.size === 0) {
      restruct.rgroups.delete(this.rgid_old);
      struct.rgroups.delete(this.rgid_old);
      restruct.markItemRemoved();
    } else {
      restruct.markItem('rgroups', this.rgid_old, 1);
    }
  }

  private setNew(struct: any, restruct: ReStruct) {
    if (!this.rgid_new) {
      return;
    }

    let rgNew = struct.rgroups.get(this.rgid_new);
    if (!rgNew) {
      rgNew = this.rg_new || new RGroup();
      struct.rgroups.set(this.rgid_new, rgNew);
      restruct.rgroups.set(this.rgid_new, new ReRGroup(rgNew));
    } else {
      restruct.markItem('rgroups', this.rgid_new, 1);
    }

    rgNew.frags.add(this.frid);
  }

  invert() {
    return new RGroupFragment(this.rgid_old, this.frid, this.rg_old);
  }
}
