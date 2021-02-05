import Vec2 from '../../util/vec2'
import Base, { invalidateItem, OperationType } from './base'
import { ReSimpleObject } from '../../render/restruct'
import { SimpleObject, SimpleObjectMode } from 'src/script/chem/struct'
import scale from '../../util/scale'
import util from '../../render/util'

const tfx = util.tfx

class SimpleObjectAdd extends Base {
  data: {
    id: string | null | undefined
    pos: Array<Vec2>
    mode: SimpleObjectMode | undefined
    toCircle: boolean
  }
  performed: boolean

  constructor(
    pos: Array<Vec2> = [],
    mode: SimpleObjectMode | undefined = undefined,
    toCircle: boolean = false
  ) {
    super(OperationType.SIMPLE_OBJECT_ADD)
    this.data = { id: null, pos, mode, toCircle }
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

    invalidateItem(restruct, 'simpleObjects', this.data.id, 1)
  }

  invert(): any {
    const ret = new SimpleObjectDelete()
    ret.data = this.data as any
    return ret
  }
}

function makeCircleFromEllipse(position0: Vec2, position1: Vec2): Vec2 {
  const diff = Vec2.diff(position1, position0)
  const min = Math.abs(diff.x) < Math.abs(diff.y) ? diff.x : diff.y
  return new Vec2(
    position0.x + (diff.x > 0 ? 1 : -1) * Math.abs(min),
    position0.y + (diff.y > 0 ? 1 : -1) * Math.abs(min),
    0
  )
}

class SimpleObjectDelete extends Base {
  data: {
    id: string | null | undefined
    pos: Array<Vec2>
    mode: SimpleObjectMode | undefined
    toCircle: boolean
  }
  performed: boolean

  constructor(id?: string | null) {
    super(OperationType.SIMPLE_OBJECT_DELETE)
    this.data = { id: id, pos: [], mode: undefined, toCircle: false }
    this.performed = false
  }

  execute(restruct: any): void {
    const struct = restruct.molecule
    if (!this.performed) {
      const item = struct.simpleObjects.get(this.data.id)
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
    const ret = new SimpleObjectAdd()
    ret.data = this.data as any
    return ret
  }
}

class SimpleObjectMove extends Base {
  data: {
    id: string
    d: any
    noinvalidate: boolean
  }
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
    if (!this.data.noinvalidate)
      invalidateItem(restruct, 'simpleObjects', id, 1)
  }

  invert(): Base {
    return new SimpleObjectMove(
      this.data.id,
      this.data.d,
      this.data.noinvalidate
    )
  }
}

class SimpleObjectResize extends Base {
  data: {
    id: string
    d: any
    current: Vec2
    anchor: any
    noinvalidate: boolean
    toCircle: boolean
  }

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
        const previousPos0 = item.pos[0].get_xy0()
        const previousPos1 = item.pos[1].get_xy0()

        if (tfx(anchor.x) === tfx(item.pos[1].x)) {
          item.pos[1].x = anchor.x = current.x
          this.data.current.x = previousPos1.x
        }
        if (tfx(anchor.y) === tfx(item.pos[1].y)) {
          item.pos[1].y = anchor.y = current.y
          this.data.current.y = previousPos1.y
        }
        if (tfx(anchor.x) === tfx(item.pos[0].x)) {
          item.pos[0].x = anchor.x = current.x
          this.data.current.x = previousPos0.x
        }
        if (tfx(anchor.y) === tfx(item.pos[0].y)) {
          item.pos[0].y = anchor.y = current.y
          this.data.current.y = previousPos0.y
        }
        if (
          tfx(anchor.y) !== tfx(item.pos[0].y) &&
          tfx(anchor.x) !== tfx(item.pos[0].x) &&
          tfx(anchor.y) !== tfx(item.pos[1].y) &&
          tfx(anchor.x) !== tfx(item.pos[1].x)
        ) {
          const rad = Vec2.diff(item.pos[1], item.pos[0])
          const rx = Math.abs(rad.x / 2)
          const ry = Math.abs(rad.y / 2)
          const topLeftX =
            item.pos[0].x <= item.pos[1].x ? item.pos[0] : item.pos[1]
          const topLeftY =
            item.pos[0].y <= item.pos[1].y ? item.pos[0] : item.pos[1]
          const bottomRightX =
            item.pos[0].x <= item.pos[1].x ? item.pos[1] : item.pos[0]
          const bottomRightY =
            item.pos[0].y <= item.pos[1].y ? item.pos[1] : item.pos[0]
          if (anchor.x <= topLeftX.x + rx) {
              topLeftX.x = current.x
          } else {
              bottomRightX.x = current.x
          }
          if (anchor.y <= topLeftY.y + ry) {
              topLeftY.y = current.y
          } else {
              bottomRightY.y = current.y
          }
        }
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
      const previousPos0 = item.pos[0].get_xy0()
      const previousPos1 = item.pos[1].get_xy0()

      if (tfx(anchor.x) === tfx(item.pos[1].x)) {
        item.pos[1].x = anchor.x = current.x
        this.data.current.x = previousPos1.x
      }
      if (tfx(anchor.y) === tfx(item.pos[1].y)) {
        item.pos[1].y = anchor.y = current.y
        this.data.current.y = previousPos1.y
      }
      if (tfx(anchor.x) === tfx(item.pos[0].x)) {
        item.pos[0].x = anchor.x = current.x
        this.data.current.x = previousPos0.x
      }
      if (tfx(anchor.y) === tfx(item.pos[0].y)) {
        item.pos[0].y = anchor.y = current.y
        this.data.current.y = previousPos0.y
      }
    } else item.pos[1].add_(d)

    restruct.simpleObjects
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate)
      invalidateItem(restruct, 'simpleObjects', id, 1)
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

export {
  SimpleObjectAdd,
  SimpleObjectDelete,
  SimpleObjectMove,
  SimpleObjectResize
}
