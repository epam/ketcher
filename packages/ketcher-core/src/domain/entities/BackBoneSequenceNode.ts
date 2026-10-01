import { EmptySubChain } from 'domain/entities/monomer-chains/EmptySubChain';
import type { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { EmptyMonomer } from 'domain/entities/EmptyMonomer';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { SubChainNode } from 'domain/entities/monomer-chains/types';

export class BackBoneSequenceNode {
  public renderer?: BaseSequenceItemRenderer = undefined;
  public monomer = new EmptyMonomer();
  constructor(
    public firstConnectedNode: SubChainNode,
    public secondConnectedNode: SubChainNode,
  ) {}

  public get SubChainConstructor() {
    return EmptySubChain;
  }

  public get firstMonomerInNode() {
    return this.firstConnectedNode.firstMonomerInNode;
  }

  public get lastMonomerInNode() {
    return this.firstConnectedNode.lastMonomerInNode;
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

  public get monomers(): BaseMonomer[] {
    return [this.monomer];
  }

  public setRenderer(renderer) {
    this.renderer = renderer;
    this.monomer.setRenderer(renderer);
  }

  public get modified() {
    return false;
  }
}
