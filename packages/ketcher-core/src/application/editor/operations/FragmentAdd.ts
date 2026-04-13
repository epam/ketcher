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

import { ReEnhancedFlag, ReFrag, ReStruct } from '../../render';

import { BaseOperation } from './BaseOperation';
import { Fragment, StructProperty } from 'domain/entities';
import { OperationType } from './OperationType';
import { FragmentDelete } from './FragmentDelete';

class FragmentAdd extends BaseOperation {
  frid: number | null;
  readonly properties?: Array<StructProperty>;

  constructor(fragmentId?: number | null, properties?: Array<StructProperty>) {
    super(OperationType.FRAGMENT_ADD);
    this.frid = typeof fragmentId === 'undefined' ? null : fragmentId;
    if (properties) {
      this.properties = properties;
    }
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const frag = new Fragment([], null, this.properties);

    if (this.frid === null) {
      this.frid = struct.frags.add(frag);
    } else {
      struct.frags.set(this.frid, frag);
    }

    restruct.frags.set(this.frid, new ReFrag(frag));
    restruct.markItem('frags', this.frid, 1); // notifyFragmentAdded
    restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag());
  }

  invert() {
    return new FragmentDelete(this.frid as number);
  }
}

export { FragmentAdd };
