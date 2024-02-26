import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { PolymerBond } from 'domain/entities/PolymerBond';

export class BaseSubChain {
  public nodes: Array<SubChainNode> = [];
  public bonds: Array<PolymerBond> = [];

  constructor() {}

  public get lastNode() {
    return this.nodes[this.nodes.length - 1];
  }

  public get firstNode() {
    return this.nodes[0];
  }

  public add(node: SubChainNode) {
    this.nodes.push(node);
  }

  public get length() {
    return this.nodes.length;
  }
}
