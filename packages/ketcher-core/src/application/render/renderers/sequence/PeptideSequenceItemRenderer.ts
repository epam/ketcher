import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { SequenceNodeOptions } from './types';

export class PeptideSequenceItemRenderer extends BaseSequenceItemRenderer {
  readonly #NO_ANALOGUE_SYMBOL = '@';
  readonly TEXT_COLOR = '#333333';

  private lineElement?: D3SvgElementSelection<SVGPathElement, void>;

  constructor(options: SequenceNodeOptions) {
    super(options);
    this.lineElement = this.rootElement
      ?.append('path')
      .attr('d', 'M 0,3 L 12,3')
      .attr('stroke', this.TEXT_COLOR)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', '1.7px')
      .style('display', 'none');
  }

  get symbolToDisplay(): string {
    return (
      this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode ||
      this.#NO_ANALOGUE_SYMBOL
    );
  }

  get dataSymbolType(): string {
    return 'Peptide';
  }

  private drawLine() {
    this.lineElement?.style('display', 'block');
  }

  protected drawModification() {
    const isAsparticAcidWithDifferentR3 =
      this.node.monomer.monomerItem.label === 'D*';
    if (
      isAsparticAcidWithDifferentR3 ||
      this.symbolToDisplay === this.#NO_ANALOGUE_SYMBOL
    ) {
      this.lineElement?.style('display', 'none');
      return;
    }
    this.drawLine();
  }

  public reset(): void {
    super.reset();
    this.lineElement?.style('display', 'none');
  }
}
