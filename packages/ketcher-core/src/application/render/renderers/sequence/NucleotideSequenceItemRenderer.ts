import { Nucleotide } from 'domain/entities';
import { D3SvgElementSelection } from 'application/render/types';

import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

export class NucleotideSequenceItemRenderer extends RNASequenceItemRenderer {
  private phosphateModificationCircleElement?: D3SvgElementSelection<
    SVGCircleElement,
    void
  >;

  drawModification() {
    const node = this.node as Nucleotide;

    this.drawCommonModification(node);

    if (this.phosphateModificationCircleElement) {
      this.phosphateModificationCircleElement.remove();
    }

    if (node.phosphate?.isModification) {
      this.phosphateModificationCircleElement = this.rootElement
        ?.append('circle')
        .attr('r', '3px')
        .attr(
          'fill',
          this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858',
        )
        .attr('cx', '12')
        .attr('cy', '-17');
    }
  }

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr(
      'data-symbol-type',
      this.node.sugar.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA
        ? 'DNA'
        : 'RNA',
    );
    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
