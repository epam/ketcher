import { BaseRenderer } from 'application/render';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class SugarSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return this.monomer.attachmentPointsToBonds.R3?.getAnotherMonomer(
      this.monomer,
    ).label;
  }
}
