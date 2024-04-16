import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';
import { BaseMonomer, Sugar } from 'domain/entities';
import {
  getNextMonomerInChain,
  getPhosphateFromSugar,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';

export class Chain {
  public isCyclic = false;

  public subChains: BaseSubChain[] = [];

  public firstMonomer: BaseMonomer | null;

  constructor(firstMonomer?: BaseMonomer, isCyclic?: boolean) {
    this.firstMonomer = null;

    if (firstMonomer) {
      this.firstMonomer = firstMonomer;

      this.fillSubChains(firstMonomer);
    }

    if (isCyclic) {
      this.isCyclic = isCyclic;
    }
  }

  public add(monomer: BaseMonomer) {
    const needCreateNewSubchain =
      !this.lastNode?.monomer ||
      monomer.isMonomerTypeDifferentForChaining(this.lastNode.monomer);

    if (needCreateNewSubchain) {
      this.subChains.push(new monomer.SubChainConstructor());
    }

    if (!(monomer instanceof Sugar)) {
      this.lastSubChain.add(new MonomerSequenceNode(monomer));
    } else if (isValidNucleoside(monomer)) {
      this.lastSubChain.add(Nucleoside.fromSugar(monomer));
    } else if (isValidNucleotide(monomer)) {
      this.lastSubChain.add(Nucleotide.fromSugar(monomer));
    } else {
      this.lastSubChain.add(new MonomerSequenceNode(monomer));
    }
  }

  private fillSubChains(monomer?: BaseMonomer) {
    if (!monomer) return;

    this.add(monomer);
    if (this.lastNode instanceof Nucleotide) {
      this.fillSubChains(
        getNextMonomerInChain(
          getPhosphateFromSugar(monomer),
          this.firstMonomer,
        ),
      );
    } else {
      this.fillSubChains(getNextMonomerInChain(monomer, this.firstMonomer));
    }
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
