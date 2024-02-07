import { BaseMonomer } from './BaseMonomer';
import { Phosphate } from './Phosphate';
import { Sugar } from './Sugar';
import { AttachmentPointName } from 'domain/types';

export class Peptide extends BaseMonomer {
  public getValidSourcePoint(secondMonomer?: BaseMonomer) {
    if (this.chosenFirstAttachmentPointForBond) {
      return this.chosenFirstAttachmentPointForBond;
    }
    if (this.unUsedAttachmentPointsNamesList.length === 1) {
      return this.unUsedAttachmentPointsNamesList[0];
    }
    if (secondMonomer?.potentialSecondAttachmentPointForBond) {
      if (
        secondMonomer?.potentialSecondAttachmentPointForBond ===
          AttachmentPointName.R1 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
      ) {
        return AttachmentPointName.R2;
      }
      if (
        secondMonomer?.potentialSecondAttachmentPointForBond ===
          AttachmentPointName.R2 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
      ) {
        return AttachmentPointName.R1;
      }
      return;
    }
    if (
      (!secondMonomer ||
        secondMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1)) &&
      this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R2;
    }
    if (
      this.isAttachmentPointExistAndFree(AttachmentPointName.R1) &&
      secondMonomer?.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R1;
    }

    return undefined;
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer) {
    if (this.potentialSecondAttachmentPointForBond) {
      return this.potentialSecondAttachmentPointForBond;
    }
    if (this.unUsedAttachmentPointsNamesList.length === 1) {
      return this.unUsedAttachmentPointsNamesList[0];
    }
    if (firstMonomer?.chosenFirstAttachmentPointForBond) {
      if (
        firstMonomer?.chosenFirstAttachmentPointForBond ===
          AttachmentPointName.R1 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
      ) {
        return AttachmentPointName.R2;
      }
      if (
        firstMonomer?.chosenFirstAttachmentPointForBond ===
          AttachmentPointName.R2 &&
        this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
      ) {
        return AttachmentPointName.R1;
      }
      return;
    }
    if (
      this.isAttachmentPointExistAndFree(AttachmentPointName.R1) &&
      firstMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R1;
    }
    if (
      firstMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) &&
      this.isAttachmentPointExistAndFree(AttachmentPointName.R2)
    ) {
      return AttachmentPointName.R2;
    }

    return undefined;
  }

  public isMonomerTypeDifferentForSnakeMode(monomerToChain: BaseMonomer) {
    return (
      monomerToChain instanceof Sugar || monomerToChain instanceof Phosphate
    );
  }
}
