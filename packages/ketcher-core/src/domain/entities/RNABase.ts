import { BaseMonomer } from './BaseMonomer';
import { ChemSubChain } from './monomer-chains/ChemSubChain';
import type { PolymerBond } from './PolymerBond';
import { AttachmentPointName } from '../types/monomers';
import { getSugarFromRnaBase } from '../helpers/monomers';
import { MonomerToAtomBond } from './MonomerToAtomBond';

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
