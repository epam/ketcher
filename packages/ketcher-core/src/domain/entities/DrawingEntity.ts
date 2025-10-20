import { Vec2 } from 'domain/entities/vec2';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import assert from 'assert';
import { Coordinates } from 'application/editor/shared/coordinates';
let id = 0;

export interface DrawingEntityConfig {
  generateId: boolean;
}
export abstract class DrawingEntity {
  public selected = false;
  public hovered = false;
  public id = 0;
  public baseRenderer?: BaseRenderer;

  protected constructor(
    private _position: Vec2 = new Vec2(0, 0),
    private readonly config: DrawingEntityConfig = {
      generateId: true,
    },
  ) {
    this._position = _position || new Vec2(0, 0);
    if (this.config?.generateId === true) {
      this.id = id;
      id++;
    }
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
    isPreviousSelected = false,
    shiftKey = false,
  ) {
    assert(this.baseRenderer);
    const prevSelectedValue = this.selected;
    const selectionPoints = this.baseRenderer.selectionPoints || [
      Coordinates.modelToCanvas(this.center),
    ];
    let isSelected = false;

    selectionPoints.forEach((point) => {
      const locatedInRectangle =
        rectangleBottomRightPoint.x > point.x &&
        rectangleBottomRightPoint.y > point.y &&
        rectangleTopLeftPoint.x < point.x &&
        rectangleTopLeftPoint.y < point.y;
      if (shiftKey) {
        isSelected = isPreviousSelected || locatedInRectangle;
      } else {
        isSelected = locatedInRectangle;
      }
    });

    if (isSelected) {
      this.turnOnSelection();
    } else {
      this.turnOffSelection();
    }

    return prevSelectedValue !== this.selected;
  }

  public selectIfLocatedInPolygon(
    polygonPoints: Vec2[],
    isPreviousSelected = false,
    shiftKey = false,
  ) {
    assert(this.baseRenderer);
    const prevSelectedValue = this.selected;
    const selectionPoints = this.baseRenderer.selectionPoints || [
      Coordinates.modelToCanvas(this.center),
    ];
    let isSelected = false;

    selectionPoints.forEach((point) => {
      const locatedInPolygon = this.isPointInPolygon(polygonPoints, point);
      if (shiftKey) {
        isSelected = isPreviousSelected || locatedInPolygon;
      } else {
        isSelected = locatedInPolygon;
      }
    });

    if (isSelected) {
      this.turnOnSelection();
    } else {
      this.turnOffSelection();
    }

    return prevSelectedValue !== this.selected;
  }

  private isPointInPolygon(r: Vec2[], p: Vec2) {
    // eslint-disable-line max-statements
    const d = new Vec2(0, 1);
    const n = d.rotate(Math.PI / 2);
    let v0 = Vec2.diff(r[r.length - 1], p);
    let n0 = Vec2.dot(n, v0);
    let d0 = Vec2.dot(d, v0);
    let w0 = new Vec2(0, 0);
    let counter = 0;
    const eps = 1e-5;
    let flag1 = false;
    let flag0 = false;

    for (let i = 0; i < r.length; ++i) {
      const v1 = Vec2.diff(r[i], p);
      const w1 = Vec2.diff(v1, v0);
      const n1 = Vec2.dot(n, v1);
      const d1 = Vec2.dot(d, v1);
      flag1 = false;
      if (n1 * n0 < 0) {
        if (d1 * d0 > -eps) {
          if (d0 > -eps) flag1 = true;
          /* eslint-disable no-mixed-operators */
        } else if (
          (Math.abs(n0) * Math.abs(d1) - Math.abs(n1) * Math.abs(d0)) * d1 >
          0
        ) {
          /* eslint-enable no-mixed-operators */
          flag1 = true;
        }
      }
      if (flag1 && flag0 && Vec2.dot(w1, n) * Vec2.dot(w0, n) >= 0) {
        flag1 = false;
      }
      if (flag1) {
        counter++;
      }
      v0 = v1;
      n0 = n1;
      d0 = d1;
      w0 = w1;
      flag0 = flag1;
    }
    return counter % 2 !== 0;
  }

  public setBaseRenderer(renderer: BaseRenderer) {
    this.baseRenderer = renderer;
  }
}
