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
import { OperationPriority, OperationType } from '../OperationType';
import { ReStruct } from '../../../render';
import { Scale } from 'domain/helpers';
import { Vec2 } from 'domain/entities/vec2';

export class BondMove extends BaseOperation {
  data: {
    bid: number;
    d: Vec2;
  };

  constructor(bondId: number, d: Vec2) {
    super(OperationType.BOND_MOVE, OperationPriority.BOND_MOVE);
    this.data = { bid: bondId, d };
  }

  execute(restruct: ReStruct) {
    const { bid, d } = this.data;
    const bond = restruct.bonds.get(bid);
    if (!bond) return;

    bond.b.center.add_(d);
    const scaled = Scale.modelToCanvas(d, restruct.render.options);
    bond.visel.translate(scaled);
    this.data.d = d.negated();
  }

  invert() {
    return new BondMove(this.data.bid, this.data.d);
  }

  isDummy() {
    const { d } = this.data;
    return d.x === 0 && d.y === 0;
  }
}
