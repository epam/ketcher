import { EmptySubChain } from 'domain/entities/monomer-chains/EmptySubChain';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { EmptyMonomer } from 'domain/entities/EmptyMonomer';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { SubChainNode } from 'domain/entities/monomer-chains/types';

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
    return [];
  }

  public setRenderer(renderer) {
    this.renderer = renderer;
    this.monomer.setRenderer(renderer);
  }

  public get modified() {
    return false;
  }
}
