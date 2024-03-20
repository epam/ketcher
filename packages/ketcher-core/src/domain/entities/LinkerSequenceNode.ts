import { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  getNextMonomerInChain,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { Chem } from 'domain/entities/Chem';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';

export class LinkerSequenceNode {
  constructor(public monomer: BaseMonomer) {}

  public get SubChainConstructor() {
    return this.monomer.SubChainConstructor;
  }

  public get firstMonomerInNode() {
    return this.monomer;
  }

  public get lastMonomerInNode() {
    return this.monomers[this.monomers.length - 1];
  }

  public get monomers() {
    const monomers = [this.firstMonomerInNode];
    let nextMonomer = getNextMonomerInChain(this.firstMonomerInNode);
    while (
      nextMonomer instanceof Chem ||
      nextMonomer instanceof Phosphate ||
      nextMonomer instanceof RNABase ||
      (nextMonomer instanceof Sugar &&
        !isValidNucleotide(nextMonomer) &&
        !isValidNucleoside(nextMonomer))
    ) {
      monomers.push(nextMonomer);
      nextMonomer = getNextMonomerInChain(nextMonomer);
    }

    return monomers;
  }

  public get renderer() {
    return this.monomer.renderer;
  }

  public get modified() {
    return false;
  }
}
