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
import Base from './base'
import { OperationType } from './OperationType'
import { ReSimpleObject } from '../../render/restruct'
import { SimpleObject, SimpleObjectMode, Vec2, scale } from 'ketcher-core'
import util from '../../render/util'

const tfx = util.tfx

interface SimpleObjectAddData {
  id?: string
  pos: Array<Vec2>
  mode: SimpleObjectMode
  toCircle: boolean
}
export class SimpleObjectAdd extends Base {
  data: SimpleObjectAddData
  performed: boolean

  constructor(
    pos: Array<Vec2> = [],
    mode: SimpleObjectMode = SimpleObjectMode.line,
    toCircle: boolean = false
  ) {
    super(OperationType.SIMPLE_OBJECT_ADD)
    this.data = { pos, mode, toCircle }
    this.performed = false
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    if (!this.performed) {
      this.data.id = struct.simpleObjects.add(
        new SimpleObject({ mode: this.data.mode })
      )
      this.performed = true
    } else {
      struct.simpleObjects.set(
        this.data.id,
        new SimpleObject({ mode: this.data.mode })
      )
    }

    restruct.simpleObjects.set(
      this.data.id,
      new ReSimpleObject(struct.simpleObjects.get(this.data.id))
    )

    const positions = [...this.data.pos]
    if (this.data.toCircle) {
      positions[1] = makeCircleFromEllipse(positions[0], positions[1])
    }
    struct.simpleObjectSetPos(
      this.data.id,
      positions.map(p => new Vec2(p))
    )

    Base.invalidateItem(
      restruct,
      'simpleObjects',
      // @ts-ignore
      this.data.id,
      1
    )
  }
  invert(): Base {
    //@ts-ignore
    return new SimpleObjectDelete(this.data.id)
  }
}

interface SimpleObjectDeleteData {
  id: string
  pos?: Array<Vec2>
  mode?: SimpleObjectMode
  toCircle?: boolean
}

export class SimpleObjectDelete extends Base {
  data: SimpleObjectDeleteData
  performed: boolean

  constructor(id: string) {
    super(OperationType.SIMPLE_OBJECT_DELETE)
    this.data = { id, pos: [], mode: SimpleObjectMode.line, toCircle: false }
    this.performed = false
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    if (!this.performed) {
      const item = struct.simpleObjects.get(this.data.id) as any
      //save to data current values. In future they could be used in invert for restoring simple object
      this.data.pos = item.pos
      this.data.mode = item.mode
      this.data.toCircle = item.toCircle
      this.performed = true
    }

    restruct.markItemRemoved()
    restruct.clearVisel(restruct.simpleObjects.get(this.data.id).visel)
    restruct.simpleObjects.delete(this.data.id)

    struct.simpleObjects.delete(this.data.id)
  }

  invert(): Base {
    return new SimpleObjectAdd(
      this.data.pos,
      this.data.mode,
      this.data.toCircle
    )
  }
}

interface SimpleObjectMoveData {
  id: string
  d: any
  noinvalidate: boolean
}

export class SimpleObjectMove extends Base {
  data: SimpleObjectMoveData

  constructor(id: string, d: any, noinvalidate: boolean) {
    super(OperationType.SIMPLE_OBJECT_MOVE)
    this.data = { id, d, noinvalidate }
  }
  execute(restruct: any): void {
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    const item = struct.simpleObjects.get(id)
    item.pos.forEach(p => p.add_(d))
    restruct.simpleObjects
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate) {
      Base.invalidateItem(
        restruct,
        'simpleObjects',
        // @ts-ignore
        id,
        1
      )
    }
  }

  invert(): Base {
    const move = new SimpleObjectMove(
      this.data.id,
      this.data.d,
      this.data.noinvalidate
    )
    //todo Need further investigation on why this is needed?
    move.data = this.data
    return move
  }
}

interface SimpleObjectResizeData {
  id: string
  d: any
  current: Vec2
  anchor: Vec2
  noinvalidate: boolean
  toCircle: boolean
}

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

export class SimpleObjectResize extends Base {
  data: SimpleObjectResizeData

  constructor(
    id: string,
    d: any,
    current: Vec2,
    anchor: any,
    noinvalidate: boolean,
    toCircle: boolean
  ) {
    super(OperationType.SIMPLE_OBJECT_RESIZE)
    this.data = { id, d, current, anchor, noinvalidate, toCircle }
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    const current = this.data.current
    const item = struct.simpleObjects.get(id)
    const anchor = this.data.anchor
    if (item.mode === SimpleObjectMode.ellipse) {
      if (anchor) {
        handleRectangleChangeWithAnchor(item, anchor, current)
      } else if (this.data.toCircle) {
        const previousPos1 = item.pos[1].get_xy0()
        const circlePoint = makeCircleFromEllipse(item.pos[0], current)
        item.pos[1].x = circlePoint.x
        item.pos[1].y = circlePoint.y
        this.data.current = previousPos1
      } else {
        const previousPos1 = item.pos[1].get_xy0()
        item.pos[1].x = current.x
        item.pos[1].y = current.y
        this.data.current = previousPos1
      }
    } else if (item.mode === SimpleObjectMode.line && anchor) {
      const previousPos1 = anchor.get_xy0()
      anchor.x = current.x
      anchor.y = current.y
      this.data.current = previousPos1
    } else if (item.mode === SimpleObjectMode.rectangle && anchor) {
      handleRectangleChangeWithAnchor(item, anchor, current)
    } else item.pos[1].add_(d)

    restruct.simpleObjects
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate) {
      Base.invalidateItem(
        restruct,
        'simpleObjects',
        // @ts-ignore
        id,
        1
      )
    }
  }
  invert(): Base {
    return new SimpleObjectResize(
      this.data.id,
      this.data.d,
      this.data.current,
      this.data.anchor,
      this.data.noinvalidate,
      this.data.toCircle
    )
  }
}

export function makeCircleFromEllipse(position0: Vec2, position1: Vec2): Vec2 {
  const diff = Vec2.diff(position1, position0)
  const min = Math.abs(diff.x) < Math.abs(diff.y) ? diff.x : diff.y
  return new Vec2(
    position0.x + (diff.x > 0 ? 1 : -1) * Math.abs(min),
    position0.y + (diff.y > 0 ? 1 : -1) * Math.abs(min),
    0
  )
}
