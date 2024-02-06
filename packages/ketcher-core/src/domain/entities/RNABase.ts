import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class RNABase extends BaseMonomer {
  public getValidSourcePoint() {
    if (this.chosenFirstAttachmentPointForBond) {
      return this.chosenFirstAttachmentPointForBond;
    }
    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint() {
    if (this.potentialSecondAttachmentPointForBond) {
      return this.potentialSecondAttachmentPointForBond;
    }
    return this.firstFreeAttachmentPoint;
  }
}
