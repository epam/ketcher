import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class UnsplitNucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    const naturalAnalogue =
      this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode;

    return naturalAnalogue && naturalAnalogue !== 'X' ? naturalAnalogue : '@';
  }

  protected drawModification(): void {
    return undefined;
  }
}
