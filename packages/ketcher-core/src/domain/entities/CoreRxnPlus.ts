import type { BaseRenderer } from 'application/render';
import { DrawingEntity } from './DrawingEntity';
import type { Vec2 } from './vec2';
import type { RxnPlusRenderer } from 'application/render/renderers/RxnPlusRenderer';
import type { initiallySelectedType } from './BaseMicromoleculeEntity';

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
