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

import Base from '../base';
import { OperationType } from '../OperationType';
import { Scale } from 'domain/helpers';

interface RxnArrowMoveData {
  id: number;
  d: any;
  noinvalidate: boolean;
}

export class RxnArrowMove extends Base {
  data: RxnArrowMoveData;

  constructor(id?: any, d?: any, noinvalidate?: any) {
    super(OperationType.RXN_ARROW_MOVE);
    this.data = { id, d, noinvalidate };
  }

  execute(restruct: any): void {
    const struct = restruct.molecule;
    const id = this.data.id;
    const d = this.data.d;
    const item = struct.rxnArrows.get(id);
    item.pos.forEach((p) => p.add_(d));
    restruct.rxnArrows
      .get(id)
      .visel.translate(Scale.obj2scaled(d, restruct.render.options));
    this.data.d = d.negated();
    if (!this.data.noinvalidate) {
      Base.invalidateItem(restruct, 'rxnArrows', id, 1);
    }
  }

  invert() {
    const move = new RxnArrowMove(
      this.data.id,
      this.data.d,
      this.data.noinvalidate
    );
    move.data = this.data;
    return move;
  }
}
