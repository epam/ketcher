import { BaseMonomer } from './BaseMonomer';

export class Peptide extends BaseMonomer {
  public getValidSourcePoint(secondMonomer?: BaseMonomer) {
    if (
      (!secondMonomer || secondMonomer.isAttachmentPointExistAndFree('R1')) &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }
    if (
      this.isAttachmentPointExistAndFree('R1') &&
      secondMonomer?.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R1';
    }

    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer) {
    if (
      this.isAttachmentPointExistAndFree('R1') &&
      firstMonomer.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R1';
    }
    if (
      firstMonomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }

    return this.firstFreeAttachmentPoint;
  }
}
