import { BaseMonomer } from './BaseMonomer';
import { ChemSubChain } from './monomer-chains/ChemSubChain';
import { PeptideSubChain } from './monomer-chains/PeptideSubChain';
import type { SubChainNode } from './monomer-chains/types';
import { Peptide } from './Peptide';

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
