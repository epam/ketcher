import { BaseMonomer } from './BaseMonomer';

export class Peptide extends BaseMonomer {

  public getValidSourcePoint(monomer: BaseMonomer) {
    if (
      monomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }
    if (
      this.isAttachmentPointExistAndFree('R1') &&
      monomer.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R1';
    }

    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    if (
      this.isAttachmentPointExistAndFree('R1') &&
      monomer.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R1';
    }
    if (
      monomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }

    return this.firstFreeAttachmentPoint;
  }
}
