import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { PolymerBond } from '../PolymerBond';

export class BaseSubChain {
  public nodes: Array<SubChainNode> = [];
  public bonds: Array<PolymerBond> = [];

  // TODO this flag is needed to track changes made to bonds in SequenceRenderer
  // Added to minimize impact on existing code
  // See TODO in Chain.ts get bonds() for proper implementation
  public modified = true;

  public get lastNode() {
    return this.nodes[this.nodes.length - 1];
  }

  public get firstNode() {
    return this.nodes[0];
  }

  public add(node: SubChainNode) {
    this.nodes.push(node);
    this.modified = true;
  }

  public addBond(bond: PolymerBond) {
    this.bonds.push(bond);
    this.modified = true;
  }

  public get length() {
    return this.nodes.length;
  }
}
