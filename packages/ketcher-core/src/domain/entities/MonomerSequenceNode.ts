import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class MonomerSequenceNode {
  private readonly monomersCache: BaseMonomer[] = [];
  constructor(public readonly monomer: BaseMonomer) {
    this.monomersCache = [monomer];
  }

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
    return this.monomersCache;
  }

  public get renderer() {
    return this.monomer.renderer;
  }

  public get modified() {
    return this.monomer.isModification;
  }
}
