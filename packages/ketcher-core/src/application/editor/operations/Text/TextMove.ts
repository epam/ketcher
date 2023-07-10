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

import { BaseOperation } from '../base';
import { OperationType } from '../OperationType';
import { ReStruct } from '../../../render';
import { Scale } from 'domain/helpers';

interface TextMoveData {
  id: any;
  d: any;
  noinvalidate?: boolean;
}

export class TextMove extends BaseOperation {
  data: TextMoveData;

  constructor(id: any, d: any, noinvalidate?: boolean) {
    super(OperationType.TEXT_MOVE);
    this.data = { id, d, noinvalidate };
  }

  execute(restruct: ReStruct): void {
    const struct = restruct.molecule;
    const id = this.data.id;
    const difference = this.data.d;
    const item = struct.texts.get(id);
    const renderItem = restruct.texts.get(id);

    if (!item || !renderItem) {
      return;
    }

    item.position.add_(difference);
    item.setPos(renderItem.getReferencePoints());

    renderItem.visel.translate(
      Scale.obj2scaled(difference, restruct.render.options),
    );

    this.data.d = difference.negated();

    if (!this.data.noinvalidate) {
      BaseOperation.invalidateItem(restruct, 'texts', id, 1);
    }
  }

  invert(): BaseOperation {
    const move = new TextMove(
      this.data.id,
      this.data.d,
      this.data.noinvalidate,
    );

    move.data = this.data;

    return move;
  }
}
