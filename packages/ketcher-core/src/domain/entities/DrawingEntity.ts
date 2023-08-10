import { Vec2 } from 'domain/entities/vec2';

export abstract class DrawingEntity {
  protected constructor(private _position: Vec2 = new Vec2(0, 0)) {
    this._position = _position || new Vec2(0, 0);
  }

  moveRelative(position: Vec2) {
    this._position.x += position.x;
    this._position.y += position.y;
  }

  public moveAbsolute(position: Vec2) {
    this._position = position;
  }

  get position() {
    return this._position;
  }
}
