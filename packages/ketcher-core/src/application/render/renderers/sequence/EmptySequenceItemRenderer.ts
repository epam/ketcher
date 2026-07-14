import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { sequenceRendererStore } from 'application/render/renderers/sequence/SequenceRendererStore';
import type { D3SvgElementSelection } from 'application/render/types';

export class EmptySequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    // An empty antisense cell can carry one phosphate of an adjacent terminal
    // phosphate run so that a paired terminal phosphate is shown as "p p"
    // (one phosphate per column). Display-only: no cell is added or removed.
    if (this.twoStrandedNode?.antisenseNode === this.node) {
      const phosphateSymbol =
        sequenceRendererStore.sequenceViewModel?.getAntisensePhosphateSymbol(
          this.twoStrandedNode,
        );
      if (phosphateSymbol) {
        return phosphateSymbol;
      }
    }

    return '';
  }

  protected drawModification() {
    // intentional no-op: this monomer type does not have a modification glyph
  }

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr('data-symbol-type', 'Empty');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
