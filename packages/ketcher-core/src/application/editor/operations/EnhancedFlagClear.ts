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

import { Vec2 } from 'domain/entities';
import { BaseOperation } from './BaseOperation';
import { OperationType } from './OperationType';
import { ReStruct } from '../../render';

export class EnhancedFlagClear extends BaseOperation {
  data: {
    frid: number;
    previousPosition?: Vec2;
  };

  restorePosition?: Vec2;

  constructor(fragmentId: number) {
    super(OperationType.ENHANCED_FLAG_MOVE);
    this.data = { frid: fragmentId };
  }

  execute(restruct: ReStruct) {
    const { frid } = this.data;
    const fragment = restruct.molecule.frags.get(frid);
    if (!fragment) return;

    // Store previous position for undo
    this.data.previousPosition = fragment.stereoFlagPosition
      ? new Vec2(fragment.stereoFlagPosition.x, fragment.stereoFlagPosition.y)
      : undefined;

    // Clear the position so it recalculates to default based on new atom positions
    fragment.stereoFlagPosition = undefined;

    BaseOperation.invalidateItem(restruct, 'enhancedFlags', frid, 1);
  }

  invert() {
    const inverted = new EnhancedFlagClear(this.data.frid);
    // On invert, restore the previous position
    if (this.data.previousPosition) {
      inverted.restorePosition = this.data.previousPosition;
    }
    return inverted;
  }
}
