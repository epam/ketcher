import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class RnaBaseSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '';
  }
}
