import { BaseMonomer } from './BaseMonomer';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Peptide } from 'domain/entities/Peptide';

export class UnresolvedMonomer extends BaseMonomer {
  public getValidSourcePoint(secondMonomer?: BaseMonomer) {
    if (!secondMonomer) {
      return this.firstFreeAttachmentPoint;
    }

    return Peptide.prototype.getValidSourcePoint.call(this, secondMonomer);
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer) {
    if (!firstMonomer) {
      return this.firstFreeAttachmentPoint;
    }

    return Peptide.prototype.getValidTargetPoint.call(this, firstMonomer);
  }

  public get SubChainConstructor() {
    return ChemSubChain;
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return ![PeptideSubChain, ChemSubChain].includes(
      monomerToChain.SubChainConstructor,
    );
  }
}
