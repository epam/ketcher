import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class MonomerSequenceNode {
  constructor(public monomer: BaseMonomer) {}

  public get SubChainConstructor() {
    return this.monomer.SubChainConstructor;
  }

  public get firstMonomerInNode() {
    return this.monomer;
  }

  public get lastMonomerInNode() {
    return this.monomer;
  }

  public get monomers() {
    return [this.monomer];
  }

  public get renderer() {
    return this.monomer.renderer;
  }

  public get modified() {
    return false;
  }
}
