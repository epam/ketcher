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

class FragmentDeleteStereoAtom extends BaseOperation {
  readonly data: { frid: number; aid: number };
  static InverseConstructor: new (
    fragmentId: number,
    atomId: number,
  ) => BaseOperation;

  constructor(fragmentId: number, atomId: number) {
    super(
      OperationType.FRAGMENT_DELETE_STEREO_ATOM,
      OperationPriority.FRAGMENT_DELETE_STEREO_ATOM,
    );
    this.data = { frid: fragmentId, aid: atomId };
  }

  execute(restruct: ReStruct) {
    const { aid, frid } = this.data;
    const frag = restruct.molecule.frags.get(frid);
    if (frag) {
      frag.updateStereoAtom(restruct.molecule, aid, frid, false);
      BaseOperation.invalidateEnhancedFlag(restruct, frid);
    }
  }

  invert() {
    return new FragmentDeleteStereoAtom.InverseConstructor(
      this.data.frid,
      this.data.aid,
    );
  }
}

export { FragmentDeleteStereoAtom };
