import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { D3SvgElementSelection } from 'application/render/types';

export class PeptideSequenceItemRenderer extends BaseSequenceItemRenderer {
  readonly #NO_ANALOGUE_SYMBOL = '@';

  get symbolToDisplay(): string {
    return (
      this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode ||
      this.#NO_ANALOGUE_SYMBOL
    );
  }

  private drawLine() {
    const TEXT_COLOR = '#333333';
    this.rootElement
      ?.append('path')
      .attr('d', 'M 0,3 L 12,3')
      .attr('stroke', TEXT_COLOR)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', '1.7px');
  }

  protected drawModification() {
    const isAsparticAcidWithDifferentR3 =
      this.node.monomer.monomerItem.label === 'D*';
    if (isAsparticAcidWithDifferentR3) return;
    if (this.symbolToDisplay === this.#NO_ANALOGUE_SYMBOL) return;
    this.drawLine();
  }

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr('data-symbol-type', 'Peptide');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
