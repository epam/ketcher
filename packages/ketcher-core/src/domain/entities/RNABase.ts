import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Sugar } from 'domain/entities/Sugar';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';

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

  public get SubChainConstructor() {
    return ChemSubChain;
  }

  public get isPartOfRna(): boolean {
    return (
      this.attachmentPointsToBonds.R1?.getAnotherMonomer(this) instanceof Sugar
    );
  }
}
