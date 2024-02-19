import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class PhosphateSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return 'p';
  }
}
