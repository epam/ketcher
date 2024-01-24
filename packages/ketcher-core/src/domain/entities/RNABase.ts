import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Sugar } from 'domain/entities/Sugar';

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

  public get isPartOfRna(): boolean {
    return (
      this.attachmentPointsToBonds.R1?.getAnotherMonomer(this) instanceof Sugar
    );
  }
}
