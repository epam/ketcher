import { BaseMonomer } from './BaseMonomer';
import { AttachmentPointName } from 'domain/types';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';

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

  public get SubChainConstructor() {
    return PeptideSubChain;
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return ![PeptideSubChain, ChemSubChain].includes(
      monomerToChain.SubChainConstructor,
    );
  }
}
