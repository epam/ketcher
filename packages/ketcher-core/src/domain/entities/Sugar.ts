import { BaseMonomer } from './BaseMonomer';
import { RNABase } from './RNABase';
import { AttachmentPointName } from 'domain/types';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';
import {
  isPhosphateOrAmbiguousPhosphate,
  isRnaBaseOrAmbiguousRnaBase,
} from 'domain/helpers/monomers';
import { IVariantMonomer } from 'domain/entities/types';
import { PolymerBond } from 'domain/entities/PolymerBond';

export class Sugar extends BaseMonomer {
  public getValidSourcePoint(secondMonomer?: BaseMonomer & IVariantMonomer) {
    if (!secondMonomer) {
      return this.firstFreeAttachmentPoint;
    }

    return Sugar.getValidPoint(
      this,
      secondMonomer,
      secondMonomer.potentialSecondAttachmentPointForBond,
    );
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer & IVariantMonomer) {
    if (!firstMonomer) {
      return this.firstFreeAttachmentPoint;
    }

    // same implementation for both source and target attachment points
    return Sugar.getValidPoint(
      this,
      firstMonomer,
      firstMonomer.chosenFirstAttachmentPointForBond,
    );
  }

  private static getValidPoint(
    self: BaseMonomer,
    otherMonomer: BaseMonomer & IVariantMonomer,
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

    // If other monomer is neither a Phosphate nor RNABase, open modal
    if (
      !isPhosphateOrAmbiguousPhosphate(otherMonomer) &&
      !isRnaBaseOrAmbiguousRnaBase(otherMonomer)
    ) {
      return;
    }

    // If other monomer is RNABase, attach it to R3 or open modal
    if (isRnaBaseOrAmbiguousRnaBase(otherMonomer)) {
      if (self.isAttachmentPointExistAndFree(AttachmentPointName.R3)) {
        return AttachmentPointName.R3;
      } else return;
    }

    // If we chose a specific AP on some Phosphate, we want to determine the correct AP on this Sugar
    if (potentialPointOnOther) {
      if (
        potentialPointOnOther === AttachmentPointName.R1 &&
        self.isAttachmentPointExistAndFree(AttachmentPointName.R2)
      ) {
        return AttachmentPointName.R2;
      } else if (
        potentialPointOnOther !== AttachmentPointName.R1 &&
        self.isAttachmentPointExistAndFree(AttachmentPointName.R1)
      ) {
        return AttachmentPointName.R1;
      } else {
        return;
      }
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) &&
      self.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R2;
    }

    if (
      otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) &&
      self.isAttachmentPointExistAndFree(AttachmentPointName.R1)
    ) {
      return AttachmentPointName.R1;
    }

    if (
      !otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) &&
      self.isAttachmentPointExistAndFree(AttachmentPointName.R1)
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
    const r3PolymerBond = this.attachmentPointsToBonds.R3;

    return (
      r3PolymerBond instanceof PolymerBond &&
      r3PolymerBond?.getAnotherMonomer(this) instanceof RNABase
    );
  }
}
