export class EmptySequenceNode {
  constructor() {}

  public get SubChainConstructor() {
    return undefined;
  }

  public get firstMonomerInNode() {
    return undefined;
  }

  public get lastMonomerInNode() {
    return undefined;
  }

  public get monomer() {
    return this;
  }

  public get monomers() {
    return [];
  }

  public setRenderer(renderer) {
    this.renderer = renderer;
  }
}
