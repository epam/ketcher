import { BaseMonomer } from './BaseMonomer';
import { Peptide } from './Peptide';
import type { SubChainNode } from './monomer-chains/types';
import { RnaSubChain } from './monomer-chains/RnaSubChain';

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
