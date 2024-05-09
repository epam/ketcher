import { BaseMonomer } from './BaseMonomer';
import { RNABase } from './RNABase';
import { Phosphate } from './Phosphate';
import { AttachmentPointName } from 'domain/types';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';

export class Sugar extends BaseMonomer {
  public getValidSourcePoint(secondMonomer: BaseMonomer) {
    return this.getValidPoint(
      secondMonomer,
      secondMonomer.potentialSecondAttachmentPointForBond,
    );
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer) {
    // same implementation for both source and target attachment points
    return this.getValidPoint(
      firstMonomer,
      firstMonomer.chosenFirstAttachmentPointForBond,
    );
  }

  private getValidPoint(
    otherMonomer: BaseMonomer,
    potentialPointOnOther: string | null,
  ) {
    // If we chose specific start AP on this monomer, return it
    if (this.chosenFirstAttachmentPointForBond) {
      return this.chosenFirstAttachmentPointForBond;
    }
    // If we want to choose specific end AP on this monomer, return it
    if (this.potentialSecondAttachmentPointForBond) {
      return this.potentialSecondAttachmentPointForBond;
    }
    // If this is the only available AP on this monomer, return it
    if (this.unUsedAttachmentPointsNamesList.length === 1) {
      return this.unUsedAttachmentPointsNamesList[0];
    }

    // If other monomer is neither a Phosphate nor RNABase, open modal
    if (
      !(otherMonomer instanceof Phosphate) &&
      !(otherMonomer instanceof RNABase)
    ) {
      return;
    }

    // If other monomer is RNABase, attach it to R3 or open modal
    if (otherMonomer instanceof RNABase) {
      if (this.isAttachmentPointExistAndFree(AttachmentPointName.R3)) {
        return AttachmentPointName.R3;
      } else return;
    }

    // If we chose a specific AP on some Phosphate, we want to determine the correct AP on this Sugar
    if (potentialPointOnOther) {
      if (
        potentialPointOnOther === AttachmentPointName.R1 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
      ) {
        return AttachmentPointName.R2;
      } else if (
        potentialPointOnOther !== AttachmentPointName.R1 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
      ) {
        return AttachmentPointName.R1;
      } else {
        return;
      }
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) &&
      this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R2;
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) &&
      this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
    ) {
      return AttachmentPointName.R1;
    }

    if (
      !otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) &&
      this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
    ) {
      return AttachmentPointName.R1;
    }

    return undefined;
  }

  public get SubChainConstructor() {
    return RnaSubChain;
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return ![PhosphateSubChain, RnaSubChain].includes(
      monomerToChain.SubChainConstructor,
    );
  }

  public get isPartOfRNA(): boolean {
    return (
      this.attachmentPointsToBonds.R3?.getAnotherMonomer(this) instanceof
      RNABase
    );
  }
}
