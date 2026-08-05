import { provideEditorInstance } from 'application/editor/editorSingleton';
import type {
  ChainsCollection,
  ITwoStrandedChainItem,
} from 'domain/entities/monomer-chains/ChainsCollection';
import {
  type BaseMonomer,
  type SubChainNode,
  EmptySequenceNode,
  BackBoneSequenceNode,
  LinkerSequenceNode,
  RNABase,
} from 'domain/entities';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import {
  type ISequenceViewModelRow,
  SequenceViewModelChain,
} from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModelChain';
import { isNumber } from 'lodash';
import {
  getNextConnectedNode,
  getPreviousConnectedNode,
} from 'domain/helpers/chains';
import {
  getAntisenseTerminalPhosphateCount,
  isAntisenseTerminalPhosphateRun,
  isRnaBaseApplicableForAntisense,
} from 'domain/helpers/monomers';
import { SettingsManager } from 'utilities';

interface IForEachNodeParams {
  twoStrandedNode: ITwoStrandedChainItem;
  nodeIndex: number;
  nodeIndexOverall: number;
  chain: SequenceViewModelChain;
  chainIndex: number;
}

export class SequenceViewModel {
  private readonly nodes: ITwoStrandedChainItem[] = [];
  public chains: SequenceViewModelChain[] = [];
  private readonly monomerToTwoStrandedSnakeLayoutNode: Map<
    BaseMonomer,
    ITwoStrandedChainItem
  > = new Map();

  private readonly chainToHasAntisense: Map<Chain, boolean> = new Map();

  private antisensePhosphateSymbols?: Map<
    ITwoStrandedChainItem,
    { symbol: string; xOffset: number }
  >;

