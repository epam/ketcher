import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import {
  BaseMonomer,
  Chain,
  LinkerSequenceNode,
  Nucleoside,
  Nucleotide,
  RNABase,
  SubChainNode,
} from 'domain/entities';
import { SingleMonomerSnakeLayoutNode } from 'domain/entities/snake-layout-model/SingleMonomerSnakeLayoutNode';
import { SugarWithBaseSnakeLayoutNode } from 'domain/entities/snake-layout-model/SugarWithBaseSnakeLayoutNode';
import { isNumber } from 'lodash';
import { isRnaBaseApplicableForAntisense } from 'domain/helpers/monomers';
import { CoreEditor } from 'application/editor';
import { SettingsManager } from 'utilities';
import {
  ISnakeLayoutModelRow,
  ISnakeLayoutNode,
  ITwoStrandedSnakeLayoutNode,
} from 'domain/entities/snake-layout-model/types';
import { SnakeLayoutModelChain } from 'domain/entities/snake-layout-model/SnakeLayoutModelChain';

export class SnakeLayoutModel {
  private nodes: ITwoStrandedSnakeLayoutNode[] = [];
  public chains: SnakeLayoutModelChain[] = [];
  private monomerToTwoStrandedSnakeLayoutNode: Map<
    BaseMonomer,
    ITwoStrandedSnakeLayoutNode
  > = new Map();

  constructor(chainsCollection: ChainsCollection) {
    this.fillNodes(chainsCollection);
    this.fillChains();
  }

  private addNode(snakeLayoutNode: ISnakeLayoutNode, chain) {
    const twoStrandedSnakeLayoutNode: ITwoStrandedSnakeLayoutNode = {
      senseNode: snakeLayoutNode,
      chain,
    };

    this.nodes.push(twoStrandedSnakeLayoutNode);

    snakeLayoutNode.monomers.forEach((monomer) => {
      this.monomerToTwoStrandedSnakeLayoutNode.set(
        monomer,
        twoStrandedSnakeLayoutNode,
      );
    });
  }

