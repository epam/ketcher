import { BaseSequenceItemRenderer } from 'application/render';

export class UnsplitNucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode || '@';
  }

  protected drawModification(): void {
    return undefined;
  }
}
