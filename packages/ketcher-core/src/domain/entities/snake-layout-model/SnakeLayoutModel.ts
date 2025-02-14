import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { isNumber } from 'lodash';
import {
  BaseMonomer,
  LinkerSequenceNode,
  Nucleoside,
  Nucleotide,
  SubChainNode,
} from 'domain/entities';
import { SingleMonomerSnakeLayoutNode } from 'domain/entities/snake-layout-model/SingleMonomerSnakeLayoutNode';
import { SugarWithBaseSnakeLayoutNode } from 'domain/entities/snake-layout-model/SugarWithBaseSnakeLayoutNode';

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
    chainsCollection.chains.forEach((chain) => {
      if (!chain.isAntisense) {
        return;
      }
      let nodesBeforeHydrogenConnectionToBase: SnakeLayoutNode[] = [];
      let lastTwoStrandedNodeWithHydrogenBondIndex: number | undefined;

      chain.forEachNodeReversed(({ node }) => {
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
          const twoStrandedSnakeLayoutNodeIndex = this.nodes.findIndex(
            (node) => {
              return node === twoStrandedSnakeLayoutNode;
            },
          );

          if (firstSenseMonomerConnectedByHydrogenBond) {
            nodesBeforeHydrogenConnectionToBase.push(snakeLayoutNode);
            lastTwoStrandedNodeWithHydrogenBondIndex =
              twoStrandedSnakeLayoutNodeIndex;
            for (
              let i = 0;
              i < nodesBeforeHydrogenConnectionToBase.length;
              i++
            ) {
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
                  this.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex, 0, {
                    antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                  });
                }
              }
            }

            nodesBeforeHydrogenConnectionToBase = [];
          } else {
            nodesBeforeHydrogenConnectionToBase.push(snakeLayoutNode);
          }
        });
      });

      if (
        nodesBeforeHydrogenConnectionToBase.length &&
        isNumber(lastTwoStrandedNodeWithHydrogenBondIndex)
      ) {
        for (let i = 0; i < nodesBeforeHydrogenConnectionToBase.length; i++) {
          const currentTwoStrandedSnakeLayoutNode =
            this.nodes[lastTwoStrandedNodeWithHydrogenBondIndex + 1 + i];
          const currentAntisenseSnakeLayoutNode =
            nodesBeforeHydrogenConnectionToBase[i];

          if (currentTwoStrandedSnakeLayoutNode) {
            currentTwoStrandedSnakeLayoutNode.antisenseNode =
              currentAntisenseSnakeLayoutNode;
          } else {
            this.nodes.push({
              antisenseNode: currentAntisenseSnakeLayoutNode,
            });
          }
        }

        lastTwoStrandedNodeWithHydrogenBondIndex = undefined;
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
