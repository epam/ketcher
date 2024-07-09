import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { NO_NATURAL_ANALOGUE } from 'domain/constants/monomers';

export class UnsplitNucleotideSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    const naturalAnalogue =
      this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode;

    return naturalAnalogue && naturalAnalogue !== NO_NATURAL_ANALOGUE
      ? naturalAnalogue
      : '@';
  }

  protected drawModification(): void {
    return undefined;
  }
}
