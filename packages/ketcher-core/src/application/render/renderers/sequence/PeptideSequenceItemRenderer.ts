import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class PeptideSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode || '@';
  }
}
