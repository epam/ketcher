import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class ChemSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '@';
  }

  protected drawModification() {}

  public show() {
    if (this.node.monomer.monomerItem.props.isMicromoleculeFragment) {
      return;
    }

    super.show();
  }
}
