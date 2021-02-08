import Vec2 from '../../util/vec2'

class SimpleObject {
  pos: Array<Vec2>
  mode: SimpleObjectMode

  constructor(params: { mode: SimpleObjectMode, pos?: Array<Vec2> }) {
    params = params || {}
    this.pos = []

    if (params.pos)
      for (let i = 0; i < params.pos.length; i++)
        this.pos[i] = params.pos[i] ? new Vec2(params.pos[i]) : new Vec2()

    this.mode = params.mode
  }

  clone(): SimpleObject {
    return new SimpleObject(this)
  }

  center(): Vec2 {
    switch (this.mode) {
      case SimpleObjectMode.rectangle: {
        return Vec2.centre(this.pos[0], this.pos[1])
      }
      default:
        return this.pos[0]
    }
  }
}

enum SimpleObjectMode {
  ellipse = 'ellipse',
  rectangle = 'rectangle',
  line = 'line'
}
export { SimpleObject, SimpleObjectMode }
