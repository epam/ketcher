import { BaseRenderer } from 'application/render';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';
import { RxnArrowRenderer } from 'application/render/renderers/RxnArrowRenderer';

export class RxnArrow extends DrawingEntity {
  public renderer?: RxnArrowRenderer = undefined;

  constructor(
    public mode: RxnArrowMode,
    private startEndPosition: [Vec2, Vec2],
  ) {
    super();
  }

  public get startPosition() {
    return this.startEndPosition[0];
  }

  public get endPosition() {
    return this.startEndPosition[1];
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
}
