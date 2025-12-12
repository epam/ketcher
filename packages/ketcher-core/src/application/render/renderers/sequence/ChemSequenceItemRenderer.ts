import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { isMonomerSgroupWithAttachmentPoints } from '../../../../utilities/monomers';
import { SequenceNodeOptions } from './types';

export class ChemSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '@';
  }

  get dataSymbolType(): string {
    return 'CHEM';
  }

  protected drawModification() {}

  public show(options: SequenceNodeOptions): void {
    super.show(options);
    if (
      options.node.monomer.monomerItem.props.isMicromoleculeFragment &&
      !isMonomerSgroupWithAttachmentPoints(options.node.monomer)
    ) {
      this.hide();
    }
  }
}
