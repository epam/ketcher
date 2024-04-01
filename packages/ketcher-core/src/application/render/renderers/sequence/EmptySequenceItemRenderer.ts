import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class EmptySequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '';
  }

  protected drawModification() {}
}
