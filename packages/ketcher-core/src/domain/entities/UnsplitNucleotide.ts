import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Peptide } from 'domain/entities/Peptide';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';

export class UnsplitNucleotide extends BaseMonomer {
  public getValidSourcePoint(monomer?: BaseMonomer) {
    return Peptide.prototype.getValidSourcePoint.call(this, monomer);
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    return Peptide.prototype.getValidTargetPoint.call(this, monomer);
  }

  public get SubChainConstructor() {
    return RnaSubChain;
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return ![RnaSubChain].includes(monomerToChain.SubChainConstructor);
  }
}
