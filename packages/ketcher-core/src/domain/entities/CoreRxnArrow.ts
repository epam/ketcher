import { BaseRenderer } from 'application/render';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';
import { RxnArrowRenderer } from 'application/render/renderers/RxnArrowRenderer';
import { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';

export class RxnArrow extends DrawingEntity {
  public renderer?: RxnArrowRenderer = undefined;

  constructor(
    public type: RxnArrowMode,
    public startEndPosition: [Vec2, Vec2],
    public height?: number,
    public initiallySelected?: initiallySelectedType,
  ) {
    super();
  }

  public get startPosition() {
    return this.startEndPosition[0];
  }

  private set startPosition(newStartPosition: Vec2) {
    this.startEndPosition[0] = newStartPosition;
  }

  public get endPosition() {
    return this.startEndPosition[1];
  }

  private set endPosition(newEndPosition: Vec2) {
    this.startEndPosition[1] = newEndPosition;
  }

  public get center(): Vec2 {
    return new Vec2(
      (this.startPosition.x + this.endPosition.x) / 2,
      (this.startPosition.y + this.endPosition.y) / 2,
    );
  }

  public setRenderer(renderer: RxnArrowRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public override moveRelative(delta: Vec2): void {
    this.startPosition = this.startPosition.add(delta);
    this.endPosition = this.endPosition.add(delta);
  }

  public override moveAbsolute(position: Vec2) {
    const delta = Vec2.diff(position, this.startPosition);

    this.moveRelative(delta);
  }
}
