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
import Restruct from '../../render/restruct'
import { BaseOperation } from './base'
import { OperationType } from './OperationType'

export class FragmentStereoFlag extends BaseOperation {
  frid: any
  flag: boolean
  invert_flag: any

  constructor(fragmentId: any, flag = false) {
    super(OperationType.FRAGMENT_STEREO_FLAG)
    this.frid = fragmentId
    this.flag = flag
    this.invert_flag = null
  }

  execute(restruct: Restruct) {
    const struct = restruct.molecule

    const fragment = struct.frags.get(this.frid)!
    if (!this.invert_flag) {
      this.invert_flag = fragment.enhancedStereoFlag
    }
    fragment.updateStereoFlag(struct, this.flag)

    BaseOperation.invalidateEnhancedFlag(
      restruct,
      this.frid,
      fragment.enhancedStereoFlag
    )
  }

  invert() {
    const inverted = new FragmentStereoFlag(this.frid)
    inverted.flag = this.invert_flag
    inverted.invert_flag = this.flag
    return inverted
  }
}
