import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class EmptySequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '';
  }

  get dataSymbolType(): string {
    return 'Empty';
  }

  protected drawModification() {}
}
