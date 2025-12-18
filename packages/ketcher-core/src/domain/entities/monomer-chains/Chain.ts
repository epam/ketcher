import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';
import {
  BaseMonomer,
  Peptide,
  Phosphate,
  SubChainNode,
  Sugar,
  UnresolvedMonomer,
  UnsplitNucleotide,
  Nucleoside,
  Nucleotide,
  MonomerSequenceNode,
  EmptySequenceNode,
  LinkerSequenceNode,
  AmbiguousMonomer,
  PolymerBond,
} from 'domain/entities';
import {
  getNextMonomerInChain,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { EmptySubChain } from 'domain/entities/monomer-chains/EmptySubChain';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';

let id = 0;
export class Chain {
  public subChains: BaseSubChain[] = [];

  public firstMonomer?: BaseMonomer;

  public isCyclic = false;

  public id: number;

  private nodesChanged = true;
  private nodesCache: SubChainNode[] = [];
  private monomersCache: BaseMonomer[] = [];
  private bondsCache: PolymerBond[] = [];

  constructor(firstMonomer?: BaseMonomer, isCyclic?: boolean) {
    this.id = id++;
    if (firstMonomer) {
      this.firstMonomer = firstMonomer;

      this.fillSubChains(firstMonomer);
    }

    if (isCyclic) {
      this.isCyclic = isCyclic;
    }
  }

  private recalculateNodes() {
    // TODO if node.monomers change somewhere else, we will have incorrect cache
    if (this.nodesChanged) {
      this.nodesCache = this.subChains.flatMap((subChain) => subChain.nodes);
      this.monomersCache = this.nodesCache.flatMap((node) => node.monomers);
      this.bondsCache = this.subChains.flatMap((subChain) => subChain.bonds);

      this.nodesChanged = false;
    }
  }

  private createSubChainIfNeed(monomer) {
    const needCreateNewSubchain =
      !this.lastNode?.monomer ||
      monomer.isMonomerTypeDifferentForChaining(this.lastNode.monomer);

    if (needCreateNewSubchain) {
      this.subChains.push(new monomer.SubChainConstructor());
    }
  }

  public add(monomer: BaseMonomer) {
    this.nodesChanged = true;
    this.createSubChainIfNeed(monomer);

    if (
      monomer instanceof Peptide ||
      monomer instanceof UnsplitNucleotide ||
      monomer instanceof UnresolvedMonomer
    ) {
      this.lastSubChain.add(new MonomerSequenceNode(monomer));
      return;
    }

    if (monomer instanceof AmbiguousMonomer) {
      // If this ambiguous monomer can be part of a linker group (CHEM, Sugar, Phosphate, or Base class
      // connected to other linker-valid monomers), add it as a LinkerSequenceNode
      if (LinkerSequenceNode.isPartOfLinker(monomer)) {
        this.lastSubChain.add(new LinkerSequenceNode(monomer));
      } else {
        this.lastSubChain.add(new AmbiguousMonomerSequenceNode(monomer));
      }
      return;
    }

    if (monomer instanceof Sugar) {
      if (isValidNucleoside(monomer, this.firstMonomer)) {
        this.lastSubChain.add(Nucleoside.fromSugar(monomer, false));
        return;
      }
      if (isValidNucleotide(monomer, this.firstMonomer)) {
        this.lastSubChain.add(Nucleotide.fromSugar(monomer, false));
        return;
      }
    }

    const nextMonomer = getNextMonomerInChain(monomer);
    const isNextMonomerNucleosideOrNucleotideOrPeptide = () => {
      const isNucleosideOrNucleotide =
        nextMonomer instanceof Sugar &&
        (isValidNucleotide(nextMonomer) || isValidNucleoside(nextMonomer));
      return isNucleosideOrNucleotide || nextMonomer instanceof Peptide;
    };
    if (
      monomer instanceof Phosphate &&
      (!this.lastNode ||
        this.lastNode instanceof Nucleoside ||
        this.lastNode.lastMonomerInNode instanceof UnsplitNucleotide) &&
      (!nextMonomer || isNextMonomerNucleosideOrNucleotideOrPeptide())
    ) {
      this.lastSubChain.add(new MonomerSequenceNode(monomer));
      return;
    }
    this.lastSubChain.add(new LinkerSequenceNode(monomer));
  }

  public addNode(node: SubChainNode) {
    this.createSubChainIfNeed(node.monomer);

    this.lastSubChain.add(node);
    this.nodesChanged = true;
    return this;
  }

  private fillSubChains(monomer?: BaseMonomer) {
    if (!monomer) return;

    this.add(monomer);

    this.fillSubChains(
      getNextMonomerInChain(
        this.lastNode?.lastMonomerInNode,
        this.firstMonomer,
      ),
    );
  }

  public get lastSubChain() {
    return this.subChains[this.subChains.length - 1];
  }

  public get nodes() {
    this.recalculateNodes();
    return this.nodesCache;
  }

  public get lastNode():
    | EmptySequenceNode
    | MonomerSequenceNode
    | Nucleoside
    | Nucleotide
    | LinkerSequenceNode
    | undefined {
    return this.lastSubChain?.lastNode;
  }

  public get lastNonEmptyNode() {
    if (this.lastNode instanceof EmptySequenceNode) {
      const nodes = this.nodes;

      return nodes[nodes.length - 2];
    } else {
      return this.lastNode;
    }
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

  public get isAntisense() {
    return this.nodes.some((node) => node.monomer.monomerItem.isAntisense);
  }

  public forEachNode(
    callback: ({
      node,
      subChain,
    }: {
      node: SubChainNode;
      subChain: BaseSubChain;
      nodeIndex: number;
    }) => void,
  ) {
    let nodeIndex = 0;

    this.subChains.forEach((subChain) => {
      subChain.nodes.forEach((node) => {
        callback({ node, subChain, nodeIndex });
        nodeIndex++;
      });
    });
  }

  public forEachNodeReversed(
    callback: ({
      node,
      subChain,
    }: {
      node: SubChainNode;
      subChain: BaseSubChain;
      nodeIndex: number;
    }) => void,
  ) {
    let nodeIndex = this.length - 1;

    for (let i = this.subChains.length - 1; i >= 0; i--) {
      for (let j = this.subChains[i].nodes.length - 1; j >= 0; j--) {
        callback({
          node: this.subChains[i].nodes[j],
          subChain: this.subChains[i],
          nodeIndex,
        });
        nodeIndex--;
      }
    }
  }

  public static createChainWithEmptyNode() {
    const emptyChain = new Chain();
    const emptySequenceNode = new EmptySequenceNode();
    const emptySubChain = new EmptySubChain();

    emptySubChain.add(emptySequenceNode);
    emptyChain.subChains.push(emptySubChain);

    return { emptyChain, emptySubChain, emptySequenceNode };
  }

  public get isNewSequenceChain() {
    return this.length === 1 && this.firstNode instanceof EmptySequenceNode;
  }

  public get monomers() {
    this.recalculateNodes();
    return this.monomersCache;
  }

  // TODO: Currently the only place where bonds are pushed is in SequenceModeRenderer thus it doesn't provide correct data. Collect all bonds in `fromMonomers` method
  public get bonds() {
    this.recalculateNodes();
    return this.bondsCache;
  }
}
