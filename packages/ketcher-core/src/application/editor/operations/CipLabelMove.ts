/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Vec2 } from 'domain/entities/vec2';

import { BaseOperation } from './BaseOperation';
import { OperationType } from './OperationType';
import type { ReStruct } from '../../render';

export type CipLabelOwner = 'atoms' | 'bonds';

interface CipLabelMoveData {
  owner: CipLabelOwner;
  id: number;
  delta: Vec2;
}

export class CipLabelMove extends BaseOperation<CipLabelMoveData> {
  constructor(owner: CipLabelOwner, id: number, delta: Vec2) {
    super(OperationType.CIP_LABEL_MOVE);
    this.data = { owner, id, delta };
  }

  execute(restruct: ReStruct) {
    const { owner, id, delta } = this.data;
    const entity =
      owner === 'atoms'
        ? restruct.molecule.atoms.get(id)
        : restruct.molecule.bonds.get(id);
    if (!entity) return;

    entity.cipLabelOffset = Vec2.sum(
      entity.cipLabelOffset ?? new Vec2(),
      delta,
    );
    BaseOperation.invalidateItem(restruct, owner, id, 1);
  }

  invert() {
    const { owner, id, delta } = this.data;
    return new CipLabelMove(owner, id, delta.negated());
  }

  isDummy() {
    const { delta } = this.data;
    return delta.x === 0 && delta.y === 0;
  }
}
