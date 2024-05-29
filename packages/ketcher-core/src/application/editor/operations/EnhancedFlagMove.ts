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

import { Fragment, Vec2 } from 'domain/entities';

import { BaseOperation } from './base';
import { OperationType } from './OperationType';
import { ReStruct } from '../../render';

export class EnhancedFlagMove extends BaseOperation {
  data: {
    frid: any;
    p: any;
  };

  constructor(fragmentId?: any, p?: any) {
    super(OperationType.ENHANCED_FLAG_MOVE);
    this.data = { frid: fragmentId, p };
  }

  execute(restruct: ReStruct) {
    const { frid } = this.data;
    const { p } = this.data;
    const fragment = restruct.molecule.frags.get(frid);
    if (!fragment) return;

    const currentPosition = fragment.stereoFlagPosition
      ? new Vec2(fragment.stereoFlagPosition.x, fragment.stereoFlagPosition.y)
      : Fragment.getDefaultStereoFlagPosition(restruct.molecule, frid)!;

    const newPosition = Vec2.sum(currentPosition, p);
    fragment.stereoFlagPosition = newPosition;

    this.data.p = p.negated();
    BaseOperation.invalidateItem(restruct, 'enhancedFlags', frid, 1);
  }

  invert() {
    const inverted = new EnhancedFlagMove();
    inverted.data = this.data;
    return inverted;
  }
}
