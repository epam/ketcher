import { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  getNextMonomerInChain,
  getPreviousMonomerInChain,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { Chem } from 'domain/entities/Chem';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { KetMonomerClass } from 'application/formatters';

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
    const firstMonomer = this.firstMonomerInNode;
    let nextMonomer = getNextMonomerInChain(this.firstMonomerInNode);
    while (LinkerSequenceNode.isValidPartForLinker(nextMonomer)) {
      monomers.push(nextMonomer);
      nextMonomer = getNextMonomerInChain(nextMonomer, firstMonomer);
    }

    return monomers;
  }

  public get renderer() {
    return this.monomer.renderer;
  }

  public get modified() {
    return false;
  }

  public static isValidPartForLinker(
    monomer?: BaseMonomer,
  ): monomer is BaseMonomer {
    return (
      monomer instanceof Chem ||
      monomer instanceof Phosphate ||
      monomer instanceof RNABase ||
      (monomer instanceof Sugar &&
        !isValidNucleotide(monomer) &&
        !isValidNucleoside(monomer)) ||
      (monomer instanceof AmbiguousMonomer &&
        (monomer.monomerClass === KetMonomerClass.CHEM ||
          monomer.monomerClass === KetMonomerClass.Sugar ||
          monomer.monomerClass === KetMonomerClass.Phosphate ||
          monomer.monomerClass === KetMonomerClass.Base))
    );
  }

  public static isPartOfLinker(monomer?: BaseMonomer) {
    if (!monomer) {
      return false;
    }

    const previousMonomerInChain = getPreviousMonomerInChain(monomer);
    const nextMonomerInChain = getNextMonomerInChain(monomer);

    return (
      LinkerSequenceNode.isValidPartForLinker(monomer) &&
      (LinkerSequenceNode.isValidPartForLinker(previousMonomerInChain) ||
        LinkerSequenceNode.isValidPartForLinker(nextMonomerInChain))
    );
  }
}
