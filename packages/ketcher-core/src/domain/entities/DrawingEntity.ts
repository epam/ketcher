import { Vec2 } from 'domain/entities/vec2';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import assert from 'assert';
import Coordinates from 'application/editor/shared/coordinates';
let id = 0;

export abstract class DrawingEntity {
  public selected = false;
  public hovered = false;
  public id = 0;
  public baseRenderer?: BaseRenderer;

  protected constructor(private _position: Vec2 = new Vec2(0, 0)) {
    this._position = _position || new Vec2(0, 0);
    this.id = id;
    id++;
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

  public turnOnHover() {
    this.hovered = true;
  }

  public turnOffHover() {
    this.hovered = false;
  }

  public turnOnSelection() {
    this.selected = true;
  }

  public turnOffSelection() {
    this.selected = false;
  }

  public abstract get center(): Vec2;

  public selectIfLocatedInRectangle(
    rectangleTopLeftPoint: Vec2,
    rectangleBottomRightPoint: Vec2,
  ) {
    assert(this.baseRenderer);
    const prevSelectedValue = this.selected;
    const center = Coordinates.modelToCanvas(this.center);
    if (
      rectangleBottomRightPoint.x > center.x &&
      rectangleBottomRightPoint.y > center.y &&
      rectangleTopLeftPoint.x < center.x &&
      rectangleTopLeftPoint.y < center.y
    ) {
      this.turnOnSelection();
    } else {
      this.turnOffSelection();
    }

    return prevSelectedValue !== this.selected;
  }

  public setBaseRenderer(renderer: BaseRenderer) {
    this.baseRenderer = renderer;
  }
}
