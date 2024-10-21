import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { isMonomerSgroupWithAttachmentPoints } from '../../../../utilities/monomers';

export class ChemSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '@';
  }

  protected drawModification() {}

  public show() {
    if (
      this.node.monomer.monomerItem.props.isMicromoleculeFragment &&
      !isMonomerSgroupWithAttachmentPoints(this.node.monomer)
    ) {
      return;
    }

    super.show();
  }
}
