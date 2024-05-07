import { BaseMonomer } from './BaseMonomer';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { Vec2 } from './vec2';
import { Sugar } from './Sugar';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';

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

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return ![PhosphateSubChain, RnaSubChain].includes(
      monomerToChain.SubChainConstructor,
    );
  }

  public get SubChainConstructor() {
    return PhosphateSubChain;
  }

  public get isPartOfRna(): boolean {
    // To avoid endless looping when checking `monomerForR2`,
    // we take into account that we did not return to checking the initial phosphate (`this`).
    const checkIfPhosphateIsPartOfRNA = (phosphate: Phosphate): boolean => {
      const { R1: polymerBond1, R2: polymerBond2 } =
        phosphate.attachmentPointsToBonds;
      const monomerForR1 = polymerBond1?.getAnotherMonomer(phosphate);
      const monomerForR2 = polymerBond2?.getAnotherMonomer(phosphate);
      if (!monomerForR1 || !monomerForR2) {
        return false;
      }
      const isMonomerForR1SugarAndPartOfRNA =
        monomerForR1 instanceof Sugar && (monomerForR1 as Sugar).isPartOfRna;
      if (monomerForR2 === this) {
        return isMonomerForR1SugarAndPartOfRNA;
      }
      const isMonomerForR2PartOfRNA =
        monomerForR2 instanceof Phosphate
          ? checkIfPhosphateIsPartOfRNA(monomerForR2)
          : monomerForR2.isPartOfRna;
      // `isMonomerForR2PartOfRNA` used here because we need to interpret last phosphate of RNA chain
      // as not a part of nucleoTide but as phosphate connected to nucleoSide
      return isMonomerForR1SugarAndPartOfRNA && isMonomerForR2PartOfRNA;
    };

    return checkIfPhosphateIsPartOfRNA(this);
  }

  // The second version. Unused.
  // From my point of view, we can avoid using the cyclic getter calling.
  // Instead of that we can describe two iterations.
  public get isPartOfRNA(): boolean {
    const { R1: polymerBond1, R2: polymerBond2 } = this.attachmentPointsToBonds;
    const monomerForR1 = polymerBond1?.getAnotherMonomer(this);
    const monomerForR2 = polymerBond2?.getAnotherMonomer(this);
    if (!monomerForR1 || !monomerForR2) {
      return false;
    }
    const { R1: polymerBond1FromMonomerForR2 } =
      monomerForR2.attachmentPointsToBonds;
    const monomerForR1FromMonomerForR2 =
      polymerBond1FromMonomerForR2?.getAnotherMonomer(monomerForR2);
    if (!monomerForR1FromMonomerForR2) {
      return false;
    }
    const checkIfMonomerSugarAndPartOfRNA = (monomer: BaseMonomer): boolean => {
      return monomer instanceof Sugar && (monomer as Sugar).isPartOfRna;
    };
    const isMonomerForR1SugarAndPartOfRNA =
      checkIfMonomerSugarAndPartOfRNA(monomerForR1);
    const isMonomerForR1FromMonomerForR2SugarAndPartOfRNA =
      checkIfMonomerSugarAndPartOfRNA(monomerForR1FromMonomerForR2);
    // `isMonomerForR1FromMonomerForR2SugarAndPartOfRNA` used here because we need to interpret last phosphate of RNA chain
    // as not a part of nucleoTide but as phosphate connected to nucleoSide
    return (
      isMonomerForR1SugarAndPartOfRNA &&
      isMonomerForR1FromMonomerForR2SugarAndPartOfRNA
    );
  }
}
