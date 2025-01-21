import {
  ChainsCollection,
  ITwoStrandedChainItem,
} from 'domain/entities/monomer-chains/ChainsCollection';
import { EmptySequenceNode } from 'domain/entities';

interface ISequenceViewModelRow {
  sequenceViewModelItems: ITwoStrandedChainItem[];
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
    let hasAntisenseInRow = false;

    this.chainsCollection.chains.forEach((chain) => {
      const alignedSenseAntisenseChainItems =
        this.chainsCollection.getAlignedSenseAntisenseChainItems(chain);
      const viewModelChain: ISequenceViewModelChain = { rows: [] };
      alignedSenseAntisenseChainItems.forEach((chainItem, chainItemIndex) => {
        if (chainItemIndex % NUMBER_OF_SYMBOLS_IN_ROW === 0) {
          this.chains.push(viewModelChain);
          hasAntisenseInRow = false;
        }

        if (chainItem.antisenseNode) {
          hasAntisenseInRow = true;
        }

        const lastRow = viewModelChain.rows[viewModelChain.rows.length - 1];

        lastRow.hasAntisenseInRow = hasAntisenseInRow;
        lastRow.sequenceViewModelItems.push({
          node: chainItem.node || new EmptySequenceNode(),
          antisenseNode: chainItem.antisenseNode || new EmptySequenceNode(),
        });
      });

      const lastRow = viewModelChain.rows[viewModelChain.rows.length - 1];

      lastRow.sequenceViewModelItems.push({
        node: new EmptySequenceNode(),
        antisenseNode: new EmptySequenceNode(),
      });
    });
  }
}
