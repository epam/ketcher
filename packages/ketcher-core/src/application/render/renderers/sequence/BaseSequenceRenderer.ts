import { BaseRenderer } from 'application/render/renderers/internal';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';

export class BaseSequenceRenderer extends BaseRenderer {
  protected appendHover(
    _hoverArea,
  ): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}

  drawSelection(): void {}

  moveSelection(): void {}

  protected removeHover(): void {}

  show(_theme?): void {}

  get center() {
    return new Vec2(0, 0, 0);
  }
}
