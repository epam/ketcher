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
import { SGroup, Vec2 } from 'domain/entities';
import { AlignDescriptors } from './AlignDescriptors';

class RestoreDescriptorsPosition extends BaseOperation {
  readonly history: Record<number, Vec2 | null>;

  constructor(history: Record<number, Vec2 | null>) {
    super(OperationType.RESTORE_DESCRIPTORS_POSITION);
    this.history = history;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const sgroups: SGroup[] = Array.from(struct.sgroups.values());

    sgroups.forEach((sgroup) => {
      sgroup.pp = this.history[sgroup.id];
      struct.sgroups.set(sgroup.id, sgroup);
      BaseOperation.invalidateItem(restruct, 'sgroupData', sgroup.id, 1);
    });
  }

  invert() {
    return new AlignDescriptors();
  }
}

export { RestoreDescriptorsPosition };
