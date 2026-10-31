import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import type { D3SvgElementSelection } from 'application/render/types';

export class PhosphateSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return 'p';
  }

  protected drawModification() {
    // intentional no-op: this monomer type does not have a modification glyph
  }

  protected appendRootElement(
    parentElement?: D3SvgElementSelection<SVGGElement, void>,
  ) {
    this.rootElement = super.appendRootElement(parentElement);
    this.rootElement?.attr('data-symbol-type', 'Phosphate');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
