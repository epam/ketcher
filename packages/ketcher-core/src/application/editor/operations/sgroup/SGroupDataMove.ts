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

import { BaseOperation } from '../BaseOperation';
import { OperationType } from '../OperationType';
import type { ReStruct } from '../../../render';
import type { Vec2 } from 'domain/entities/vec2';

export class SGroupDataMove extends BaseOperation {
  data: {
    id: number | undefined;
    d: Vec2 | undefined;
    movesContractedLabel: boolean;
    nextContractedLabelMoved: boolean;
    previousPosition: Vec2 | null;
    restorePosition: boolean;
  };

  constructor(id?: number, d?: Vec2, movesContractedLabel = false) {
    super(OperationType.S_GROUP_DATA_MOVE);
    this.data = {
      id,
      d,
      movesContractedLabel,
      nextContractedLabelMoved: true,
      previousPosition: null,
      restorePosition: false,
    };
  }

  execute(restruct: ReStruct) {
    const { d, id } = this.data;
    if (id === undefined || d === undefined) return;
    const { sgroups } = restruct.molecule;
    const sgroup = sgroups.get(id);
    if (!sgroup) return;

    if (this.data.movesContractedLabel) {
      const previousPosition = sgroup.pp;
      sgroup.pp = this.data.restorePosition
        ? this.data.previousPosition
        : sgroup.getContractedPosition(restruct.molecule).position.add(d);
      this.data.previousPosition = previousPosition;
      this.data.restorePosition = !this.data.restorePosition;
    } else {
      sgroup.pp?.add_(d);
    }
    if (this.data.movesContractedLabel) {
      const previous = sgroup.contractedLabelMoved;
      sgroup.contractedLabelMoved = this.data.nextContractedLabelMoved;
      this.data.nextContractedLabelMoved = previous;
    }
    this.data.d = d.negated();

    if (sgroup.isContracted?.()) {
      const { atomId } = sgroup.getContractedPosition(restruct.molecule);
      BaseOperation.invalidateAtom(restruct, atomId, 1);
      BaseOperation.invalidateItem(restruct, 'sgroups', id, 1);
    }

    // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
    BaseOperation.invalidateItem(restruct, 'sgroupData', id, 1);
  }

  invert() {
    const inverted = new SGroupDataMove();
    inverted.data = this.data;
    return inverted;
  }

  isDummy() {
    const { d } = this.data;
    return d?.x === 0 && d?.y === 0;
  }
}
