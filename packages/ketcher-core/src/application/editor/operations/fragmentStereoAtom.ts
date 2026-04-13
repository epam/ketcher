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
import { OperationPriority, OperationType } from './OperationType';
import { ReStruct } from '../../render';

type Data = {
  frid: number;
  aid: number;
};

class FragmentStereoAtom extends BaseOperation {
  readonly data: Data;
  private readonly add: boolean;

  constructor(fragmentId: number, atomId: number, add: boolean) {
    super(
      add
        ? OperationType.FRAGMENT_ADD_STEREO_ATOM
        : OperationType.FRAGMENT_DELETE_STEREO_ATOM,
      add
        ? OperationPriority.FRAGMENT_ADD_STEREO_ATOM
        : OperationPriority.FRAGMENT_DELETE_STEREO_ATOM,
    );
    this.data = { frid: fragmentId, aid: atomId };
    this.add = add;
  }

  execute(restruct: ReStruct) {
    const { aid, frid } = this.data;

    const frag = restruct.molecule.frags.get(frid);
    if (frag) {
      frag.updateStereoAtom(restruct.molecule, aid, frid, this.add);
      BaseOperation.invalidateEnhancedFlag(restruct, frid);
    }
  }

  invert() {
    return new FragmentStereoAtom(this.data.frid, this.data.aid, !this.add);
  }
}

class FragmentAddStereoAtom extends FragmentStereoAtom {
  constructor(fragmentId: number, atomId: number) {
    super(fragmentId, atomId, true);
  }
}

class FragmentDeleteStereoAtom extends FragmentStereoAtom {
  constructor(fragmentId: number, atomId: number) {
    super(fragmentId, atomId, false);
  }
}

export { FragmentStereoAtom, FragmentAddStereoAtom, FragmentDeleteStereoAtom };
