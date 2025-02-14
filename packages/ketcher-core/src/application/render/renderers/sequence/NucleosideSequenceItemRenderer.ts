import { Nucleoside, Phosphate } from 'domain/entities';
import { getNextMonomerInChain } from 'domain/helpers/monomers';
import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

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
