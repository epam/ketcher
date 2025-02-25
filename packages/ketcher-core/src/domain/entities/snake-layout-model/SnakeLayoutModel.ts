import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import {
  BaseMonomer,
  LinkerSequenceNode,
  Nucleoside,
  Nucleotide,
  SubChainNode,
} from 'domain/entities';
import { SingleMonomerSnakeLayoutNode } from 'domain/entities/snake-layout-model/SingleMonomerSnakeLayoutNode';
import { SugarWithBaseSnakeLayoutNode } from 'domain/entities/snake-layout-model/SugarWithBaseSnakeLayoutNode';
import { isNumber } from 'lodash';

export interface SnakeLayoutNode {
  monomers: BaseMonomer[];
}

export interface TwoStrandedSnakeLayoutNode {
  senseNode?: SnakeLayoutNode;
  antisenseNode?: SnakeLayoutNode;
}

export class SnakeLayoutModel {
  private nodes: TwoStrandedSnakeLayoutNode[] = [];
  private monomerToTwoStrandedSnakeLayoutNode: Map<
    BaseMonomer,
    TwoStrandedSnakeLayoutNode
  > = new Map();

  constructor(chainsCollection: ChainsCollection) {
    this.fillNodes(chainsCollection);
  }

  private addNode(snakeLayoutNode: SnakeLayoutNode) {
    const twoStrandedSnakeLayoutNode = { senseNode: snakeLayoutNode };

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
    const nodes: SnakeLayoutNode[] = [];

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
          this.addNode(snakeLayoutNode);
        });
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
      let nodesBeforeHydrogenConnectionToBase: SnakeLayoutNode[] = [];
      let lastTwoStrandedNodeWithHydrogenBond:
        | TwoStrandedSnakeLayoutNode
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

              if (
                currentTwoStrandedSnakeLayoutNode &&
                !currentTwoStrandedSnakeLayoutNode.antisenseNode
              ) {
                currentTwoStrandedSnakeLayoutNode.antisenseNode =
                  currentNodeBeforeHydrogenConnectionToBase;
              } else {
                if (currentTwoStrandedSnakeLayoutNodeIndex < 0) {
                  this.nodes.unshift({
                    antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                  });
                } else {
                  this.nodes.splice(
                    currentTwoStrandedSnakeLayoutNodeIndex + 1,
                    0,
                    {
                      antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
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
            | TwoStrandedSnakeLayoutNode
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
          } else if (currentTwoStrandedSnakeLayoutNode && !isNodeInSameChain) {
            this.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex, 0, {
              antisenseNode: currentAntisenseSnakeLayoutNode,
            });
          } else {
            this.nodes.push({
              antisenseNode: currentAntisenseSnakeLayoutNode,
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
    callback: (node: TwoStrandedSnakeLayoutNode, index: number) => void,
  ) {
    this.nodes.forEach(callback);
  }
}
