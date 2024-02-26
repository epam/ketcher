import { Vec2 } from 'domain/entities/vec2';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Coordinates } from 'application/editor/shared/coordinates';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
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
    const prevSelectedValue = this.selected;
    let center = Coordinates.modelToCanvas(this.center);
    if (
      this.baseRenderer &&
      this.baseRenderer instanceof BaseSequenceItemRenderer
    ) {
      center = this.baseRenderer.scaledMonomerPosition;
    }
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

  public selectIfLocatedInSequenceEditingArea(
    rectangleTopLeftPoint: Vec2,
    rectangleBottomRightPoint: Vec2,
  ) {
    const prevSelectedValue = this.selected;
    if (
      this.baseRenderer &&
      this.baseRenderer instanceof BaseSequenceItemRenderer
    ) {
      const center = this.baseRenderer.scaledMonomerPosition;
      const halfVerticalDistance =
        this.baseRenderer.rowIndex > 0 ? 47 / 2 : this.baseRenderer.height / 2;
      const atSameLineWithBottomRightPoint =
        rectangleBottomRightPoint.y > center.y - halfVerticalDistance &&
        rectangleBottomRightPoint.y < center.y + halfVerticalDistance;
      if (
        atSameLineWithBottomRightPoint &&
        rectangleBottomRightPoint.x > center.x &&
        rectangleTopLeftPoint.x < center.x
      ) {
        this.turnOnSelection();
      } else if (
        rectangleBottomRightPoint.y > center.y - halfVerticalDistance &&
        rectangleTopLeftPoint.y < center.y + halfVerticalDistance
      ) {
        this.turnOnSelection();
      } else {
        this.turnOffSelection();
      }
    }
    return prevSelectedValue !== this.selected;
  }

  public addCursorLine(cursorPoint: Vec2) {
    let center;
    if (
      this.baseRenderer &&
      this.baseRenderer instanceof BaseSequenceItemRenderer
    ) {
      center = this.baseRenderer.scaledMonomerPosition;
      const halfVerticalDistance =
        this.baseRenderer.rowIndex > 0 ? 47 / 2 : this.baseRenderer.height / 2;
      const atSameLine =
        cursorPoint.y > center.y - halfVerticalDistance &&
        cursorPoint.y < center.y + halfVerticalDistance;
      const isClickedOnLetter =
        cursorPoint.x > center.x - 9 &&
        cursorPoint.x < center.x + 9 &&
        atSameLine;
      if (isClickedOnLetter) {
        this.baseRenderer.appendCursorLine();
      }
    }
  }

  public removeCursorLine() {
    if (
      this.baseRenderer &&
      this.baseRenderer instanceof BaseSequenceItemRenderer
    ) {
      this.baseRenderer?.removeCursorLine();
    }
  }

  public setBaseRenderer(renderer: BaseRenderer) {
    this.baseRenderer = renderer;
  }

  public get isPartOfRna() {
    return false;
  }
}
