import {
  ChainsCollection,
  ITwoStrandedChainItem,
} from 'domain/entities/monomer-chains/ChainsCollection';
import {
  EmptySequenceNode,
  BaseMonomer,
  SubChainNode,
  BackBoneSequenceNode,
} from 'domain/entities';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import {
  ISequenceViewModelRow,
  SequenceViewModelChain,
} from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModelChain';
import { isNumber } from 'lodash';
import {
  getNextConnectedNode,
  getPreviousConnectedNode,
} from 'domain/helpers/chains';

interface IForEachNodeParams {
  twoStrandedNode: ITwoStrandedChainItem;
  nodeIndex: number;
  nodeIndexOverall: number;
  chain: SequenceViewModelChain;
  chainIndex: number;
}

export class SequenceViewModel {
  private nodes: ITwoStrandedChainItem[] = [];
  public chains: SequenceViewModelChain[] = [];
  private monomerToTwoStrandedSnakeLayoutNode: Map<
    BaseMonomer,
    ITwoStrandedChainItem
  > = new Map();

  private chainToHasAntisense: Map<Chain, boolean> = new Map();

  constructor(chainsCollection: ChainsCollection) {
    this.fillNodes(chainsCollection);
    this.fillChains();
    this.postProcessNodes(chainsCollection);

    if (this.chains.length === 0) {
      this.addEmptyChain(0);
    }
  }

  private addNode(
    senseNode: SubChainNode,
    senseNodeIndex: number,
    chain: Chain,
  ) {
    const twoStrandedNode: ITwoStrandedChainItem = {
      senseNode,
      senseNodeIndex,
      chain,
    };

    this.nodes.push(twoStrandedNode);

    senseNode.monomers.forEach((monomer) => {
      this.monomerToTwoStrandedSnakeLayoutNode.set(monomer, twoStrandedNode);
    });
  }

  private fillSenseNodes(chainsCollection: ChainsCollection) {
    chainsCollection.chains.forEach((chain) => {
      if (chain.isAntisense) {
        return;
      }

      chain.forEachNode(({ node, nodeIndex }) => {
        this.addNode(node, nodeIndex, chain);
      });
    });
  }

