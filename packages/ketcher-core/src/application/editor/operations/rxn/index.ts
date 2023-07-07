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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { RxnArrow, RxnArrowMode, Vec2 } from 'domain/entities';

import Base from '../base';
import { OperationType } from '../OperationType';
import { ReRxnArrow } from '../../../render';

// todo: separate classes: now here is circular dependency in `invert` method

type RxnArrowAddData = {
  id?: number;
  pos: Array<Vec2>;
  mode: RxnArrowMode;
};

class RxnArrowAdd extends Base {
  data: RxnArrowAddData;

  constructor(
    pos: Array<Vec2> = [],
    mode: RxnArrowMode = RxnArrowMode.OpenAngle,
    id?: number,
  ) {
    super(OperationType.RXN_ARROW_ADD);
    this.data = { pos, mode, id };
  }

  execute(restruct: any): void {
    const struct = restruct.molecule;
    const item = new RxnArrow({ mode: this.data.mode });

    if (this.data.id == null) {
      const index = struct.rxnArrows.add(item);
      this.data.id = index;
    } else {
      struct.rxnArrows.set(this.data.id!, item);
    }

    const itemId = this.data.id!;

    restruct.rxnArrows.set(itemId, new ReRxnArrow(item));

    const positions = [...this.data.pos];

    struct.rxnArrowSetPos(
      itemId,
      positions.map((p) => new Vec2(p)),
    );

    Base.invalidateItem(restruct, 'rxnArrows', itemId, 1);
  }

  invert(): Base {
    return new RxnArrowDelete(this.data.id!);
  }
}

interface RxnArrowDeleteData {
  id: number;
  pos?: Array<Vec2>;
  mode?: RxnArrowMode;
}

class RxnArrowDelete extends Base {
  data: RxnArrowDeleteData;
  performed: boolean;

  constructor(id: number) {
    super(OperationType.RXN_ARROW_DELETE);
    this.data = { id, pos: [], mode: RxnArrowMode.OpenAngle };
    this.performed = false;
  }

  execute(restruct: any): void {
    const struct = restruct.molecule;
    const item = struct.rxnArrows.get(this.data.id) as any;
    this.data.pos = item.pos;
    this.data.mode = item.mode;
    this.performed = true;

    restruct.markItemRemoved();
    restruct.clearVisel(restruct.rxnArrows.get(this.data.id).visel);
    restruct.rxnArrows.delete(this.data.id);

    struct.rxnArrows.delete(this.data.id);
  }

  invert(): Base {
    return new RxnArrowAdd(this.data.pos, this.data.mode, this.data.id);
  }
}

export { RxnArrowAdd, RxnArrowDelete };
export * from './RxnArrowMove';
export * from './RxnArrowRotate';
export * from './RxnArrowResize';
export * from './plus';