  private getSnakeLayoutNodesFromChainNode(
    node: SubChainNode,
    isAntisense = false,
  ) {
    const nodes: ISnakeLayoutNode[] = [];

    if (node instanceof Nucleotide) {
      if (isAntisense) {
        nodes.push(new SingleMonomerSnakeLayoutNode(node.phosphate));
        nodes.push(new SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
      } else {
        nodes.push(new SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
        nodes.push(new SingleMonomerSnakeLayoutNode(node.phosphate));
      }
    } else if (node instanceof Nucleoside) {
      nodes.push(new SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
    } else if (node instanceof LinkerSequenceNode) {
      if (isAntisense) {
        node.monomers.reverse().forEach((monomer) => {
          nodes.push(new SingleMonomerSnakeLayoutNode(monomer));
        });
      } else {
        node.monomers.forEach((monomer) => {
          nodes.push(new SingleMonomerSnakeLayoutNode(monomer));
        });
      }
    } else {
      nodes.push(new SingleMonomerSnakeLayoutNode(node.monomer));
    }

    return nodes;
  }

  private fillSenseNodes(chainsCollection: ChainsCollection) {
    chainsCollection.chains.forEach((chain) => {
      if (chain.isAntisense) {
        return;
      }

      chain.forEachNode(({ node }) => {
        const snakeLayoutNodes = this.getSnakeLayoutNodesFromChainNode(node);

        snakeLayoutNodes.forEach((snakeLayoutNode) => {
          this.addNode(snakeLayoutNode, chain);
        });
      });
    });
  }

  private fillAntisenseNodes(chainsCollection: ChainsCollection) {
    const handledChainNodes = new Set<SubChainNode>();
    const monomerToChain = chainsCollection.monomerToChain;
    const editor = CoreEditor.provideEditorInstance();

    chainsCollection.chains.forEach((chain) => {
      if (!chain.isAntisense) {
        return;
      }
      let nodesBeforeHydrogenConnectionToBase: ISnakeLayoutNode[] = [];
      let lastTwoStrandedNodeWithHydrogenBond:
        | ITwoStrandedSnakeLayoutNode
        | undefined;

      chain.forEachNodeReversed(({ node }) => {
        if (handledChainNodes.has(node)) {
          return;
        }

        const snakeLayoutNodes = this.getSnakeLayoutNodesFromChainNode(
          node,
          true,
        );

        snakeLayoutNodes.forEach((snakeLayoutNode) => {
          const senseMonomersConnectedByHydrogenBond =
            snakeLayoutNode.monomers.reduce((foundMonomersInNode, monomer) => {
              return [
                ...foundMonomersInNode,
                ...monomer.hydrogenBonds.reduce(
                  (foundMonomersConnectedHydrogenBonds, hydrogenBond) => {
                    const monomerConnectedByHydrogenBond =
                      hydrogenBond.getAnotherMonomer(monomer);

                    return monomerConnectedByHydrogenBond &&
                      ((isRnaBaseApplicableForAntisense(
                        monomerConnectedByHydrogenBond,
                      ) &&
                        isRnaBaseApplicableForAntisense(monomer)) ||
                        editor.drawingEntitiesManager.antisenseMonomerToSenseChain.get(
                          monomer,
                        )?.firstMonomer ===
                          monomerToChain.get(monomerConnectedByHydrogenBond)
                            ?.firstMonomer)
                      ? [
                          ...foundMonomersConnectedHydrogenBonds,
                          monomerConnectedByHydrogenBond,
                        ]
                      : foundMonomersConnectedHydrogenBonds;
                  },
                  [] as BaseMonomer[],
                ),
              ];
            }, [] as BaseMonomer[]);
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
            nodesBeforeHydrogenConnectionToBase.push(snakeLayoutNode);
            lastTwoStrandedNodeWithHydrogenBond =
              this.nodes[twoStrandedSnakeLayoutNodeIndex];
            for (
              let i = 0;
              i < nodesBeforeHydrogenConnectionToBase.length;
              i++
            ) {
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

              if (
                currentTwoStrandedSnakeLayoutNode &&
                !currentTwoStrandedSnakeLayoutNode.antisenseNode &&
                isNodeInSameChain
              ) {
                currentTwoStrandedSnakeLayoutNode.antisenseNode =
                  currentNodeBeforeHydrogenConnectionToBase;
              } else {
                if (currentTwoStrandedSnakeLayoutNodeIndex < 0) {
                  this.nodes.unshift({
                    antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                    chain: lastTwoStrandedNodeWithHydrogenBond.chain,
                  });
                } else {
                  this.nodes.splice(
                    currentTwoStrandedSnakeLayoutNodeIndex + 1,
                    0,
                    {
                      antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                      chain: lastTwoStrandedNodeWithHydrogenBond.chain,
                    },
                  );
                }
              }
            }

            nodesBeforeHydrogenConnectionToBase = [];
          } else {
            nodesBeforeHydrogenConnectionToBase.push(snakeLayoutNode);
          }
        });

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
            | ITwoStrandedSnakeLayoutNode
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
          const hasAnotherAntisenseConnection =
            currentTwoStrandedSnakeLayoutNode?.senseNode?.monomers.some(
              (monomer) => {
                return (
                  monomer instanceof RNABase &&
                  monomer.hydrogenBonds.length !== 0
                );
              },
            );

          if (
            currentTwoStrandedSnakeLayoutNode &&
            isNodeInSameChain &&
            !hasAnotherAntisenseConnection
          ) {
            currentTwoStrandedSnakeLayoutNode.antisenseNode =
              currentAntisenseSnakeLayoutNode;
          } else if (
            currentTwoStrandedSnakeLayoutNode &&
            (!isNodeInSameChain || hasAnotherAntisenseConnection)
          ) {
            this.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex, 0, {
              antisenseNode: currentAntisenseSnakeLayoutNode,
              chain: lastTwoStrandedNodeWithHydrogenBond.chain,
            });
          } else {
            this.nodes.push({
              antisenseNode: currentAntisenseSnakeLayoutNode,
              chain: lastTwoStrandedNodeWithHydrogenBond.chain,
            });
          }
        }

        lastTwoStrandedNodeWithHydrogenBond = undefined;
      }
    });
  }

  private fillNodes(chainsCollection: ChainsCollection) {
    this.fillSenseNodes(chainsCollection);
    this.fillAntisenseNodes(chainsCollection);
  }

  public forEachNode(
    callback: (node: ITwoStrandedSnakeLayoutNode, index: number) => void,
  ) {
    this.nodes.forEach(callback);
  }

  public forEachChain(
    callback: (chain: SnakeLayoutModelChain, index: number) => void,
  ) {
    this.chains.forEach(callback);
  }

  private fillChains() {
    const lineLength = SettingsManager.editorLineLength['snake-layout-mode'];
    let currentIndexInSequenceModelChain = 0;
    let currentSequenceModelChain = new SnakeLayoutModelChain();
    let currentSequenceModelRow: ISnakeLayoutModelRow = {
      snakeLayoutModelItems: [],
    };
    let previousSenseNodeChain: Chain;

    this.nodes.forEach((sequenceModelItem) => {
      const currentSenseChain = sequenceModelItem.chain;

      if (previousSenseNodeChain !== currentSenseChain) {
        currentSequenceModelChain = new SnakeLayoutModelChain();
        this.chains.push(currentSequenceModelChain);
        currentIndexInSequenceModelChain = 0;
      }

      if (currentIndexInSequenceModelChain % lineLength === 0) {
        currentSequenceModelRow = {
          snakeLayoutModelItems: [],
        };
        currentSequenceModelChain.addRow(currentSequenceModelRow);
      }

      currentSequenceModelRow.snakeLayoutModelItems.push(sequenceModelItem);

      previousSenseNodeChain = currentSenseChain;
      currentIndexInSequenceModelChain++;
    });
  }
}
