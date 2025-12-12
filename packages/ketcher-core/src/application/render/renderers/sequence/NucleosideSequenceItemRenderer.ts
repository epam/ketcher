import { Nucleoside, Phosphate } from 'domain/entities';
import { getNextMonomerInChain } from 'domain/helpers/monomers';
import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { SequenceNodeOptions } from './types';

export class NucleosideSequenceItemRenderer extends RNASequenceItemRenderer {
  private nucleosideCircleElement?: D3SvgElementSelection<
    SVGCircleElement,
    void
  >;

  constructor(options: SequenceNodeOptions) {
    super(options);
    this.node = options.node as Nucleoside;
    this.nucleosideCircleElement = this.rootElement
      ?.append('circle')
      .attr('r', '3px')
      .attr('stroke-width', '1px')
      .attr(
        'stroke',
        this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858',
      )
      .attr('fill', 'none')
      .attr('transform', 'translate(12, -17)');
    this.drawModification();
  }

  get dataSymbolType(): string {
    const node = this.node as Nucleoside;
    return node.sugar.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA
      ? 'DNA'
      : 'RNA';
  }

  protected drawModification() {
    const node = this.node as Nucleoside;
    const nextNode = getNextMonomerInChain(node.sugar);

    this.drawCommonModification(node);

    if (nextNode && !(nextNode instanceof Phosphate)) {
      this.nucleosideCircleElement?.style('display', null);
      if (this.isSequenceEditInRnaBuilderModeTurnedOn) {
        this.nucleosideCircleElement?.attr('stroke', '#24545A');
      } else {
        this.nucleosideCircleElement?.attr('stroke', '#585858');
      }
    } else {
      this.nucleosideCircleElement?.style('display', 'none');
    }
  }

  public reset(): void {
    super.reset();
    this.nucleosideCircleElement?.style('display', 'none');
  }

  public show(options: SequenceNodeOptions): void {
    super.show(options);
    this.rootElement?.attr('data-symbol-type', this.dataSymbolType);
  }
}
