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

import { BaseOperation } from '../../BaseOperation';
import { OperationType } from '../../OperationType';
import { ReStruct } from '../../../../render';
import { Scale } from 'domain/helpers';
import { Vec2 } from 'domain/entities/vec2';

export class RxnPlusMove extends BaseOperation {
  data: {
    id: number;
    d: Vec2;
    noinvalidate: boolean | undefined;
  };

  constructor(id: number, d: Vec2, noinvalidate?: boolean) {
    super(OperationType.RXN_PLUS_MOVE);
    this.data = { id, d, noinvalidate };
  }

  execute(restruct: ReStruct) {
    const { id, d, noinvalidate } = this.data;

    const struct = restruct.molecule;
    struct.rxnPluses.get(id)!.pp.add_(d); // eslint-disable-line no-underscore-dangle

    const rxn = restruct.rxnPluses.get(id)!;
    const scaled = Scale.modelToCanvas(d, restruct.render.options);
    rxn.visel.translate(scaled);

    this.data.d = d.negated();

    if (!noinvalidate) {
      BaseOperation.invalidateItem(restruct, 'rxnPluses', id, 1);
    }
  }

  invert() {
    return new RxnPlusMove(this.data.id, this.data.d, this.data.noinvalidate);
  }

  isDummy() {
    const { d } = this.data;
    return d.x === 0 && d.y === 0;
  }
}
