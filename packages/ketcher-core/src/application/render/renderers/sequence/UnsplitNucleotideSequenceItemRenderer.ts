import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class UnsplitNucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode || '@';
  }

  protected drawModification(): void {
    return undefined;
  }
}