  private fillAntisenseNodes(chainsCollection: ChainsCollection) {
    const handledChainNodes = new Set<SubChainNode>();
    const monomerToChain = chainsCollection.monomerToChain;

    chainsCollection.chains.forEach((chain) => {
      if (!chain.isAntisense) {
        return;
      }
      let nodesBeforeHydrogenConnectionToBase: SubChainNode[] = [];
      let lastTwoStrandedNodeWithHydrogenBond:
        | ITwoStrandedChainItem
        | undefined;
      let lastSenseChain: Chain = this.nodes[this.nodes.length - 1].chain;
      let lastSenseNodeIndex: number = this.nodes.length - 1;

      chain.forEachNodeReversed(({ node }) => {
        if (handledChainNodes.has(node)) {
          return;
        }

        const senseMonomersConnectedByHydrogenBond = node.monomers.reduce(
          (foundMonomersInNode, monomer) => {
            return [
              ...foundMonomersInNode,
              ...monomer.hydrogenBonds.reduce(
                (foundMonomersConnectedHydrogenBonds, hydrogenBond) => {
                  const monomerConnectedByHydrogenBond =
                    hydrogenBond.getAnotherMonomer(monomer);
                  return monomerConnectedByHydrogenBond
                    ? [
                        ...foundMonomersConnectedHydrogenBonds,
                        monomerConnectedByHydrogenBond,
                      ]
                    : foundMonomersConnectedHydrogenBonds;
                },
                [] as BaseMonomer[],
              ),
            ];
          },
          [] as BaseMonomer[],
        );
        const firstSenseMonomerConnectedByHydrogenBond =
          senseMonomersConnectedByHydrogenBond[0];
        const twoStrandedSnakeLayoutNode =
          firstSenseMonomerConnectedByHydrogenBond
            ? this.monomerToTwoStrandedSnakeLayoutNode.get(
                firstSenseMonomerConnectedByHydrogenBond,
              )
            : undefined;
        let twoStrandedSnakeLayoutNodeIndex = this.nodes.findIndex((node) => {
          return node === twoStrandedSnakeLayoutNode;
        });
        const lastTwoStrandedNodeWithHydrogenBondIndex = this.nodes.findIndex(
          (node) => {
            return node === lastTwoStrandedNodeWithHydrogenBond;
          },
        );

        if (
          firstSenseMonomerConnectedByHydrogenBond &&
          (!isNumber(lastTwoStrandedNodeWithHydrogenBondIndex) ||
            twoStrandedSnakeLayoutNodeIndex >
              lastTwoStrandedNodeWithHydrogenBondIndex)
        ) {
          nodesBeforeHydrogenConnectionToBase.push(node);
          lastTwoStrandedNodeWithHydrogenBond =
            this.nodes[twoStrandedSnakeLayoutNodeIndex];
          for (let i = 0; i < nodesBeforeHydrogenConnectionToBase.length; i++) {
            // need to get rid of this findIndex to reduce complexity
            twoStrandedSnakeLayoutNodeIndex = this.nodes.findIndex((node) => {
              return node === twoStrandedSnakeLayoutNode;
            });

            const currentTwoStrandedSnakeLayoutNodeIndex =
              twoStrandedSnakeLayoutNodeIndex - i;
            const currentTwoStrandedSnakeLayoutNode =
              this.nodes[currentTwoStrandedSnakeLayoutNodeIndex];
            const currentNodeBeforeHydrogenConnectionToBase =
              nodesBeforeHydrogenConnectionToBase[
                nodesBeforeHydrogenConnectionToBase.length - 1 - i
              ];

            lastSenseNodeIndex =
              currentTwoStrandedSnakeLayoutNodeIndex > 0
                ? currentTwoStrandedSnakeLayoutNodeIndex
                : lastTwoStrandedNodeWithHydrogenBondIndex;
            lastSenseChain =
              currentTwoStrandedSnakeLayoutNode?.chain || lastSenseChain;

            if (
              currentTwoStrandedSnakeLayoutNode &&
              !currentTwoStrandedSnakeLayoutNode.antisenseNode
            ) {
              currentTwoStrandedSnakeLayoutNode.antisenseNode =
                currentNodeBeforeHydrogenConnectionToBase;
              currentTwoStrandedSnakeLayoutNode.antisenseChain = chain;
            } else {
              if (currentTwoStrandedSnakeLayoutNodeIndex < 0) {
                this.nodes.unshift({
                  antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                  antisenseChain: chain,
                  senseNodeIndex: lastSenseNodeIndex,
                  chain: lastSenseChain,
                });
              } else {
                this.nodes.splice(
                  currentTwoStrandedSnakeLayoutNodeIndex + 1,
                  0,
                  {
                    antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                    antisenseChain: chain,
                    senseNodeIndex: lastSenseNodeIndex,
                    chain: lastSenseChain,
                  },
                );
              }
            }
          }

          nodesBeforeHydrogenConnectionToBase = [];
        } else {
          nodesBeforeHydrogenConnectionToBase.push(node);
        }

        handledChainNodes.add(node);
      });

      if (
        nodesBeforeHydrogenConnectionToBase.length &&
        lastTwoStrandedNodeWithHydrogenBond
      ) {
        for (let i = 0; i < nodesBeforeHydrogenConnectionToBase.length; i++) {
          const lastTwoStrandedNodeWithHydrogenBondIndex = this.nodes.findIndex(
            (node) => {
              return node === lastTwoStrandedNodeWithHydrogenBond;
            },
          );
          const currentTwoStrandedSnakeLayoutNodeIndex =
            lastTwoStrandedNodeWithHydrogenBondIndex + 1 + i;
          const currentTwoStrandedSnakeLayoutNode:
            | ITwoStrandedChainItem
            | undefined = this.nodes[currentTwoStrandedSnakeLayoutNodeIndex];
          const currentAntisenseSnakeLayoutNode =
            nodesBeforeHydrogenConnectionToBase[i];
          const firstMonomerInLastTwoStrandedNodeWithHydrogenBond =
            lastTwoStrandedNodeWithHydrogenBond?.senseNode?.monomers[0];
          const firstMonomerInCurrentTwoStrandedSnakeLayoutNode =
            currentTwoStrandedSnakeLayoutNode?.senseNode?.monomers[0];
          const isNodeInSameChain =
            firstMonomerInLastTwoStrandedNodeWithHydrogenBond &&
            firstMonomerInCurrentTwoStrandedSnakeLayoutNode &&
            monomerToChain.get(
              firstMonomerInLastTwoStrandedNodeWithHydrogenBond,
            ) ===
              monomerToChain.get(
                firstMonomerInCurrentTwoStrandedSnakeLayoutNode,
              );

          if (currentTwoStrandedSnakeLayoutNode && isNodeInSameChain) {
            currentTwoStrandedSnakeLayoutNode.antisenseNode =
              currentAntisenseSnakeLayoutNode;
            currentTwoStrandedSnakeLayoutNode.antisenseChain = chain;
          } else if (currentTwoStrandedSnakeLayoutNode && !isNodeInSameChain) {
            this.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex, 0, {
              antisenseNode: currentAntisenseSnakeLayoutNode,
              antisenseChain: chain,
              senseNodeIndex: lastSenseNodeIndex,
              chain: lastSenseChain,
            });
          } else {
            this.nodes.push({
              antisenseNode: currentAntisenseSnakeLayoutNode,
              antisenseChain: chain,
              senseNodeIndex: lastSenseNodeIndex,
              chain: lastSenseChain,
            });
          }
        }

        lastTwoStrandedNodeWithHydrogenBond = undefined;
      }
    });
  }

  private postProcessNodes(chainsCollection: ChainsCollection) {
    // Fill BackBone and Empty nodes
    // Set antisenseNodeIndex
    const monomerToNode = chainsCollection.monomerToNode;
    let lastHandledSenseNode: SubChainNode | undefined;
    let lastHandledAntisenseNode: SubChainNode | undefined;
    let antisenseNodeIndex = 0;
    let lastHandledAntisenseChain: Chain | undefined;

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const senseNode = node.senseNode;
      const antisenseNode = node.antisenseNode;

      if (!senseNode) {
        const previousConnectedSenseNode = lastHandledSenseNode
          ? getPreviousConnectedNode(lastHandledSenseNode, monomerToNode)
          : undefined;

        if (!lastHandledSenseNode || !previousConnectedSenseNode) {
          node.senseNode = new EmptySequenceNode();
        } else {
          node.senseNode = new BackBoneSequenceNode(
            previousConnectedSenseNode,
            lastHandledSenseNode,
          );
        }
      }

      if (!antisenseNode && this.chainToHasAntisense.get(node.chain)) {
        const nextConnectedAntisenseNode = lastHandledAntisenseNode
          ? getNextConnectedNode(lastHandledAntisenseNode, monomerToNode)
          : undefined;

        if (!lastHandledAntisenseNode || !nextConnectedAntisenseNode) {
          node.antisenseNode = new EmptySequenceNode();
        } else {
          node.antisenseNode = new BackBoneSequenceNode(
            nextConnectedAntisenseNode,
            lastHandledAntisenseNode,
          );
        }
      } else {
        if (
          !lastHandledAntisenseChain ||
          (node.antisenseChain &&
            node.antisenseChain !== lastHandledAntisenseChain)
        ) {
          antisenseNodeIndex = 0;
        }

        node.antisenseNodeIndex = antisenseNodeIndex;
        antisenseNodeIndex++;
      }

      lastHandledSenseNode = (senseNode ||
        lastHandledSenseNode) as SubChainNode;
      lastHandledAntisenseNode = (antisenseNode ||
        lastHandledAntisenseNode) as SubChainNode;
      lastHandledAntisenseChain =
        node.antisenseChain || lastHandledAntisenseChain;
    }
  }

  private fillAdditionalSpacesInAntisense() {
    let index = 0;
    let previousTwoStrandedNode: ITwoStrandedChainItem | undefined;

    this.nodes.forEach((node) => {
      if (
        previousTwoStrandedNode &&
        previousTwoStrandedNode.antisenseNode &&
        node.antisenseNode &&
        previousTwoStrandedNode.chain === node.chain &&
        previousTwoStrandedNode.antisenseChain !== node.antisenseChain
      ) {
        this.nodes.splice(index, 0, {
          senseNode: new BackBoneSequenceNode(
            previousTwoStrandedNode.senseNode as SubChainNode,
            node.senseNode as SubChainNode,
          ),
          senseNodeIndex: previousTwoStrandedNode.senseNodeIndex,
          antisenseNode: new EmptySequenceNode(),
          chain: node.chain,
        });
        index++;
      }

      previousTwoStrandedNode = node;
      index++;
    });
  }

  private fillNodes(chainsCollection: ChainsCollection) {
    this.fillSenseNodes(chainsCollection);
    this.fillAntisenseNodes(chainsCollection);
    this.fillAdditionalSpacesInAntisense();
  }

  private fillChains() {
    const NUMBER_OF_SYMBOLS_IN_ROW = 30;
    let currentIndexInSequenceModelChain = 0;
    let currentSequenceModelChain = new SequenceViewModelChain();
    let currentSequenceModelRow: ISequenceViewModelRow = {
      sequenceViewModelItems: [],
    };
    let previousSenseNodeChain: Chain;

    this.nodes.forEach((sequenceModelItem) => {
      const currentSenseChain = sequenceModelItem.chain;

      if (previousSenseNodeChain !== currentSenseChain) {
        currentSequenceModelChain = new SequenceViewModelChain();
        this.chains.push(currentSequenceModelChain);
        currentIndexInSequenceModelChain = 0;
      }

      if (currentIndexInSequenceModelChain % NUMBER_OF_SYMBOLS_IN_ROW === 0) {
        currentSequenceModelRow = {
          sequenceViewModelItems: [],
        };
        currentSequenceModelChain.addRow(currentSequenceModelRow);
      }

      currentSequenceModelRow.sequenceViewModelItems.push(sequenceModelItem);

      previousSenseNodeChain = currentSenseChain;
      currentIndexInSequenceModelChain++;
    });

    this.chains.forEach((sequenceViewModelChain) => {
      const hasAntisense = sequenceViewModelChain.hasAntisense;

      if (hasAntisense) {
        this.chainToHasAntisense.set(
          sequenceViewModelChain.lastNode.chain,
          true,
        );
      }

      const lastNode = sequenceViewModelChain.lastNode;
      const length = sequenceViewModelChain.length;
      let rowToAddEmptyNode: ISequenceViewModelRow =
        sequenceViewModelChain.lastRow;

      if (rowToAddEmptyNode.sequenceViewModelItems.length === 30) {
        rowToAddEmptyNode = {
          sequenceViewModelItems: [],
        };
        sequenceViewModelChain.addRow(rowToAddEmptyNode);
      }

      rowToAddEmptyNode.sequenceViewModelItems.push({
        senseNode: new EmptySequenceNode(),
        antisenseNode: sequenceViewModelChain.hasAntisense
          ? new EmptySequenceNode()
          : undefined,
        senseNodeIndex: length,
        chain: lastNode?.chain,
      });
    });
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
