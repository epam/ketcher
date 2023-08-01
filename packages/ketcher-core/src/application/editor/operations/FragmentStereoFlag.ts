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

import { BaseOperation } from './base';
import { OperationType } from './OperationType';
import { ReStruct } from '../../render';

export class FragmentStereoFlag extends BaseOperation {
  frid: number;

  constructor(fragmentId: number) {
    super(OperationType.FRAGMENT_STEREO_FLAG, 6);
    this.frid = fragmentId;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;

    const fragment = struct.frags.get(this.frid)!;
    fragment.updateStereoFlag(struct);

    BaseOperation.invalidateEnhancedFlag(restruct, this.frid);
  }

  invert() {
    const inverted = new FragmentStereoFlag(this.frid);
    return inverted;
  }
}
