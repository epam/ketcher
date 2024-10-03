import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

export class RNABase extends BaseMonomer {
  public getValidSourcePoint() {
    if (this.chosenFirstAttachmentPointForBond) {
      return this.chosenFirstAttachmentPointForBond;
    }
    return this.firstFreeAttachmentPoint;
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
