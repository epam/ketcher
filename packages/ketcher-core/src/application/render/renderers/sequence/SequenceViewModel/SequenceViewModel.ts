import {
  ChainsCollection,
  ITwoStrandedChainItem,
} from 'domain/entities/monomer-chains/ChainsCollection';
import { EmptySequenceNode } from 'domain/entities';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { SequenceViewModelChain } from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModelChain';

interface IForEachNodeParams {
  twoStrandedNode: ITwoStrandedChainItem;
  nodeIndex: number;
  nodeIndexOverall: number;
  chain: SequenceViewModelChain;
  chainIndex: number;
}
export class SequenceViewModel {
  public chains: SequenceViewModelChain[] = [];
  constructor(private chainsCollection: ChainsCollection) {
    this.fillViewModel();
  }

  public get firstTwoStrandedNode() {
    return this.chains[0]?.firstNode;
  }

  public get lastTwoStrandedNode() {
    const lastChain = this.chains[this.chains.length - 1];

    return lastChain?.lastNode;
  }

  public get length() {
    return this.chains.reduce((acc, chain) => acc + chain.length, 0);
  }

  public get hasOnlyOneNewChain() {
    return this.length === 1 && this.chains[0].isNewSequenceChain;
  }

  private fillViewModel() {
    const NUMBER_OF_SYMBOLS_IN_ROW = 30;
    let hasAntisenseInRow = false;
    const alignedSenseAntisenseChainItems =
      this.chainsCollection.getAlignedSenseAntisenseChains();

    alignedSenseAntisenseChainItems.forEach((twoStrandedChain) => {
      const viewModelChain: SequenceViewModelChain =
        new SequenceViewModelChain();
      const hasAntisenseInChain = twoStrandedChain.some(
        (chainItem) => chainItem.antisenseNode,
      );

      twoStrandedChain.forEach((chainItem, chainItemIndex) => {
        if (chainItemIndex % NUMBER_OF_SYMBOLS_IN_ROW === 0) {
          hasAntisenseInRow = false;
          viewModelChain.addRow({
            sequenceViewModelItems: [],
            hasAntisenseInRow,
          });
        }

        if (chainItem.antisenseNode) {
          hasAntisenseInRow = true;
        }

        viewModelChain.lastRow.hasAntisenseInRow = hasAntisenseInRow;
        viewModelChain.lastRow.sequenceViewModelItems.push({
          senseNode: chainItem.senseNode || new EmptySequenceNode(),
          senseNodeIndex: chainItem.senseNodeIndex,
          antisenseNode: hasAntisenseInChain
            ? chainItem.antisenseNode || new EmptySequenceNode()
            : undefined,
          chain: chainItem.chain,
          antisenseNodeIndex: chainItem.antisenseNodeIndex,
          antisenseChain: chainItem.antisenseChain,
        });
      });

      viewModelChain.lastRow.sequenceViewModelItems.push({
        senseNode: new EmptySequenceNode(),
        senseNodeIndex: -1,
        antisenseNode: hasAntisenseInChain
          ? new EmptySequenceNode()
          : undefined,
        chain: viewModelChain.lastNode?.chain,
      });
      this.chains.push(viewModelChain);
    });

    if (this.chains.length === 0) {
      this.addEmptyChain(0);
    }
  }

  public addEmptyChain(emptyChainIndex: number) {
    const { emptyChain, emptySequenceNode } = Chain.createChainWithEmptyNode();
    const chainWithEmptyNode = new SequenceViewModelChain();
    chainWithEmptyNode.addRow({
      sequenceViewModelItems: [
        {
          senseNode: emptySequenceNode,
          senseNodeIndex: 0,
          chain: emptyChain,
        },
      ],
      hasAntisenseInRow: false,
    });

    this.chains.splice(emptyChainIndex, 0, chainWithEmptyNode);

    return chainWithEmptyNode;
  }

  public forEachNode(callback: (params: IForEachNodeParams) => void) {
    let nodeIndexOverall = 0;

    this.chains.forEach((chain, chainIndex) => {
      chain.forEachNode((twoStrandedNode, nodeIndex) => {
        callback({
          twoStrandedNode,
          nodeIndex,
          nodeIndexOverall,
          chain,
          chainIndex,
        });
        nodeIndexOverall++;
      });
    });
  }

  public getNodeIndex(node: ITwoStrandedChainItem) {
    let nodeIndex = -1;

    this.forEachNode(({ twoStrandedNode, nodeIndexOverall }) => {
      if (twoStrandedNode === node) {
        nodeIndex = nodeIndexOverall;
      }
    });

    return nodeIndex;
  }
}