  constructor(public chainsCollection: ChainsCollection) {
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
    const editor = provideEditorInstance();

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

            lastSenseNodeIndex =
              currentTwoStrandedSnakeLayoutNodeIndex > 0
                ? currentTwoStrandedSnakeLayoutNodeIndex
                : lastTwoStrandedNodeWithHydrogenBondIndex;
            lastSenseChain =
              currentTwoStrandedSnakeLayoutNode?.chain || lastSenseChain;

            if (
              currentTwoStrandedSnakeLayoutNode &&
              !currentTwoStrandedSnakeLayoutNode.antisenseNode &&
              isNodeInSameChain
            ) {
              currentTwoStrandedSnakeLayoutNode.antisenseNode =
                currentNodeBeforeHydrogenConnectionToBase;
              currentTwoStrandedSnakeLayoutNode.antisenseChain = chain;
            } else if (currentTwoStrandedSnakeLayoutNodeIndex < 0) {
              this.nodes.unshift({
                antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                antisenseChain: chain,
                senseNodeIndex: lastSenseNodeIndex,
                chain: lastTwoStrandedNodeWithHydrogenBond.chain,
              });
            } else {
              this.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex + 1, 0, {
                antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                antisenseChain: chain,
                senseNodeIndex: lastSenseNodeIndex,
                chain: lastTwoStrandedNodeWithHydrogenBond.chain,
              });
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
            currentTwoStrandedSnakeLayoutNode.antisenseChain = chain;
          } else if (
            currentTwoStrandedSnakeLayoutNode &&
            (!isNodeInSameChain || hasAnotherAntisenseConnection)
          ) {
            this.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex, 0, {
              antisenseNode: currentAntisenseSnakeLayoutNode,
              antisenseChain: chain,
              senseNodeIndex: lastSenseNodeIndex,
              chain: lastTwoStrandedNodeWithHydrogenBond.chain,
            });
          } else {
            this.nodes.push({
              antisenseNode: currentAntisenseSnakeLayoutNode,
              antisenseChain: chain,
              senseNodeIndex: lastSenseNodeIndex,
              chain: lastTwoStrandedNodeWithHydrogenBond.chain,
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
            lastHandledAntisenseNode,
            nextConnectedAntisenseNode,
          );
        }
      } else if (
        !lastHandledAntisenseChain ||
        (node.antisenseChain &&
          node.antisenseChain !== lastHandledAntisenseChain)
      ) {
        antisenseNodeIndex = 0;
        node.antisenseNodeIndex = antisenseNodeIndex;
        antisenseNodeIndex++;
      } else {
        node.antisenseNodeIndex = antisenseNodeIndex;
        antisenseNodeIndex++;
      }

      const isRealSenseNode =
        senseNode &&
        !(senseNode instanceof BackBoneSequenceNode) &&
        !(senseNode instanceof EmptySequenceNode);
      lastHandledSenseNode = (
        isRealSenseNode ? senseNode : lastHandledSenseNode
      ) as SubChainNode;
      lastHandledAntisenseNode = (antisenseNode ||
        lastHandledAntisenseNode) as SubChainNode;
      lastHandledAntisenseChain =
        node.antisenseChain || lastHandledAntisenseChain;
    }
  }

  private fillAdditionalSpacesInAntisense(chainsCollection: ChainsCollection) {
    const monomerToNode = chainsCollection.monomerToNode;
    let previousTwoStrandedNode: ITwoStrandedChainItem | undefined;
    let previousHandledSenseNode: SubChainNode | undefined;

    // Collect the nodes to insert during a read-only pass, then splice them in
    // afterwards. Mutating `this.nodes` while iterating it with `forEach` is
    // unsafe: `forEach` caches the length once, so inserting a node for one
    // chain pair shifts the later nodes past that cached length and they are
    // never visited — which dropped the dash for every chain pair after the
    // first (#6719).
    const nodesToInsert: Array<{ index: number; node: ITwoStrandedChainItem }> =
      [];

    this.nodes.forEach((node, nodeIndex) => {
      if (
        previousTwoStrandedNode?.antisenseNode &&
        node.antisenseNode &&
        previousTwoStrandedNode?.chain === node.chain &&
        previousTwoStrandedNode?.antisenseChain !== node.antisenseChain
      ) {
        const nextConnectedSenseNode = getNextConnectedNode(
          previousHandledSenseNode as SubChainNode,
          monomerToNode,
        );

        if (nextConnectedSenseNode) {
          nodesToInsert.push({
            index: nodeIndex,
            node: {
              senseNode: new BackBoneSequenceNode(
                previousHandledSenseNode as SubChainNode,
                nextConnectedSenseNode,
              ),
              senseNodeIndex: previousTwoStrandedNode.senseNodeIndex,
              antisenseNode: new EmptySequenceNode(),
              chain: node.chain,
            },
          });
        }
      }

      previousTwoStrandedNode = node;
      previousHandledSenseNode =
        (node.senseNode as SubChainNode) || previousHandledSenseNode;
    });

    // Insert from the highest index down so the remaining indices stay valid.
    for (let i = nodesToInsert.length - 1; i >= 0; i--) {
      this.nodes.splice(nodesToInsert[i].index, 0, nodesToInsert[i].node);
    }
  }

  private fillNodes(chainsCollection: ChainsCollection) {
    this.fillSenseNodes(chainsCollection);
    this.fillAntisenseNodes(chainsCollection);
    this.fillAdditionalSpacesInAntisense(chainsCollection);
  }

  private fillChains() {
    const lineLength = SettingsManager.editorLineLength['sequence-layout-mode'];
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

      if (currentIndexInSequenceModelChain % lineLength === 0) {
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

      if (rowToAddEmptyNode.sequenceViewModelItems.length === lineLength) {
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

  /**
   * Sequence-mode display symbol ("p" / "pp") for an antisense cell that shows a
   * terminal phosphate. A terminal antisense phosphate run is spread across its
   * own linker cell plus the neighbouring "gap" cells (BackBone/Empty) that
   * already exist in the layout, so that each phosphate appears in its own
   * column ("p p") instead of being crammed into a single cell ("pp").
   *
   * When there is no neighbouring gap to spread into, the overflowing phosphates
   * are instead shifted outward into the free margin beyond the strand (see
   * getAntisensePhosphateSymbolXOffset), so they never overlap the neighbouring
   * symbol.
   *
   * This only reassigns the displayed symbol / x-offset of cells that already
   * exist - it never adds/removes cells - so caret navigation, editing and flex
   * mode stay exactly as they were.
   *
   * Returns undefined when the cell must keep its default symbol.
   */
  public getAntisensePhosphateSymbol(
    twoStrandedNode: ITwoStrandedChainItem,
  ): string | undefined {
    return this.getAntisensePhosphateSymbols().get(twoStrandedNode)?.symbol;
  }

  /**
   * Horizontal offset (in px) applied to a crammed terminal-phosphate symbol so
   * the extra phosphates stick out into the free margin instead of overlapping
   * the neighbouring symbol. Display-only.
   */
  public getAntisensePhosphateSymbolXOffset(
    twoStrandedNode: ITwoStrandedChainItem,
  ): number {
    return (
      this.getAntisensePhosphateSymbols().get(twoStrandedNode)?.xOffset ?? 0
    );
  }

  private getAntisensePhosphateSymbols(): Map<
    ITwoStrandedChainItem,
    { symbol: string; xOffset: number }
  > {
    if (!this.antisensePhosphateSymbols) {
      this.antisensePhosphateSymbols = this.buildAntisensePhosphateSymbols();
    }

    return this.antisensePhosphateSymbols;
  }

  private buildAntisensePhosphateSymbols(): Map<
    ITwoStrandedChainItem,
    { symbol: string; xOffset: number }
  > {
    // One sequence-mode column is 20px wide (see scaledMonomerPositionForSequence).
    const COLUMN_WIDTH = 20;
    const symbols = new Map<
      ITwoStrandedChainItem,
      { symbol: string; xOffset: number }
    >();
    const items: ITwoStrandedChainItem[] = [];
    this.forEachNode(({ twoStrandedNode }) => items.push(twoStrandedNode));

    const isAntisenseGap = (item?: ITwoStrandedChainItem) =>
      Boolean(
        item &&
          (item.antisenseNode instanceof BackBoneSequenceNode ||
            item.antisenseNode instanceof EmptySequenceNode),
      );

    const isRealAntisenseNode = (item?: ITwoStrandedChainItem) =>
      Boolean(
        item &&
          item.antisenseNode &&
          !(item.antisenseNode instanceof BackBoneSequenceNode) &&
          !(item.antisenseNode instanceof EmptySequenceNode),
      );

    // Collect consecutive antisense gap cells starting next to `index` in the
    // given direction, together with whether the run of gaps is terminated by a
    // real antisense node (i.e. the chain continues on that side = interior).
    const collectGaps = (index: number, direction: -1 | 1) => {
      const chain = items[index].chain;
      const gaps: ITwoStrandedChainItem[] = [];
      let cursor = index + direction;
      while (isAntisenseGap(items[cursor]) && items[cursor].chain === chain) {
        gaps.push(items[cursor]);
        cursor += direction;
      }
      const continuesToRealNode =
        Boolean(items[cursor]) &&
        items[cursor].chain === chain &&
        isRealAntisenseNode(items[cursor]);

      return { gaps, continuesToRealNode };
    };

    // Whether the antisense chain continues (leads to a real antisense node) on
    // the given side of `index` - used to find the interior / exterior side.
    const continuesOnSide = (index: number, direction: -1 | 1) => {
      const neighbour = items[index + direction];
      return (
        Boolean(neighbour) &&
        neighbour.chain === items[index].chain &&
        (isRealAntisenseNode(neighbour) ||
          (isAntisenseGap(neighbour) &&
            collectGaps(index, direction).continuesToRealNode))
      );
    };

    items.forEach((item, index) => {
      const antisenseNode = item.antisenseNode;
      if (
        !(antisenseNode instanceof LinkerSequenceNode) ||
        !isAntisenseTerminalPhosphateRun(antisenseNode.monomers)
      ) {
        return;
      }

      const count = getAntisenseTerminalPhosphateCount(antisenseNode.monomers);
      if (count <= 1) {
        symbols.set(item, { symbol: 'p', xOffset: 0 });
        return;
      }

      // Spread the extra phosphates into the neighbouring gap cells on the
      // interior side (the side where the antisense chain continues).
      const left = collectGaps(index, -1);
      const right = collectGaps(index, 1);
      let interiorGaps: ITwoStrandedChainItem[] = [];
      if (left.continuesToRealNode && left.gaps.length) {
        interiorGaps = left.gaps;
      } else if (right.continuesToRealNode && right.gaps.length) {
        interiorGaps = right.gaps;
      } else {
        interiorGaps = left.gaps.length ? left.gaps : right.gaps;
      }

      const delegated = Math.min(count - 1, interiorGaps.length);
      const anchorPhosphates = count - delegated;

      // Overflow that could not be delegated to a gap cell is shifted outward
      // into the free margin (the exterior side, opposite the chain interior).
      // When the interior is on the right, the exterior/free margin is on the
      // left, so shift the symbol left so the extra phosphates do not overlap
      // the neighbouring symbol.
      let xOffset = 0;
      if (anchorPhosphates > 1) {
        const interiorIsRight = continuesOnSide(index, 1);
        const interiorIsLeft = continuesOnSide(index, -1);
        if (interiorIsRight && !interiorIsLeft) {
          xOffset = -COLUMN_WIDTH * (anchorPhosphates - 1);
        }
      }

      symbols.set(item, { symbol: 'p'.repeat(anchorPhosphates), xOffset });
      for (let k = 0; k < delegated; k++) {
        symbols.set(interiorGaps[k], { symbol: 'p', xOffset: 0 });
      }
    });

    return symbols;
  }
}
