import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { isMonomerSgroupWithAttachmentPoints } from '../../../../utilities/monomers';
import { D3SvgElementSelection } from 'application/render/types';

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

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr('data-symbol-type', 'CHEM');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
