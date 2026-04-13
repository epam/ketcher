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

import { BaseOperation } from './BaseOperation';
import { OperationType } from './OperationType';
import { ReStruct } from '../../render';
import { RestoreIfThen } from './RestoreIfThen';

class UpdateIfThen extends BaseOperation {
  readonly rgid_new: number;
  readonly rgid_old: number;
  readonly ifThenHistory: Map<number, number>;
  readonly skipRgids: number[];

  constructor(rgNew: number, rgOld: number, skipRgids: number[] = []) {
    super(OperationType.UPDATE_IF_THEN);
    this.rgid_new = rgNew;
    this.rgid_old = rgOld;
    this.ifThenHistory = new Map();
    this.skipRgids = skipRgids || [];
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;

    struct.rgroups.forEach((rg, rgid) => {
      if (rg.ifthen === this.rgid_old && !this.skipRgids.includes(rgid)) {
        rg.ifthen = this.rgid_new;
        this.ifThenHistory.set(rgid, this.rgid_old);
        struct.rgroups.set(rgid, rg);
      }
    });
  }

  invert() {
    return new RestoreIfThen(this.rgid_new, this.rgid_old, this.ifThenHistory);
  }
}

export { UpdateIfThen };
