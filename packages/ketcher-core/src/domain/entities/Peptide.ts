import { BaseMonomer } from './BaseMonomer';
import { Phosphate } from './Phosphate';
import { Sugar } from './Sugar';

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
        secondMonomer?.potentialSecondAttachmentPointForBond === 'R1' &&
        this.isAttachmentPointExistAndFree('R2')
      ) {
        return 'R2';
      }
      if (
        secondMonomer?.potentialSecondAttachmentPointForBond === 'R2' &&
        this.isAttachmentPointExistAndFree('R1')
      ) {
        return 'R1';
      }
      return;
    }
    if (
      (!secondMonomer || secondMonomer.isAttachmentPointExistAndFree('R1')) &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }
    if (
      this.isAttachmentPointExistAndFree('R1') &&
      secondMonomer?.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R1';
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
        firstMonomer?.chosenFirstAttachmentPointForBond === 'R1' &&
        this.isAttachmentPointExistAndFree('R2')
      ) {
        return 'R2';
      }
      if (
        firstMonomer?.chosenFirstAttachmentPointForBond === 'R2' &&
        this.isAttachmentPointExistAndFree('R1')
      ) {
        return 'R1';
      }
      return;
    }
    if (
      this.isAttachmentPointExistAndFree('R1') &&
      firstMonomer.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R1';
    }
    if (
      firstMonomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }

    return undefined;
  }

  public isMonomerTypeDifferentForSnakeMode(monomerToChain: BaseMonomer) {
    return (
      monomerToChain instanceof Sugar || monomerToChain instanceof Phosphate
    );
  }
}
