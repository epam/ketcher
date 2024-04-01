import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';
import { BaseMonomer, Peptide, Phosphate, Sugar } from 'domain/entities';
import {
  getNextMonomerInChain,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';

export class Chain {
  public subChains: BaseSubChain[] = [];

  constructor(firstMonomer?: BaseMonomer) {
    if (firstMonomer) {
      this.fillSubChains(firstMonomer);
    }
  }

  public add(monomer: BaseMonomer) {
    const needCreateNewSubchain =
      !this.lastNode?.monomer ||
      monomer.isMonomerTypeDifferentForChaining(this.lastNode.monomer);

    if (needCreateNewSubchain) {
      this.subChains.push(new monomer.SubChainConstructor());
    }

    const nextMonomer = getNextMonomerInChain(monomer);

    if (monomer instanceof Sugar && isValidNucleoside(monomer)) {
      this.lastSubChain.add(Nucleoside.fromSugar(monomer));
    } else if (monomer instanceof Sugar && isValidNucleotide(monomer)) {
      this.lastSubChain.add(Nucleotide.fromSugar(monomer));
    } else if (monomer instanceof Peptide) {
      this.lastSubChain.add(new MonomerSequenceNode(monomer));
    } else if (
      monomer instanceof Phosphate &&
      (this.lastNode instanceof Nucleoside ||
        (nextMonomer instanceof Sugar &&
          (isValidNucleotide(nextMonomer) || isValidNucleotide(nextMonomer))))
    ) {
      this.lastSubChain.add(new MonomerSequenceNode(monomer));
    } else {
      this.lastSubChain.add(new LinkerSequenceNode(monomer));
    }
  }

  private fillSubChains(monomer?: BaseMonomer) {
    if (!monomer) return;

    this.add(monomer);
    this.fillSubChains(getNextMonomerInChain(this.lastNode?.lastMonomerInNode));
  }

  public get lastSubChain() {
    return this.subChains[this.subChains.length - 1];
  }

  public get lastNode() {
    return this.lastSubChain?.lastNode;
  }

  public get firstSubChain() {
    return this.subChains[0];
  }

  public get firstNode() {
    return this.firstSubChain?.firstNode;
  }

  public get length() {
    let length = 0;
    this.subChains.forEach((subChain) => {
      length += subChain.length;
    });

    return length;
  }

  public get isEmpty() {
    return (
      this.subChains.length === 1 &&
      this.subChains[0].nodes.length === 1 &&
      this.subChains[0].nodes[0] instanceof EmptySequenceNode
    );
  }
}
