import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { Nucleotide } from 'domain/entities';

export class NucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return (
      this.node.monomer.attachmentPointsToBonds.R3?.getAnotherMonomer(
        this.node.monomer,
      )?.monomerItem?.props.MonomerNaturalAnalogCode || '@'
    );
  }

  protected drawModification() {
    const node = this.node as Nucleotide;
    if (node.rnaBase.isModification) {
      this.backgroundElement?.attr('fill', '#CAD3DD');
    }

    if (node.sugar.isModification) {
      this.backgroundElement
        ?.attr('stroke', '#585858')
        .attr('stroke-width', '1px');
    }

    if (node.phosphate?.isModification) {
      this.rootElement
        ?.append('circle')
        .attr('r', '4px')
        .attr('fill', '#585858')
        .attr('cx', '10')
        .attr('cy', '-15');
    }
  }
}
