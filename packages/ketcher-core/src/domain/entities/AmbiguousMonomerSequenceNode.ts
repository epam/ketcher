import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';

export class AmbiguousMonomerSequenceNode {
  constructor(public monomer: AmbiguousMonomer) {}

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
    return this.monomer.isModification;
  }
}
