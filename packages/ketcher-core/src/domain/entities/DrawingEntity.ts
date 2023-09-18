import { Vec2 } from 'domain/entities/vec2';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import assert from 'assert';
let id = 1;

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

  public selectIfLocatedInRectangle(
    rectangleTopLeftPoint: Vec2,
    rectangleBottomRightPoint: Vec2,
  ) {
    assert(this.baseRenderer);
    const prevSelectedValue = this.selected;
    const centerX = this.baseRenderer.bodyX + this.baseRenderer.bodyWidth / 2;
    const centerY = this.baseRenderer.bodyY + this.baseRenderer.bodyHeight / 2;
    if (
      rectangleBottomRightPoint.x > centerX &&
      rectangleBottomRightPoint.y > centerY &&
      rectangleTopLeftPoint.x < centerX &&
      rectangleTopLeftPoint.y < centerY
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
