import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class Chem extends BaseMonomer {
  public getValidSourcePoint(monomer: BaseMonomer) {
    if (
      monomer.hasAttachmentPoint('R1') &&
      !monomer.isAttachmentPointUsed('R1')
    ) {
      return 'R1';
    }
    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    if (
      monomer.hasAttachmentPoint('R1') &&
      !monomer.isAttachmentPointUsed('R1')
    ) {
      return 'R1';
    }
    return this.firstFreeAttachmentPoint;
  }
}
