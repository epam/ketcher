import { BaseMonomer } from './BaseMonomer';
import { Peptide } from './Peptide';
import { ChemSubChain } from './monomer-chains/ChemSubChain';
import type { SubChainNode } from './monomer-chains/types';

export class Chem extends BaseMonomer {
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
    return ![ChemSubChain].includes(monomerToChain.SubChainConstructor);
  }
}
