import { EmptySubChain } from 'domain/entities/monomer-chains/EmptySubChain';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { EmptyMonomer } from 'domain/entities/EmptyMonomer';

export class EmptySequenceNode {
  public renderer?: BaseSequenceItemRenderer = undefined;
  public monomer = new EmptyMonomer();
  constructor() {}

  public get SubChainConstructor() {
    return EmptySubChain;
  }

  public get firstMonomerInNode() {
    return this.monomer;
  }

  public get lastMonomerInNode() {
    return this.monomer;
  }

  public get hovered() {
    return false;
  }

  public get selected() {
    return false;
  }

  public get monomerItem() {
    return { props: { MonomerNaturalAnalogCode: null } };
  }

  public get monomers() {
    return [];
  }

  public setRenderer(renderer) {
    this.renderer = renderer;
  }
}
