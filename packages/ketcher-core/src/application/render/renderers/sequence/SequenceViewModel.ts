import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { EmptySequenceNode, SubChainNode } from 'domain/entities';
import { Chain } from 'domain/entities/monomer-chains/Chain';

interface ISequenceViewModelRow {
  sequenceViewModelItems: ISequenceViewModelItem[];
  hasAntisenseInRow: boolean;
}

interface ISequenceViewModelChain {
  rows: ISequenceViewModelRow[];
}

export class SequenceViewModel {
  public chains: ISequenceViewModelChain[] = [];
  constructor(private chainsCollection: ChainsCollection) {
    this.fillViewModel();
  }

  private fillViewModel() {
    const NUMBER_OF_SYMBOLS_IN_ROW = 30;
    const handledNodes = new Set<SubChainNode>();
    let hasAntisenseInRow = false;

    this.chainsCollection.chains.forEach((chain) => {
      const { antisenseChainsStartIndexes, antisenseChainsStartIndexesMap } =
        this.chainsCollection.getAntisenseChainsWithData(chain);
      const antisenseNodesToIndexesMap = new Map<
        number,
        { node: SubChainNode; chain: Chain; nodeIndex: number }
      >();

      antisenseChainsStartIndexesMap.forEach(
        (chainWithData, firstNodeIndex) => {
          chainWithData.complimentaryChain.nodes.forEach((node, index) => {
            antisenseNodesToIndexesMap.set(firstNodeIndex + index, {
              node,
              chain: chainWithData.complimentaryChain,
              nodeIndex: index,
            });
          });
        },
      );

      const sequenceViewModelChain: ISequenceViewModelChain = { rows: [] };

      for (
        let nodeIndex = Math.min(0, ...antisenseChainsStartIndexes);
        nodeIndex < chain.length;
        nodeIndex++
      ) {
        const antisenseNodeWithData = antisenseNodesToIndexesMap.get(nodeIndex);
        const node: SubChainNode | undefined = chain.nodes[nodeIndex];
        const isNewRow = nodeIndex % NUMBER_OF_SYMBOLS_IN_ROW === 0;

        if (node && handledNodes.has(node)) {
          continue;
        }

        if (isNewRow) {
          hasAntisenseInRow = false;
        }

        let antisenseNode: SubChainNode | undefined;

        if (antisenseNodeWithData) {
          antisenseNode = antisenseNodeWithData.node;
          handledNodes.add(antisenseNodeWithData.node);
          hasAntisenseInRow = true;
        }

        const sequenceViewModelItem: ISequenceViewModelItem = {
          node,
          antisenseNode,
        };

        if (isNewRow) {
          sequenceViewModelChain.rows.push({
            hasAntisenseInRow,
            sequenceViewModelItems: [sequenceViewModelItem],
          });
        } else {
          const currentRow =
            sequenceViewModelChain[sequenceViewModelChain.rows.length - 1];

          currentRow.sequenceViewModelItems.push(sequenceViewModelItem);
          currentRow.hasAntisenseInRow = hasAntisenseInRow;
        }

        handledNodes.add(node);
      }

      const lastRow =
        sequenceViewModelChain.rows[sequenceViewModelChain.rows.length - 1];

      lastRow.sequenceViewModelItems.push({
        node: new EmptySequenceNode(),
        antisenseNode: new EmptySequenceNode(),
      });

      this.chains.push(sequenceViewModelChain);
    });
  }
}
