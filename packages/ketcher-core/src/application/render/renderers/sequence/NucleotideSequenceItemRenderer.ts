import { Nucleotide } from 'domain/entities';
import { D3SvgElementSelection } from 'application/render/types';

import { RNASequenceItemRenderer } from './RNASequenceItemRenderer';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { SequenceNodeOptions } from './types';

export class NucleotideSequenceItemRenderer extends RNASequenceItemRenderer {
  private phosphateModificationCircleElement?: D3SvgElementSelection<
    SVGCircleElement,
    void
  >;

  constructor(options: SequenceNodeOptions) {
    super(options);
    this.node = options.node as Nucleotide;
    this.phosphateModificationCircleElement = this.rootElement
      ?.append('circle')
      .attr('r', '3px')
      .attr('stroke-width', '1px')
      .attr('fill', 'none')
      .attr('transform', 'translate(12, -17)');

    this.drawModification();
  }

  get dataSymbolType(): string {
    const node = this.node as Nucleotide;
    return node.sugar.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA
      ? 'DNA'
      : 'RNA';
  }

  drawModification() {
    const node = this.node as Nucleotide;

    this.drawCommonModification(node);

    if (node.phosphate?.isModification) {
      this.phosphateModificationCircleElement?.style('display', null);
      if (this.isSequenceEditInRnaBuilderModeTurnedOn) {
        this.phosphateModificationCircleElement?.attr('fill', '#24545A');
      } else {
        this.phosphateModificationCircleElement?.attr('fill', '#585858');
      }
    } else {
      this.phosphateModificationCircleElement?.style('display', 'none');
    }
  }

  public reset(): void {
    super.reset();
    this.phosphateModificationCircleElement?.style('display', 'none');
  }

  public show(options: SequenceNodeOptions): void {
    super.show(options);
    this.rootElement?.attr('data-symbol-type', this.dataSymbolType);
  }
}
