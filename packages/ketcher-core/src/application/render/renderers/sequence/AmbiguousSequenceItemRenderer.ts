import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class AmbiguousSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return this.node.monomer.label;
  }

  protected drawModification() {}
}
