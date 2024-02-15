import { BaseMonomer } from './BaseMonomer';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { Vec2 } from './vec2';
import { Sugar } from './Sugar';
import { RNABase } from 'domain/entities/RNABase';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';

export class Phosphate extends BaseMonomer {
  constructor(monomerItem: MonomerItemType, _position?: Vec2) {
    super(monomerItem, _position);
  }

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

    // If other monomer is not a Sugar, we want to open modal
    if (!(otherMonomer instanceof Sugar)) {
      return;
    }
    // If we chose a specific AP on other monomer, we want to determine the correct AP on this one
    if (potentialPointOnOther) {
      if (
        potentialPointOnOther === AttachmentPointName.R2 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
      ) {
        return AttachmentPointName.R1;
      } else if (
        potentialPointOnOther !== AttachmentPointName.R2 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
      ) {
        return AttachmentPointName.R2;
      } else {
        return;
      }
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) &&
      this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
    ) {
      return AttachmentPointName.R1;
    }

    if (
      !otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) &&
      this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R2;
    }

    return undefined;
  }

  public get SubChainConstructor() {
    return PhosphateSubChain;
  }

  get isPartOfRna() {
    const previousMonomer =
      this.attachmentPointsToBonds.R1?.getAnotherMonomer(this);
    const isPreviousMonomerSugar = previousMonomer instanceof Sugar;
    const isSugarConnectedToBase =
      previousMonomer?.attachmentPointsToBonds.R3?.getAnotherMonomer(
        previousMonomer,
      ) instanceof RNABase;
    const nextMonomer =
      this.attachmentPointsToBonds.R2?.getAnotherMonomer(this);
    const isNextMonomerRna = nextMonomer?.isPartOfRna;

    // isNextMonomerRna used here because we need to interpret last phosphate of rna chain
    // as not a part of nucleoTide but as phosphate connected to nucleoSide
    return isPreviousMonomerSugar && isSugarConnectedToBase && isNextMonomerRna;
  }
}
