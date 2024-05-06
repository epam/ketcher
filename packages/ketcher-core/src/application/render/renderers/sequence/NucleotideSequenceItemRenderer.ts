import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { Nucleotide } from 'domain/entities';
import { D3SvgElementSelection } from 'application/render/types';

export class NucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
  private phosphateModificationCircleElement?: D3SvgElementSelection<
    SVGCircleElement,
    void
  >;

  get symbolToDisplay(): string {
    return (
      this.node.monomer.attachmentPointsToBonds.R3?.getAnotherMonomer(
        this.node.monomer,
      )?.monomerItem?.props.MonomerNaturalAnalogCode || '@'
    );
  }

  protected drawModification() {
    const node = this.node as Nucleotide;

    if (this.phosphateModificationCircleElement) {
      this.phosphateModificationCircleElement.remove();
    }

    if (node.rnaBase.isModification) {
      this.backgroundElement?.attr(
        'fill',
        this.node.monomer.selected
          ? this.isSequenceEditInRnaBuilderModeTurnedOn
            ? '#41A8B2'
            : '#3ACA6A'
          : this.isSequenceEditModeTurnedOn
          ? '#ff7a004f'
          : '#CAD3DD',
      );
    }

    if (node.sugar.isModification) {
      this.backgroundElement
        ?.attr(
          'stroke',
          this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858',
        )
        .attr('stroke-width', '1px');
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

    // show modification for not last Nucleoside
    if (!node.phosphate) {
      this.phosphateModificationCircleElement = this.rootElement
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
