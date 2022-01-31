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

import {
  Point,
  SimpleObject,
  SimpleObjectMode,
  Struct,
  Vec2
} from 'domain/entities'

import { BaseOperation } from './baseOperation'
import { PerformOperationResult } from './operations.types'
import assert from 'assert'
import { tfx } from 'utilities'

function handleRectangleChangeWithAnchor(item, anchor, current) {
  const previousPos0 = item.pos[0].get_xy0()
  const previousPos1 = item.pos[1].get_xy0()

  if (tfx(anchor.x) === tfx(item.pos[1].x)) {
    item.pos[1].x = anchor.x = current.x
    current.x = previousPos1.x
  }
  if (tfx(anchor.y) === tfx(item.pos[1].y)) {
    item.pos[1].y = anchor.y = current.y
    current.y = previousPos1.y
  }
  if (tfx(anchor.x) === tfx(item.pos[0].x)) {
    item.pos[0].x = anchor.x = current.x
    current.x = previousPos0.x
  }
  if (tfx(anchor.y) === tfx(item.pos[0].y)) {
    item.pos[0].y = anchor.y = current.y
    current.y = previousPos0.y
  }
}

export class AddSimpleObject extends BaseOperation {
  #simpleObjectId?: number
  #points: Array<Point>
  #mode: SimpleObjectMode

  constructor(
    points: Array<Vec2>,
    mode: SimpleObjectMode,
    simpleObjectId?: number
  ) {
    assert(points && points.length > 0)

    super('SIMPLE_OBJECT_ADD')

    this.#points = points
    this.#mode = mode
    this.#simpleObjectId = simpleObjectId
  }

  execute(struct: Struct): PerformOperationResult {
    const simpleObject = new SimpleObject({
      mode: this.#mode,
      pos: this.#points
    })

    let simpleObjectId: number

    if (typeof this.#simpleObjectId !== 'number') {
      simpleObjectId = struct.simpleObjects.add(simpleObject)
    } else {
      struct.simpleObjects.set(this.#simpleObjectId, simpleObject)
      simpleObjectId = this.#simpleObjectId
    }

    // TODO: move to renderer
    // restruct.simpleObjects.set(itemId, new ReSimpleObject(simpleObject))

    const inverseOperation = new DeleteSimpleObject(simpleObjectId)

    return {
      inverseOperation,
      entityId: simpleObjectId,
      operationType: this.type
    }
    // Base.invalidateItem(restruct, 'simpleObjects', simpleObjectId, 1)
  }
}

export class DeleteSimpleObject extends BaseOperation {
  #simpleObjectId: number

  constructor(simpleObjectId: number) {
    super('SIMPLE_OBJECT_DELETE')

    this.#simpleObjectId = simpleObjectId
  }

  execute(struct: Struct): PerformOperationResult {
    const simpleObject: SimpleObject = struct.simpleObjects.get(
      this.#simpleObjectId
    )!

    // TODO: move to renderer
    // restruct.markItemRemoved()
    // restruct.clearVisel(restruct.simpleObjects.get(this.data.id).visel)
    // restruct.simpleObjects.delete(this.data.id)

    struct.simpleObjects.delete(this.#simpleObjectId)

    const inverseOperation = new AddSimpleObject(
      simpleObject.pos,
      simpleObject.mode,
      this.#simpleObjectId
    )

    return {
      inverseOperation,
      entityId: this.#simpleObjectId,
      operationType: this.type
    }
  }
}

export class MoveSimpleObject extends BaseOperation {
  #simpleObjectId: number
  #delta: Vec2

  constructor(simpleObjectId: number, delta: Vec2) {
    super('SIMPLE_OBJECT_MOVE')

    this.#simpleObjectId = simpleObjectId
    this.#delta = delta
  }

  execute(struct: Struct): PerformOperationResult {
    const simpleObject = struct.simpleObjects.get(this.#simpleObjectId)!
    simpleObject.pos.forEach((p) => p.add_(this.#delta))

    // TODO: move to  renderer
    // restruct.simpleObjects
    //   .get(id)
    //   .visel.translate(Scale.obj2scaled(d, restruct.render.options))
    // this.data.d = d.negated()
    // if (!this.data.noinvalidate) {
    //   Base.invalidateItem(restruct, 'simpleObjects', id, 1)
    // }

    const inverseOperation = new MoveSimpleObject(
      this.#simpleObjectId,
      this.#delta.negated()
    )

    return {
      inverseOperation,
      entityId: this.#simpleObjectId,
      operationType: this.type
    }
  }
}

export class ResizeSimpleObject extends BaseOperation {
  #simpleObjectId: number
  #delta: Vec2
  #current: Vec2
  #anchor: Vec2

  constructor(
    simpleObjectId: number,
    delta: Vec2,
    current: Vec2,
    anchor: Vec2
  ) {
    super('SIMPLE_OBJECT_RESIZE')

    this.#simpleObjectId = simpleObjectId
    this.#delta = delta
    this.#current = current
    this.#anchor = anchor
  }

  // TODO: rework logic how to detect anchor
  execute(struct: Struct): PerformOperationResult {
    // TODO: transfrom to clear fucntion
    const simpleObject = struct.simpleObjects.get(this.#simpleObjectId)!

    switch (simpleObject.mode) {
      case SimpleObjectMode.ellipse: {
        handleRectangleChangeWithAnchor(
          simpleObject,
          this.#anchor,
          this.#current
        )
        break
      }
      case SimpleObjectMode.line: {
        const previousPos0 = simpleObject.pos[0].get_xy0()
        const previousPos1 = simpleObject.pos[1].get_xy0()

        if (
          tfx(this.#anchor.x) === tfx(simpleObject.pos[1].x) &&
          tfx(this.#anchor.y) === tfx(simpleObject.pos[1].y)
        ) {
          simpleObject.pos[1].x = this.#anchor.x = this.#current.x
          this.#current.x = previousPos1.x
          simpleObject.pos[1].y = this.#anchor.y = this.#current.y
          this.#current.y = previousPos1.y
        }

        if (
          tfx(this.#anchor.x) === tfx(simpleObject.pos[0].x) &&
          tfx(this.#anchor.y) === tfx(simpleObject.pos[0].y)
        ) {
          simpleObject.pos[0].x = this.#anchor.x = this.#current.x
          this.#current.x = previousPos0.x
          simpleObject.pos[0].y = this.#anchor.y = this.#current.y
          this.#current.y = previousPos0.y
        }
        break
      }
      case SimpleObjectMode.rectangle: {
        handleRectangleChangeWithAnchor(
          simpleObject,
          this.#anchor,
          this.#current
        )
        break
      }
      default: {
        throw new Error(`Unsupported simple object mode: ${simpleObject.mode}`)
      }
    }

    // TODO: move to renderer
    // restruct.simpleObjects
    //   .get(id)
    //   .visel.translate(Scale.obj2scaled(d, restruct.render.options))
    // this.data.d = d.negated()
    // if (!this.data.noinvalidate) {
    //   Base.invalidateItem(
    //     restruct,
    //     'simpleObjects',
    //     // @ts-ignore
    //     id,
    //     1
    //   )
    // }

    const inverseOperation = new ResizeSimpleObject(
      this.#simpleObjectId,
      this.#delta.negated(),
      this.#current,
      this.#anchor
    )

    return {
      inverseOperation,
      entityId: this.#simpleObjectId,
      operationType: this.type
    }
  }
}
