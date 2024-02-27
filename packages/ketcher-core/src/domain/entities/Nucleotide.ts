import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';
import { Sugar } from 'domain/entities/Sugar';
import assert from 'assert';
import {
  getPhosphateFromSugar,
  getRnaBaseFromSugar,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';

export class Nucleotide {
  constructor(
    public sugar: Sugar,
    public rnaBase: RNABase,
    public phosphate: Phosphate,
  ) {}

  static fromSugar(sugar: Sugar) {
    assert(
      isValidNucleotide(sugar),
      'Nucleotide is not valid. Please check nucleotide parts connections.',
    );

    const isNucleoside = isValidNucleoside(sugar);
    assert(
      !isNucleoside,
      'Nucleotide is nucleoside because it is a last sugar+base of rna chain',
    );

    return new Nucleotide(
      sugar,
      getRnaBaseFromSugar(sugar) as RNABase,
      getPhosphateFromSugar(sugar) as Phosphate,
    );
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return this.sugar.isMonomerTypeDifferentForChaining(monomerToChain);
  }

  public get SubChainConstructor() {
    return this.sugar.SubChainConstructor;
  }

  public get monomer() {
    return this.sugar;
  }

  public get monomers() {
    return [this.sugar, this.rnaBase, this.phosphate];
  }

  public get firstMonomerInNode() {
    return this.sugar;
  }

  public get lastMonomerInNode() {
    return this.phosphate;
  }
}
