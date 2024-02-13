import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class MonomerSequenceNode {
  constructor(public monomer: BaseMonomer) {}

  public get SubChainConstructor() {
    return this.monomer.SubChainConstructor;
  }
}
