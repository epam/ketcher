import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { sequenceRendererStore } from 'application/render/renderers/sequence/SequenceRendererStore';
import type { D3SvgElementSelection } from 'application/render/types';

export class BackBoneSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    // A "gap" cell of an antisense strand can carry one of the phosphates of an
    // adjacent terminal phosphate run, so that a paired terminal phosphate is
    // shown as "p p" (one phosphate per column) instead of "pp" in a single
    // cell. This only changes the displayed symbol of an already existing cell.
    if (this.twoStrandedNode?.antisenseNode === this.node) {
      const phosphateSymbol =
        sequenceRendererStore.sequenceViewModel?.getAntisensePhosphateSymbol(
          this.twoStrandedNode,
        );
      if (phosphateSymbol) {
        return phosphateSymbol;
      }
    }

    return '-';
  }

  protected drawModification() {
    // intentional no-op: this monomer type does not have a modification glyph
  }

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr('data-symbol-type', 'Line');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
