import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { D3SvgElementSelection } from 'application/render/types';

export class PhosphateSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return 'p';
  }

  protected drawModification() {}

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr('data-symbol-type', 'Phosphate');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
