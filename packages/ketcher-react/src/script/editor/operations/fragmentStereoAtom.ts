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

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  frid: any
  aid: any
}

// todo : merge add and delete stereo atom
class FragmentAddStereoAtom extends BaseOperation {
  data: Data

  constructor(fragmentId: any, atomId: any) {
    super(OperationType.FRAGMENT_ADD_STEREO_ATOM)
    this.data = { frid: fragmentId, aid: atomId }
  }

  execute(restruct: Restruct) {
    const { aid, frid } = this.data

    const frag = restruct.molecule.frags.get(frid)!
    frag.updateStereoAtom(restruct.molecule, aid, true)

    BaseOperation.invalidateEnhancedFlag(
      restruct,
      frid,
      frag.enhancedStereoFlag
    )
  }

  invert() {
    return new FragmentDeleteStereoAtom(this.data.frid, this.data.aid)
  }
}

class FragmentDeleteStereoAtom extends BaseOperation {
  data: Data

  constructor(fragmentId: any, atomId: any) {
    super(OperationType.FRAGMENT_DELETE_STEREO_ATOM)
    this.data = { frid: fragmentId, aid: atomId }
  }

  execute(restruct: Restruct) {
    const { aid, frid } = this.data

    const frag = restruct.molecule.frags.get(frid)!
    frag.updateStereoAtom(restruct.molecule, aid, false)

    BaseOperation.invalidateEnhancedFlag(
      restruct,
      frid,
      frag.enhancedStereoFlag
    )
  }

  invert() {
    const { aid, frid } = this.data
    return new FragmentAddStereoAtom(frid, aid)
  }
}

export { FragmentAddStereoAtom, FragmentDeleteStereoAtom }
