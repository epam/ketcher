import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { D3SvgElementSelection } from 'application/render/types';

export class EmptySequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '';
  }

  protected drawModification() {}

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr('data-symbol-type', 'Empty');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
