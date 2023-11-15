import { BaseMonomer } from './BaseMonomer';
import { RNABase } from './RNABase';
import { Phosphate } from './Phosphate';

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
      if (this.isAttachmentPointExistAndFree('R3')) {
        return 'R3';
      } else return;
    }

    // If we chose a specific AP on some Phosphate, we want to determine the correct AP on this Sugar
    if (potentialPointOnOther) {
      if (
        potentialPointOnOther === 'R1' &&
        this.isAttachmentPointExistAndFree('R2')
      ) {
        return 'R2';
      } else if (
        potentialPointOnOther !== 'R1' &&
        this.isAttachmentPointExistAndFree('R1')
      ) {
        return 'R1';
      } else {
        return;
      }
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }

    if (
      !otherMonomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R1')
    ) {
      return 'R1';
    }
  }
}
