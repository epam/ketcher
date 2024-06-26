import { BaseMonomer, Peptide } from 'domain/entities';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';

export class UnresolvedMonomer extends BaseMonomer {
  public getValidSourcePoint(monomer?: BaseMonomer) {
    return Peptide.prototype.getValidSourcePoint.call(this, monomer);
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    return Peptide.prototype.getValidTargetPoint.call(this, monomer);
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
