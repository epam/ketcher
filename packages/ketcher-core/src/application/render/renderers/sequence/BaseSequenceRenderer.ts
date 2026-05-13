import { BaseRenderer } from 'application/render/renderers/internal';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities/vec2';

export class BaseSequenceRenderer extends BaseRenderer {
  protected appendHover(
    _hoverArea,
  ): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {
    // intentional no-op: this renderer type does not require a hover area element
  }

  drawSelection(): void {
    // intentional no-op: this renderer type does not render a selection view
  }

  moveSelection(): void {
    // intentional no-op: this renderer type does not support selection movement
  }

  protected removeHover(): void {
    // intentional no-op: this renderer type does not implement hover removal
  }

  show(_theme?): void {
    // intentional no-op: this renderer type does not implement show
  }

  get center() {
    return new Vec2(0, 0, 0);
  }

  override get selectionPoints() {
    return [this.center];
  }
}
