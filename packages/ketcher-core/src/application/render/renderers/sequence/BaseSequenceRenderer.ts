import { BaseRenderer } from 'application/render';
import { D3SvgElementSelection } from 'application/render/types';

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
}
