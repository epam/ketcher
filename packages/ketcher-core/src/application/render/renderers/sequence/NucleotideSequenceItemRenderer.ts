import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class NucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return (
      this.node.monomer.attachmentPointsToBonds.R3?.getAnotherMonomer(
        this.node.monomer,
      )?.monomerItem?.props.MonomerNaturalAnalogCode || '@'
    );
  }
}
