import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { Nucleoside, Nucleotide } from 'domain/entities';

export abstract class RNASequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return (
      this.node.monomer.attachmentPointsToBonds.R3?.getAnotherMonomer(
        this.node.monomer,
      )?.monomerItem?.props.MonomerNaturalAnalogCode || '@'
    );
  }

  protected drawCommonModification(node: Nucleoside | Nucleotide) {
    if (node.rnaBase.isModification) {
      this.backgroundElement?.attr(
        'fill',
        this.node.monomer.selected
          ? this.isSequenceEditInRnaBuilderModeTurnedOn
            ? '#41A8B2'
            : '#3ACA6A'
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
  }
}
