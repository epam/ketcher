import { BaseRenderer } from 'application/render';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { RxnPlusRenderer } from 'application/render/renderers/RxnPlusRenderer';
import { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';

export class RxnPlus extends DrawingEntity {
  public renderer?: RxnPlusRenderer = undefined;

  constructor(
    position: Vec2,
    public initiallySelected?: initiallySelectedType,
  ) {
    super(position);
  }

  public get center(): Vec2 {
    return this.position;
  }

  public setRenderer(renderer: RxnPlusRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }
}
