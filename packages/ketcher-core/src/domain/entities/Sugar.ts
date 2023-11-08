import { BaseMonomer } from './BaseMonomer';
import { RNABase } from './RNABase';
import { Phosphate } from './Phosphate';

export class Sugar extends BaseMonomer {
  public getValidSourcePoint(monomer: BaseMonomer) {
    if (
      monomer instanceof RNABase &&
      this.hasAttachmentPoint('R3') &&
      !this.isAttachmentPointUsed('R3')
    ) {
      return 'R3';
    }
    if (
      monomer instanceof Phosphate &&
      this.hasAttachmentPoint('R1') &&
      !this.isAttachmentPointUsed('R1')
    ) {
      return 'R1';
    }
    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    if (
      monomer instanceof RNABase &&
      this.hasAttachmentPoint('R3') &&
      !this.isAttachmentPointUsed('R3')
    ) {
      return 'R3';
    }
    if (
      monomer instanceof Phosphate &&
      this.hasAttachmentPoint('R1') &&
      !this.isAttachmentPointUsed('R1')
    ) {
      return 'R1';
    }
    return this.firstFreeAttachmentPoint;
  }
}
