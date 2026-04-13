import { BaseMonomer } from './BaseMonomer';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { Vec2 } from './vec2';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { isSugarOrAmbiguousSugar } from 'domain/helpers/monomers';

export class Phosphate extends BaseMonomer {
  constructor(monomerItem: MonomerItemType, _position?: Vec2) {
    super(monomerItem, _position);
  }

  public getValidSourcePoint(secondMonomer: BaseMonomer) {
    if (!secondMonomer) {
      return this.firstFreeAttachmentPoint;
    }

    return Phosphate.getValidPoint(
      this,
      secondMonomer,
      secondMonomer.potentialSecondAttachmentPointForBond,
    );
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer) {
    if (!firstMonomer) {
      return this.firstFreeAttachmentPoint;
    }

    // same implementation for both source and target attachment points
    return Phosphate.getValidPoint(
      this,
      firstMonomer,
      firstMonomer.chosenFirstAttachmentPointForBond,
    );
  }

  private static getValidPoint(
    self: BaseMonomer,
    otherMonomer: BaseMonomer,
    potentialPointOnOther: string | null,
  ) {
    // If we chose specific start AP on this monomer, return it
    if (self.chosenFirstAttachmentPointForBond) {
      return self.chosenFirstAttachmentPointForBond;
    }

    // If we want to choose specific end AP on this monomer, return it
    if (self.potentialSecondAttachmentPointForBond) {
      return self.potentialSecondAttachmentPointForBond;
    }

    // If this is the only available AP on this monomer, return it
    if (self.unUsedAttachmentPointsNamesList.length === 1) {
      return self.unUsedAttachmentPointsNamesList[0];
    }

    // If other monomer is not a Sugar, we want to open modal
    if (!isSugarOrAmbiguousSugar(otherMonomer)) {
      return;
    }
    // If we chose a specific AP on other monomer, we want to determine the correct AP on this one
    if (potentialPointOnOther) {
      if (
        potentialPointOnOther === AttachmentPointName.R2 &&
        self.isAttachmentPointExistAndFree(AttachmentPointName.R1)
      ) {
        return AttachmentPointName.R1;
      } else if (
        potentialPointOnOther !== AttachmentPointName.R2 &&
        self.isAttachmentPointExistAndFree(AttachmentPointName.R2)
      ) {
        return AttachmentPointName.R2;
      } else {
        return;
      }
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) &&
      self.isAttachmentPointExistAndFree(AttachmentPointName.R1)
    ) {
      return AttachmentPointName.R1;
    }

    if (
      !otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) &&
      self.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R2;
    }

    return undefined;
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return ![PhosphateSubChain, RnaSubChain].includes(
      monomerToChain.SubChainConstructor,
    );
  }

  public get SubChainConstructor() {
    return PhosphateSubChain;
  }
}
