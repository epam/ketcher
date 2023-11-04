import { BaseMonomer } from './BaseMonomer';

export class Peptide extends BaseMonomer {
  public getValidSourcePoint(monomer: BaseMonomer): string {
    if (this.hasAttachmentPoint('R1') && !this.isAttachmentPointUsed('R1')) {
      return 'R1';
    }
    return 'R2';
  }

  public getValidTargetPoint(monomer: BaseMonomer): string {
    if (this.hasAttachmentPoint('R2') && !this.isAttachmentPointUsed('R2')) {
      return 'R2';
    }
    return 'R1';
  }
}
