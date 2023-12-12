import { BaseMonomer } from './BaseMonomer';
import { MonomerItemType } from 'domain/types';
import { Vec2 } from './vec2';
import { Sugar } from './Sugar';

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
        potentialPointOnOther === 'R2' &&
        this.isAttachmentPointExistAndFree('R1')
      ) {
        return 'R1';
      } else if (
        potentialPointOnOther !== 'R2' &&
        this.isAttachmentPointExistAndFree('R2')
      ) {
        return 'R2';
      } else {
        return;
      }
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree('R2') &&
      this.isAttachmentPointExistAndFree('R1')
    ) {
      return 'R1';
    }

    if (
      !otherMonomer.isAttachmentPointExistAndFree('R2') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }

    return undefined;
  }
}
