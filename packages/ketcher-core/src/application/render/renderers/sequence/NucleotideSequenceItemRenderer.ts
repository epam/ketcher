import { Nucleotide } from 'domain/entities';
import { D3SvgElementSelection } from 'application/render/types';

import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';

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
        .attr('cx', '10')
        .attr('cy', '-16');
    }
  }
}
