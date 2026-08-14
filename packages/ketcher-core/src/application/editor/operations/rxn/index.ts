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

import { RxnArrow, RxnArrowMode } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';

import Base from '../BaseOperation';
import { OperationType } from '../OperationType';
import { ReRxnArrow } from '../../../render';
import { KetcherLogger } from 'utilities';
import type Restruct from 'application/render/restruct/restruct';

// todo: separate classes: now here is circular dependency in `invert` method

type RxnArrowAddData = {
  id?: number;
  pos: Array<Vec2>;
  mode: RxnArrowMode;
  height?: number;
  arrowId?: number;
};

class RxnArrowAdd extends Base<RxnArrowAddData> {
  data: RxnArrowAddData;

  constructor(
    pos: Array<Vec2> = [],
    mode: RxnArrowMode = RxnArrowMode.OpenAngle,
    id?: number,
    height?: number,
    arrowId?: number,
  ) {
    super(OperationType.RXN_ARROW_ADD);
    this.data = { pos, mode, id, height, arrowId };
  }

  execute(restruct: Restruct): void {
    const struct = restruct.molecule;
    const item = new RxnArrow({
      mode: this.data.mode,
      height: this.data.height,
      arrowId: this.data.arrowId,
    });

    if (this.data.id == null) {
      const index = struct.addRxnArrow(item);
      this.data.id = index;
      this.data.arrowId = item.arrowId;
    } else {
      struct.setRxnArrow(this.data.id, item);
    }

    const itemId = this.data.id;
    if (itemId == null) {
      KetcherLogger.error(
        'RxnArrowAdd.execute(): rxnArrow id was not assigned',
      );
      return;
    }

    restruct.rxnArrows.set(itemId, new ReRxnArrow(item));

    const positions = [...this.data.pos];

    struct.rxnArrowSetPos(
      itemId,
      positions.map((p) => new Vec2(p)),
    );

    Base.invalidateItem(restruct, 'rxnArrows', itemId, 1);
  }

  invert(): RxnArrowDelete {
    const itemId = this.data.id;
    if (itemId == null) {
      KetcherLogger.error('RxnArrowAdd.invert(): rxnArrow id was not assigned');
      return new RxnArrowDelete();
    }

    return new RxnArrowDelete(itemId);
  }
}

interface RxnArrowDeleteData {
  id?: number;
  pos?: Array<Vec2>;
  mode?: RxnArrowMode;
  height?: number;
  arrowId?: number;
}

class RxnArrowDelete extends Base<RxnArrowDeleteData> {
  data: RxnArrowDeleteData;
  hasAssignedId: boolean;
  performed: boolean;

  constructor(id?: number) {
    super(OperationType.RXN_ARROW_DELETE);
    this.data = { id, pos: [], mode: RxnArrowMode.OpenAngle };
    this.hasAssignedId = id != null;
    this.performed = false;
  }

  execute(restruct: Restruct): void {
    KetcherLogger.log('RxnArrowDelete.execute(), start', this.data);
    const itemId = this.data.id;
    if (!this.hasAssignedId || itemId == null) {
      KetcherLogger.error(
        'RxnArrowDelete.execute(): rxnArrow id is not assigned',
      );
      return;
    }

    const struct = restruct.molecule;
    const item = struct.rxnArrows.get(itemId);
    if (!item) throw new Error(`rxnArrow not found with id: ${itemId}`);

    this.data.pos = item.pos;
    this.data.mode = item.mode;
    this.data.height = item.height;
    this.data.arrowId = item.arrowId;
    this.performed = true;

    restruct.markItemRemoved();
    const reItem = restruct.rxnArrows.get(itemId);
    if (!reItem) throw new Error(`reRxnArrow not found with id: ${itemId}`);
    restruct.clearVisel(reItem.visel);
    restruct.rxnArrows.delete(itemId);

    struct.rxnArrows.delete(itemId);

    KetcherLogger.log('RxnArrowDelete.execute(), end');
  }

  invert(): Base {
    return new RxnArrowAdd(
      this.data.pos,
      this.data.mode,
      this.data.id,
      this.data.height,
      this.data.arrowId,
    );
  }
}

export { RxnArrowAdd, RxnArrowDelete };
export * from './RxnArrowMove';
export * from './RxnArrowRotate';
export * from './RxnArrowResize';
export * from './plus';
