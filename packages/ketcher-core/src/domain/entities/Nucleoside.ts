import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import assert from 'assert';
import {
  getRnaBaseFromSugar,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';

export class Nucleoside {
  constructor(public sugar: Sugar, public rnaBase: RNABase) {}

  static fromSugar(sugar: Sugar) {
    assert(
      isValidNucleoside(sugar),
      'Created nucleoside is not valid. Please check nucleotide parts connections.',
    );

    const isNucleotide = isValidNucleotide(sugar);
    assert(!isNucleotide, 'Created nucleoside is nucleotide.');

    return new Nucleoside(sugar, getRnaBaseFromSugar(sugar) as RNABase);
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
    return [this.sugar, this.rnaBase];
  }

  public get firstMonomerInNode() {
    return this.sugar;
  }

  public get lastMonomerInNode() {
    return this.sugar;
  }
}
