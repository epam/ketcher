import { Nucleoside, Phosphate } from 'domain/entities';
import { getNextMonomerInChain } from 'domain/helpers/monomers';
import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';
import { D3SvgElementSelection } from 'application/render/types';

export class NucleosideSequenceItemRenderer extends RNASequenceItemRenderer {
  private nucleosideCircleElement?: D3SvgElementSelection<
    SVGCircleElement,
    void
  >;

  protected drawModification() {
    const node = this.node as Nucleoside;
    const nextNode = getNextMonomerInChain(node.sugar);

    this.drawCommonModification(node);

    if (this.nucleosideCircleElement) {
      this.nucleosideCircleElement.remove();
    }

    // show modification for not last Nucleoside
    if (nextNode && !(nextNode instanceof Phosphate)) {
      this.nucleosideCircleElement = this.rootElement
        ?.append('circle')
        .attr('r', '3px')
        .attr(
          'stroke',
          this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858',
        )
        .attr('stroke-width', '1px')
        .attr('fill', 'none')
        .attr('cx', '10')
        .attr('cy', '-16');
    }
  }
}
