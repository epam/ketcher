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
import { CoreEditor, provideEditorSettings } from 'application/editor';
import { SettingsManager } from 'utilities';
import {
  ISnakeLayoutModelRow,
  ISnakeLayoutMonomersNode,
  isTwoStrandedSnakeLayoutNode,
  ITwoStrandedSnakeLayoutNode,
} from 'domain/entities/snake-layout-model/types';
import { SnakeLayoutModelChain } from 'domain/entities/snake-layout-model/SnakeLayoutModelChain';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { EmptySnakeLayoutNode } from 'domain/entities/snake-layout-model/EmptySnakeLayoutNode';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { MoleculeSnakeLayoutNode } from 'domain/entities/snake-layout-model/MoleculeSnakeLayoutNode';

export class SnakeLayoutModel {
  private readonly nodes: ITwoStrandedSnakeLayoutNode[] = [];
  public chains: SnakeLayoutModelChain[] = [];
  private readonly monomerToTwoStrandedSnakeLayoutNode: Map<
    BaseMonomer,
    ITwoStrandedSnakeLayoutNode
  > = new Map();

  constructor(
    chainsCollection: ChainsCollection,
    drawingEntitiesManager: DrawingEntitiesManager,
    needFillMolecules = true,
  ) {
    this.fillNodes(chainsCollection);
    this.fillChains();
    if (needFillMolecules) {
      this.fillMolecules(drawingEntitiesManager);
    }
  }

  private addNode(snakeLayoutNode: ISnakeLayoutMonomersNode, chain) {
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
    const nodes: ISnakeLayoutMonomersNode[] = [];

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
      let nodesBeforeHydrogenConnectionToBase: ISnakeLayoutMonomersNode[] = [];
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
              } else if (currentTwoStrandedSnakeLayoutNodeIndex < 0) {
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

  private fillMolecules(drawingEntitiesManager: DrawingEntitiesManager) {
    const lineLength = SettingsManager.editorLineLength['snake-layout-mode'];
    const handledMolecules = new Set<BaseMonomer>();

    this.chains.forEach((chain, chainIndex) => {
      const newChain = new SnakeLayoutModelChain();

      chain.forEachRow((row, rowIndex) => {
        newChain.addRow(row);

        // Collect all molecules in the row
        const nodeIndexToMolecules: Map<number, (Atom | Bond)[][]> = new Map();
        const isLastRowOfLastChain =
          chainIndex === this.chains.length - 1 &&
          rowIndex === chain.rowsLength - 1;

        row.snakeLayoutModelItems.forEach((node, nodeIndex) => {
          if (!isTwoStrandedSnakeLayoutNode(node)) {
            return;
          }

          const monomers = [
            ...(node.senseNode?.monomers ?? []),
            ...(node.antisenseNode?.monomers ?? []),
          ];

          monomers.forEach((monomer) => {
            monomer.monomerToAtomBonds.forEach((monomerToAtomBond) => {
              const molecule = drawingEntitiesManager.getConnectedMolecule(
                monomerToAtomBond.atom,
                [Atom],
              );

              if (!handledMolecules.has(monomerToAtomBond.atom.monomer)) {
                handledMolecules.add(monomerToAtomBond.atom.monomer);
              }

              if (!nodeIndexToMolecules.has(nodeIndex)) {
                nodeIndexToMolecules.set(nodeIndex, []);
              }

              nodeIndexToMolecules.get(nodeIndex)?.push(molecule);
            });
          });
        });

        if (isLastRowOfLastChain) {
          // Add all unhandled molecules in end of the last row of the last chain
          drawingEntitiesManager.atoms.forEach((atom) => {
            if (handledMolecules.has(atom.monomer)) {
              return;
            }

            const molecule = drawingEntitiesManager.getConnectedMolecule(atom, [
              Atom,
            ]);

            handledMolecules.add(atom.monomer);

            if (!nodeIndexToMolecules.has(row.snakeLayoutModelItems.length)) {
              nodeIndexToMolecules.set(row.snakeLayoutModelItems.length, []);
            }

            nodeIndexToMolecules
              .get(row.snakeLayoutModelItems.length)
              ?.push(molecule);
          });
        }

        // Place collected molecules in additional rows below the current one
        const editorSettings = provideEditorSettings();
        const cellSizeInAngstroms =
          SnakeLayoutCellWidth / editorSettings.macroModeScale;
        let currentRowToHandle: ISnakeLayoutModelRow = {
          snakeLayoutModelItems: [],
        };

        let nextCellIndexToFill = 0;
        let emptyRowsToAdd = 0;

        nodeIndexToMolecules.forEach((molecules) => {
          molecules.forEach((molecule) => {
            const moleculeBbox =
              DrawingEntitiesManager.getStructureBbox(molecule);
            const cellsNeededHorizontally = Math.ceil(
              (moleculeBbox.width + cellSizeInAngstroms / 2) /
                cellSizeInAngstroms,
            );
            const cellsNeededVertically = Math.ceil(
              (moleculeBbox.height + cellSizeInAngstroms / 2) /
                cellSizeInAngstroms,
            );
            const isThereEnoughSpaceInCurrentRow =
              nextCellIndexToFill + cellsNeededHorizontally <= lineLength;
            const freeCellsInCurrentRow = lineLength - nextCellIndexToFill;

            if (!isThereEnoughSpaceInCurrentRow) {
              // Fill the rest of the row with empty nodes
              for (let i = 0; i < freeCellsInCurrentRow; i++) {
                currentRowToHandle.snakeLayoutModelItems.push(
                  new EmptySnakeLayoutNode(),
                );
              }

              // Add the current row to the chain and start a new one
              newChain.addRow(currentRowToHandle);
              currentRowToHandle = { snakeLayoutModelItems: [] };
              nextCellIndexToFill = 0;

              // Add empty rows if needed (for high molecules)
              for (let i = 0; i < emptyRowsToAdd; i++) {
                newChain.addRow({
                  snakeLayoutModelItems: row.snakeLayoutModelItems.map(
                    (_) => new EmptySnakeLayoutNode(),
                  ),
                });
              }
              emptyRowsToAdd = 0;
            }

            // Add the molecule node
            currentRowToHandle.snakeLayoutModelItems.push(
              new MoleculeSnakeLayoutNode(molecule),
            );

            // Fill the rest of cells needed for the molecule with empty nodes
            for (let i = 1; i < cellsNeededHorizontally; i++) {
              currentRowToHandle.snakeLayoutModelItems.push(
                new EmptySnakeLayoutNode(),
              );
            }

            nextCellIndexToFill += cellsNeededHorizontally;
            emptyRowsToAdd = Math.max(
              emptyRowsToAdd,
              cellsNeededVertically - 1,
            );
          });
        });

        // Fill the rest of the last row with empty nodes
        if (currentRowToHandle.snakeLayoutModelItems.length) {
          for (
            let i = currentRowToHandle.snakeLayoutModelItems.length;
            i < lineLength;
            i++
          ) {
            currentRowToHandle.snakeLayoutModelItems.push(
              new EmptySnakeLayoutNode(),
            );
          }
          newChain.addRow(currentRowToHandle);
        }

        // Add empty rows if needed (for high molecules)
        if (emptyRowsToAdd > 0) {
          for (let i = 0; i < emptyRowsToAdd; i++) {
            newChain.addRow({
              snakeLayoutModelItems: row.snakeLayoutModelItems.map(
                (_) => new EmptySnakeLayoutNode(),
              ),
            });
          }
        }
      });

      this.chains.splice(chainIndex, 1, newChain);
    });
  }
}
