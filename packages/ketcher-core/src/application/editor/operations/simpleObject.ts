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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { SimpleObject, SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';

import Base from './BaseOperation';
import { OperationType } from './OperationType';
import { ReSimpleObject, type ReStruct } from '../../render';
import { Scale } from 'domain/helpers';
import { getOrThrow } from 'utilities';
import { constrainToCircle } from 'domain/staticObjects/geometry';
import type { ShapeGeometry } from 'domain/staticObjects/types';

interface SimpleObjectAddData {
  id?: number;
  pos: Array<Vec2>;
  mode: SimpleObjectMode;
  toCircle: boolean;
}
export class SimpleObjectAdd extends Base<SimpleObjectAddData> {
  readonly data: SimpleObjectAddData;

  constructor(
    pos: Array<Vec2> = [],
    mode: SimpleObjectMode = SimpleObjectMode.line,
    shouldConvertToCircle = false,
    id?: number,
  ) {
    super(OperationType.SIMPLE_OBJECT_ADD);
    this.data = { pos, mode, toCircle: shouldConvertToCircle, id };
  }

  execute(restruct: ReStruct): void {
    const struct = restruct.molecule;
    const item = new SimpleObject({ mode: this.data.mode });

    let itemId: number;
    if (this.data.id == undefined) {
      itemId = struct.simpleObjects.add(item);
      this.data.id = itemId;
    } else {
      itemId = this.data.id;
      struct.simpleObjects.set(itemId, item);
    }

    restruct.simpleObjects.set(itemId, new ReSimpleObject(item));

    const positions = [...this.data.pos];
    if (this.data.toCircle) {
      positions[1] = makeCircleFromEllipse(positions[0], positions[1]);
    }
    struct.simpleObjectSetPos(
      itemId,
      positions.map((p) => new Vec2(p)),
    );

    Base.invalidateItem(restruct, 'simpleObjects', itemId, 1);
  }

  invert(): SimpleObjectDelete {
    if (this.data.id === undefined) {
      throw new Error('SimpleObjectAdd: cannot invert before execute');
    }
    return new SimpleObjectDelete(this.data.id);
  }
}

interface SimpleObjectDeleteData {
  id: number;
  pos?: Array<Vec2>;
  mode?: SimpleObjectMode;
  toCircle?: boolean;
}

export class SimpleObjectDelete extends Base {
  readonly data: SimpleObjectDeleteData;
  performed: boolean;

  constructor(id: number) {
    super(OperationType.SIMPLE_OBJECT_DELETE);
    this.data = { id, pos: [], mode: SimpleObjectMode.line, toCircle: false };
    this.performed = false;
  }

  execute(restruct: ReStruct): void {
    const struct = restruct.molecule;
    const item = getOrThrow(
      struct.simpleObjects,
      this.data.id,
      `Simple object with id ${this.data.id} not found`,
    );
    // save to data current values. In future they could be used in invert for restoring simple object
    this.data.pos = item.pos;
    this.data.mode = item.mode;
    this.performed = true;

    restruct.markItemRemoved();
    restruct.clearVisel(
      getOrThrow(
        restruct.simpleObjects,
        this.data.id,
        `ReSimpleObject with id ${this.data.id} not found`,
      ).visel,
    );
    restruct.simpleObjects.delete(this.data.id);

    struct.simpleObjects.delete(this.data.id);
  }

  invert(): Base {
    return new SimpleObjectAdd(
      this.data.pos,
      this.data.mode,
      this.data.toCircle,
      this.data.id,
    );
  }
}

interface SimpleObjectMoveData {
  id: number;
  d: Vec2;
  noinvalidate: boolean;
}

export class SimpleObjectMove extends Base {
  data: SimpleObjectMoveData;

  constructor(id: number, d: Vec2, shouldSkipInvalidation: boolean) {
    super(OperationType.SIMPLE_OBJECT_MOVE);
    this.data = { id, d, noinvalidate: shouldSkipInvalidation };
  }

  execute(restruct: ReStruct): void {
    const struct = restruct.molecule;
    const id = this.data.id;
    const d = this.data.d;
    const item = getOrThrow(
      struct.simpleObjects,
      id,
      `Simple object with id ${id} not found`,
    );
    item.pos.forEach((p) => p.add_(d));
    getOrThrow(
      restruct.simpleObjects,
      id,
      `ReSimpleObject with id ${id} not found`,
    ).visel.translate(Scale.modelToCanvas(d, restruct.render.options));
    this.data.d = d.negated();
    if (!this.data.noinvalidate) {
      Base.invalidateItem(restruct, 'simpleObjects', id, 1);
    }
  }

  invert(): Base {
    const move = new SimpleObjectMove(
      this.data.id,
      this.data.d,
      this.data.noinvalidate,
    );
    // todo Need further investigation on why this is needed?
    move.data = this.data;
    return move;
  }

  isDummy() {
    const { d } = this.data;
    return d.x === 0 && d.y === 0;
  }
}

export class SimpleObjectSetGeometry extends Base {
  private previousGeometry: ShapeGeometry | null = null;

  constructor(
    private readonly id: number,
    private readonly geometry: ShapeGeometry,
  ) {
    super(OperationType.SIMPLE_OBJECT_RESIZE);
  }

  execute(restruct: ReStruct): void {
    const item = getOrThrow(
      restruct.molecule.simpleObjects,
      this.id,
      `Simple object with id ${this.id} not found`,
    );
    this.previousGeometry = item.geometry;
    item.setGeometry(this.geometry);
    Base.invalidateItem(restruct, 'simpleObjects', this.id, 1);
  }

  invert(): Base {
    if (!this.previousGeometry) {
      throw new Error('SimpleObjectSetGeometry: cannot invert before execute');
    }
    return new SimpleObjectSetGeometry(this.id, this.previousGeometry);
  }

  isDummy(restruct?: ReStruct) {
    const item = restruct?.molecule.simpleObjects.get(this.id);
    if (!item) {
      return false;
    }
    const { start, end } = item.geometry;
    return (
      start.x === this.geometry.start.x &&
      start.y === this.geometry.start.y &&
      end.x === this.geometry.end.x &&
      end.y === this.geometry.end.y
    );
  }
}

export function makeCircleFromEllipse(position0: Vec2, position1: Vec2): Vec2 {
  return constrainToCircle(position0, position1);
}
