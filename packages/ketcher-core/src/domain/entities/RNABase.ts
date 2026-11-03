import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import {
  getSugarFromRnaBase,
  isSugarOrAmbiguousSugar,
} from 'domain/helpers/monomers';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

export class RNABase extends BaseMonomer {
  public getValidSourcePoint(secondMonomer?: BaseMonomer) {
    if (this.chosenFirstAttachmentPointForBond) {
      return this.chosenFirstAttachmentPointForBond;
    }

    if (this.unUsedAttachmentPointsNamesList.length === 1) {
      return this.unUsedAttachmentPointsNamesList[0];
    }

    if (!secondMonomer) {
      return this.firstFreeAttachmentPoint;
    }

    // The only default bond a base takes part in is sugar R3 - base R1.
    if (isSugarOrAmbiguousSugar(secondMonomer)) {
      return this.isAttachmentPointExistAndFree(AttachmentPointName.R1)
        ? AttachmentPointName.R1
        : undefined;
    }

    // Several free attachment points and no default for this partner: the
    // caller opens the "Select Attachment Points" dialog on undefined.
    return undefined;
  }

  public getValidTargetPoint() {
    if (this.potentialSecondAttachmentPointForBond) {
      return this.potentialSecondAttachmentPointForBond;
    }
    return this.firstFreeAttachmentPoint;
  }

  public get SubChainConstructor() {
    return ChemSubChain;
  }

  public override get sideConnections() {
    const sideConnections: PolymerBond[] = [];
    this.forEachBond((polymerBond, attachmentPointName) => {
      if (
        !(polymerBond instanceof MonomerToAtomBond) &&
        (attachmentPointName !== AttachmentPointName.R1 ||
          !getSugarFromRnaBase(this))
      ) {
        sideConnections.push(polymerBond);
      }
    });

    return sideConnections;
  }
}
