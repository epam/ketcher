import { BaseMonomer } from './BaseMonomer';

export class Peptide extends BaseMonomer {
  public getValidSourcePoint(monomer: BaseMonomer) {
    if (
      monomer.hasAttachmentPoint('R1') &&
      !monomer.isAttachmentPointUsed('R1')
    ) {
      return this.R1AttachmentPoint;
    }
    return this.R2AttachmentPoint;
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    if (
      monomer.hasAttachmentPoint('R2') &&
      !monomer.isAttachmentPointUsed('R2')
    ) {
      return this.R2AttachmentPoint;
    }
    return this.R1AttachmentPoint;
  }
}
