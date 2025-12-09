import {
  ChainsCollection,
  ITwoStrandedChainItem,
} from 'domain/entities/monomer-chains/ChainsCollection';
import { SequenceNodeRendererFactory } from 'application/render/renderers/sequence/SequenceNodeRendererFactory';
import {
  BaseMonomer,
  HydrogenBond,
  MonomerToAtomBond,
  Nucleotide,
  Phosphate,
  Pool,
  Sugar,
  Vec2,
} from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import {
  getNextMonomerInChain,
  getRnaBaseFromSugar,
  getSugarFromRnaBase,
  isRnaBaseOrAmbiguousRnaBase,
} from 'domain/helpers/monomers';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { BackBoneBondSequenceRenderer } from 'application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { IBaseRenderer } from 'application/render/renderers/BaseRenderer';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import {
  SubChainNode,
  SequenceNode,
} from 'domain/entities/monomer-chains/types';
import { CoreEditor } from 'application/editor/internal';
import { RestoreSequenceCaretPositionOperation } from 'application/editor/operations/modes';
import assert from 'assert';
import { Command } from 'domain/entities/Command';
import { NewSequenceButton } from 'application/render/renderers/sequence/ui-controls/NewSequenceButton';
import { isNumber } from 'lodash';
import { MonomerToAtomBondSequenceRenderer } from 'application/render/renderers/sequence/MonomerToAtomBondSequenceRenderer';
import { SequenceViewModel } from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModel';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import { SequenceViewModelChain } from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModelChain';
import { SettingsManager } from 'utilities';

type BaseNodeSelection = {
  nodeIndexOverall: number;
  isNucleosideConnectedAndSelectedWithPhosphate?: boolean;
  hasR1Connection?: boolean;
};

export type NodeSelection = BaseNodeSelection & {
  node: SubChainNode;
  twoStrandedNode?: ITwoStrandedChainItem;
};

export type TwoStrandedNodeSelection = BaseNodeSelection & {
  node: ITwoStrandedChainItem;
};

export type TwoStrandedNodesSelection = TwoStrandedNodeSelection[][];
export type NodesSelection = NodeSelection[][];

export class SequenceRenderer {
  private static caretPositionValue = -1;
  private static lastUserDefinedCaretPositionValue = 0;
  private static chainsCollectionValue: ChainsCollection;
  private static lastChainStartPositionValue: Vec2;
  private static sequenceViewModelValue?: SequenceViewModel;
  private static newSequenceButtons: NewSequenceButton[] = [];

  public static get caretPosition(): number {
    return this.caretPositionValue;
  }

  private static set caretPosition(value: number) {
    this.caretPositionValue = value;
  }

  public static get lastUserDefinedCaretPosition(): number {
    return this.lastUserDefinedCaretPositionValue;
  }

  private static set lastUserDefinedCaretPosition(value: number) {
    this.lastUserDefinedCaretPositionValue = value;
  }

  public static get chainsCollection(): ChainsCollection {
    return this.chainsCollectionValue;
  }

  private static set chainsCollection(value: ChainsCollection) {
    this.chainsCollectionValue = value;
  }

  public static get lastChainStartPosition(): Vec2 {
    return this.lastChainStartPositionValue;
  }

  private static set lastChainStartPosition(value: Vec2) {
    this.lastChainStartPositionValue = value;
  }

  public static get sequenceViewModel(): SequenceViewModel | undefined {
    return this.sequenceViewModelValue;
  }

  private static set sequenceViewModel(value: SequenceViewModel) {
    this.sequenceViewModelValue = value;
  }

  private static get nodesInAllChains() {
    return this.sequenceViewModel?.nodesInAllChains() ?? [];
  }

  public static show(
    chainsCollection: ChainsCollection,
    chainBeforeNewEmptyChainIndex?: number,
  ) {
    this.clear();
    this.chainsCollection = chainsCollection;
    this.sequenceViewModel = new SequenceViewModel(chainsCollection);
    const newEmptyChain = this.addNewEmptyChainIfNeeded(
      chainBeforeNewEmptyChainIndex,
    );
    this.removeNewSequenceButtons();
    this.showNodes(this.sequenceViewModel);
    this.showBonds(this.chainsCollection);
    if (newEmptyChain) {
      this.setCaretToLastNodeInChain(newEmptyChain);
    }
  }

  private static setCaretToLastNodeInChain(chain: SequenceViewModelChain) {
    const emptyChainNodeIndex =
      this.sequenceViewModel?.getOverallIndex(chain.lastNode) ?? -1;

    this.setCaretPosition(emptyChainNodeIndex);
  }

  public static removeNewSequenceButtons() {
    this.newSequenceButtons.forEach((newSequenceButton) =>
      newSequenceButton.remove(),
    );
    this.newSequenceButtons = [];
  }

  private static addNewEmptyChainIfNeeded(chainBeforeNewEmptyChainIndex) {
    if (this.sequenceViewModel?.hasOnlyOneNewChain) {
      return;
    }

    const emptyChainIndex = isNumber(chainBeforeNewEmptyChainIndex)
      ? chainBeforeNewEmptyChainIndex + 1
      : undefined;

    if (isNumber(emptyChainIndex)) {
      const emptyChain = this.sequenceViewModel?.addEmptyChain(emptyChainIndex);

      return emptyChain;
    }

    return undefined;
  }

  private static showNodes(sequenceViewModel: SequenceViewModel) {
    let currentChainStartPosition = new Vec2(41.5, 41.5);
    let currentMonomerIndexInChain = 0;
    let currentMonomerIndexOverall = 0;
    let hasAntisenseInRow = false;
    let previousRowsWithAntisense = 0;
    const isEditInRnaBuilderMode =
      CoreEditor.provideEditorInstance().isSequenceEditInRNABuilderMode;
    const handledNodes = new Set<SequenceNode>();

    for (
      let chainIndex = 0;
      chainIndex < sequenceViewModel.chains.length;
      chainIndex++
    ) {
      const chain = sequenceViewModel.chains[chainIndex];
      currentMonomerIndexInChain = 0;
      for (const { row } of chain.chainRows()) {
        hasAntisenseInRow = false;

        row.sequenceViewModelItems.forEach((chainItem) => {
          const node = chainItem.senseNode;

          if (node && handledNodes.has(node)) {
            return;
          }

          let antisenseNodeRenderer: BaseSequenceItemRenderer | undefined;

          if (
            chainItem.antisenseNode &&
            !handledNodes.has(chainItem.antisenseNode)
          ) {
            antisenseNodeRenderer = SequenceNodeRendererFactory.fromNode(
              chainItem.antisenseNode,
              currentChainStartPosition.add(new Vec2(0, 30)),
              currentMonomerIndexInChain,
              chainItem.antisenseNode === chain.lastNode.senseNode,
              chainItem.antisenseChain ?? chainItem.chain,
              currentMonomerIndexOverall,
              this.caretPosition,
              chainItem,
              chainItem.antisenseNode?.monomer?.renderer,
              previousRowsWithAntisense,
            );

            antisenseNodeRenderer.show();
            chainItem.antisenseNode.monomers?.forEach((monomer) =>
              monomer.setRenderer(
                antisenseNodeRenderer as BaseSequenceItemRenderer,
              ),
            );
            handledNodes.add(chainItem.antisenseNode);

            if (
              chainItem.antisenseNode instanceof EmptySequenceNode ||
              chainItem.antisenseNode instanceof BackBoneSequenceNode
            ) {
              chainItem.antisenseNode.setRenderer(antisenseNodeRenderer);
            }

            if (!hasAntisenseInRow) {
              hasAntisenseInRow = true;
            }
          }

          if (!node) {
            return;
          }

          const renderer = SequenceNodeRendererFactory.fromNode(
            node,
            currentChainStartPosition,
            currentMonomerIndexInChain,
            node === chainItem.chain.lastNode,
            chainItem.chain,
            currentMonomerIndexOverall,
            this.caretPosition,
            chainItem,
            node.monomer.renderer,
            previousRowsWithAntisense,
          );

          renderer.show();
          node.monomers?.forEach((monomer) => monomer.setRenderer(renderer));
          currentMonomerIndexInChain++;
          currentMonomerIndexOverall++;
          handledNodes.add(node);

          if (antisenseNodeRenderer) {
            renderer.setAntisenseNodeRenderer(antisenseNodeRenderer);
          }

          if (
            node instanceof EmptySequenceNode ||
            node instanceof BackBoneSequenceNode
          ) {
            node.setRenderer(renderer);
          }
        });

        if (hasAntisenseInRow) {
          previousRowsWithAntisense++;
        }
      }

      currentChainStartPosition = this.getNextChainPosition(
        currentChainStartPosition,
        chain.length,
      );

      if (!isEditInRnaBuilderMode) {
        this.showNewSequenceButton(
          chainIndex,
          Math.max(
            chain.lastRow.sequenceViewModelItems.length,
            sequenceViewModel.chains[chainIndex + 1]?.firstRow
              ?.sequenceViewModelItems.length ?? 0,
          ),
        );
      }
    }

    if (this.caretPosition > currentMonomerIndexOverall) {
      this.setCaretPosition(currentMonomerIndexOverall);
    }

    this.lastChainStartPosition = currentChainStartPosition;
  }

  public static getNextChainPosition(
    currentChainStartPosition: Vec2 = this.lastChainStartPosition,
    previousChainLength: number = this.lastChainLength,
  ) {
    const lineLength = SettingsManager.editorLineLength['sequence-layout-mode'];
    return new Vec2(
      currentChainStartPosition.x,
      currentChainStartPosition.y +
        80 +
        47 * Math.floor((previousChainLength - 1) / lineLength),
    );
  }

  private static showBonds(chainsCollection: ChainsCollection) {
    const handledMonomersToAttachmentPoints: Map<
      BaseMonomer,
      Set<AttachmentPointName>
    > = new Map();
    const handledHydrogenBonds: Set<HydrogenBond> = new Set();
    const monomerToChain = chainsCollection.monomerToChain;

    chainsCollection.chains.forEach((chain) => {
      chain.subChains.forEach((subChain) => {
        subChain.nodes.forEach((node) => {
          if (node instanceof EmptySequenceNode) {
            return;
          }

          node.monomers.forEach((monomer) => {
            if (!handledMonomersToAttachmentPoints.has(monomer)) {
              handledMonomersToAttachmentPoints.set(monomer, new Set());
            }

            monomer.forEachBond((polymerBond, attachmentPointName) => {
              if (polymerBond instanceof HydrogenBond) {
                const isBondInOneChain =
                  polymerBond.secondMonomer &&
                  monomerToChain.get(polymerBond.firstMonomer) ===
                    monomerToChain.get(polymerBond.secondMonomer);

                if (handledHydrogenBonds.has(polymerBond) || isBondInOneChain) {
                  return;
                }

                const bondRenderer = new PolymerBondSequenceRenderer(
                  polymerBond,
                );

                bondRenderer.show();
                polymerBond.setRenderer(bondRenderer);
                handledHydrogenBonds.add(polymerBond);

                return;
              }

              const handledAttachmentPoints =
                handledMonomersToAttachmentPoints.get(
                  monomer,
                ) as Set<AttachmentPointName>;

              if (polymerBond instanceof MonomerToAtomBond) {
                const bondRenderer = new MonomerToAtomBondSequenceRenderer(
                  polymerBond,
                  node,
                );

                bondRenderer.show();
                polymerBond.setRenderer(bondRenderer);
                handledAttachmentPoints.add(attachmentPointName);

                return;
              }

              if (!subChain.bonds.includes(polymerBond)) {
                subChain.bonds.push(polymerBond);
              }
              if (!polymerBond.isSideChainConnection) {
                polymerBond.setRenderer(
                  new BackBoneBondSequenceRenderer(polymerBond),
                );
                return;
              }

              if (handledAttachmentPoints.has(attachmentPointName)) {
                return;
              }

              const anotherMonomer = polymerBond.getAnotherEntity(
                monomer,
              ) as BaseMonomer;

              // Skip handling side chains for sugar(R3) + base(R1) connections.
              if (
                (monomer instanceof Sugar &&
                  getRnaBaseFromSugar(monomer) === anotherMonomer) ||
                (anotherMonomer instanceof Sugar &&
                  getRnaBaseFromSugar(anotherMonomer) === monomer)
              ) {
                return;
              }

              let bondRenderer;

              // If side connection comes from rna base then take connected sugar and draw side connection from it
              // because for rna we display only one letter instead of three
              const connectedSugarToBase = getSugarFromRnaBase(anotherMonomer);
              if (
                isRnaBaseOrAmbiguousRnaBase(anotherMonomer) &&
                connectedSugarToBase
              ) {
                bondRenderer = new PolymerBondSequenceRenderer(
                  new PolymerBond(monomer, connectedSugarToBase),
                );
              } else {
                bondRenderer = new PolymerBondSequenceRenderer(polymerBond);
              }
              bondRenderer.show();
              polymerBond.setRenderer(bondRenderer);
              handledAttachmentPoints.add(attachmentPointName);

              if (!handledMonomersToAttachmentPoints.get(anotherMonomer)) {
                handledMonomersToAttachmentPoints.set(
                  anotherMonomer,
                  new Set(),
                );
              }
              const anotherMonomerHandledAttachmentPoints =
                handledMonomersToAttachmentPoints.get(
                  anotherMonomer,
                ) as Set<AttachmentPointName>;

              anotherMonomerHandledAttachmentPoints.add(
                anotherMonomer?.getAttachmentPointByBond(
                  polymerBond,
                ) as AttachmentPointName,
              );
            });
          });
        });
      });
      if (chain.isCyclic) {
        const polymerBond = chain.firstMonomer?.attachmentPointsToBonds
          .R1 as PolymerBond;
        const bondRenderer = new PolymerBondSequenceRenderer(
          polymerBond,
          chain.firstNode,
          chain.lastNonEmptyNode,
        );
        bondRenderer.show();
        polymerBond.setRenderer(bondRenderer);
      }
    });
  }

  public static setCaretPosition(caretPosition: number) {
    const editor = CoreEditor.provideEditorInstance();
    const oldActiveTwoStrandedNode = this.currentEdittingNode;

    if (oldActiveTwoStrandedNode) {
      const renderer = oldActiveTwoStrandedNode.senseNode?.renderer;

      assert(renderer instanceof BaseSequenceItemRenderer);

      renderer?.redrawCaret(caretPosition);
      if (renderer.antisenseNodeRenderer) {
        renderer.antisenseNodeRenderer?.redrawCaret(caretPosition);
      }
    }
    this.caretPosition = caretPosition;
    const newActiveTwoStrandedNode = this.currentEdittingNode;
    const renderer = newActiveTwoStrandedNode?.senseNode?.renderer;

    if (!newActiveTwoStrandedNode) {
      return;
    }

    assert(renderer instanceof BaseSequenceItemRenderer);

    if (editor.isSequenceEditMode) {
      renderer?.redrawCaret(caretPosition);
      renderer?.antisenseNodeRenderer?.redrawCaret(caretPosition);
    }

    for (const {
      twoStrandedNode,
    } of this.sequenceViewModel?.nodesInAllChains() ?? []) {
      const senseRenderer = twoStrandedNode.senseNode?.renderer;
      const antisenseRenderer = twoStrandedNode.antisenseNode?.renderer;

      if (senseRenderer instanceof BaseSequenceItemRenderer) {
        senseRenderer.redrawCounter(caretPosition);
      }

      if (antisenseRenderer instanceof BaseSequenceItemRenderer) {
        antisenseRenderer.redrawCounter(caretPosition);
      }
    }
  }

  public static rerenderCaret() {
    this.setCaretPosition(this.caretPosition);
  }

  public static setCaretPositionBySequenceItemRenderer(
    sequenceItemRenderer: IBaseRenderer,
  ) {
    let newCaretPosition = -1;

    for (const {
      twoStrandedNode,
      nodeIndexOverall,
    } of this.sequenceViewModel?.nodesInAllChains() ?? []) {
      if (
        twoStrandedNode.senseNode?.renderer === sequenceItemRenderer ||
        twoStrandedNode.antisenseNode?.renderer === sequenceItemRenderer
      ) {
        newCaretPosition = nodeIndexOverall;
      }
    }

    this.setCaretPosition(newCaretPosition);
  }

  public static setCaretPositionByMonomer(monomer: BaseMonomer) {
    let newCaretPosition = -1;

    for (const { twoStrandedNode, nodeIndexOverall } of this.nodesInAllChains) {
      if (
        twoStrandedNode.senseNode?.monomers.includes(monomer) ||
        twoStrandedNode.antisenseNode?.monomers.includes(monomer)
      ) {
        newCaretPosition = nodeIndexOverall;
      }
    }

    this.setCaretPosition(newCaretPosition);
  }

  public static setCaretPositionNextToMonomer(monomer: BaseMonomer) {
    let newCaretPosition = -1;

    for (const { twoStrandedNode, nodeIndexOverall } of this.nodesInAllChains) {
      if (
        twoStrandedNode.senseNode?.monomers.includes(monomer) ||
        twoStrandedNode.antisenseNode?.monomers.includes(monomer)
      ) {
        newCaretPosition = nodeIndexOverall;
      }
    }

    if (newCaretPosition === -1) {
      return;
    }

    this.setCaretPosition(newCaretPosition + 1);
  }

  public static setCaretPositionByNode(nodeToCompare: ITwoStrandedChainItem) {
    let newCaretPosition = -1;

    for (const { twoStrandedNode, nodeIndexOverall } of this.nodesInAllChains) {
      if (twoStrandedNode === nodeToCompare) {
        newCaretPosition = nodeIndexOverall;
      }
    }

    this.setCaretPosition(newCaretPosition);
  }

  public static getMonomersByCaretPositionRange(
    startCaretPosition: number,
    endCaretPosition,
  ) {
    const monomers: BaseMonomer[] = [];
    for (const { twoStrandedNode, nodeIndexOverall } of this.nodesInAllChains) {
      if (
        startCaretPosition <= nodeIndexOverall &&
        nodeIndexOverall < (endCaretPosition ?? this.caretPosition)
      ) {
        if (twoStrandedNode.senseNode?.monomer) {
          monomers.push(twoStrandedNode.senseNode?.monomer);
        }
        if (twoStrandedNode.antisenseNode?.monomer) {
          monomers.push(twoStrandedNode.antisenseNode?.monomer);
        }
      }
    }
    return monomers;
  }

  public static resetLastUserDefinedCaretPosition() {
    this.lastUserDefinedCaretPosition = this.caretPosition;
  }

  // TODO cache this value, it's calculated too often
  private static get nodesGroupedByRows() {
    const lineLength = SettingsManager.editorLineLength['sequence-layout-mode'];
    const finalArray: Array<Array<ITwoStrandedChainItem>> = [];
    let chainNodes: Array<ITwoStrandedChainItem> = [];
    for (const { twoStrandedNode } of this.nodesInAllChains) {
      chainNodes.push(twoStrandedNode);
      if (!(twoStrandedNode.senseNode instanceof EmptySequenceNode)) {
        continue;
      }

      if (chainNodes.length > lineLength) {
        while (chainNodes.length > 0) {
          finalArray.push(chainNodes.splice(0, lineLength));
        }
      } else {
        finalArray.push([...chainNodes]);
      }
      chainNodes = [];
    }

    return finalArray;
  }

  private static getNodeIndexInRowByGlobalIndex(nodeIndexOverall: number) {
    let restNodes = nodeIndexOverall;
    let nodeIndexInRow;

    this.nodesGroupedByRows.forEach((row) => {
      if (nodeIndexInRow === undefined && restNodes - row.length < 0) {
        nodeIndexInRow = restNodes;
      }
      restNodes -= row.length;
    });

    return nodeIndexInRow;
  }

  private static get currentChainRow() {
    const currentEdittingNode = this.currentEdittingNode;

    if (!currentEdittingNode) {
      return [];
    }

    return (
      this.nodesGroupedByRows.find((idexRow) =>
        idexRow.includes(currentEdittingNode),
      ) ?? []
    );
  }

  private static get previousRowOfNodes() {
    const currentEdittingNode = this.currentEdittingNode;

    if (!currentEdittingNode) {
      return [];
    }

    const index = this.nodesGroupedByRows.findIndex((row) =>
      row.includes(currentEdittingNode),
    );
    return index > 0 ? this.nodesGroupedByRows[index - 1] : [];
  }

  private static get nextRowOfNodes() {
    const currentEdittingNode = this.currentEdittingNode;

    if (!currentEdittingNode) {
      return [];
    }

    const currentIndex = this.nodesGroupedByRows.findIndex((row) =>
      row.includes(currentEdittingNode),
    );
    return currentIndex !== -1 &&
      currentIndex + 1 < this.nodesGroupedByRows.length
      ? this.nodesGroupedByRows[currentIndex + 1]
      : [];
  }

  public static moveCaretUp() {
    const currentEdittingNode = this.currentEdittingNode;

    if (!currentEdittingNode) {
      return;
    }

    const currentNodeIndexInRow =
      this.currentChainRow.indexOf(currentEdittingNode);

    let newCaretPosition = this.caretPosition;
    const symbolsBeforeCaretInCurrentRow = currentNodeIndexInRow;
    const lastUserDefinedCursorPositionInRow =
      this.getNodeIndexInRowByGlobalIndex(this.lastUserDefinedCaretPosition) ??
      0;

    newCaretPosition -= symbolsBeforeCaretInCurrentRow;
    newCaretPosition -= Math.max(
      this.previousRowOfNodes.length === 0 ? 0 : 1,
      this.previousRowOfNodes.length - lastUserDefinedCursorPositionInRow,
    );

    this.setCaretPosition(newCaretPosition);
  }

  public static moveCaretDown() {
    const currentEdittingNode = this.currentEdittingNode;

    if (!currentEdittingNode) {
      return;
    }

    const currentNodeIndexInRow =
      this.currentChainRow.indexOf(currentEdittingNode);

    let newCaretPosition = this.caretPosition;
    const lastUserDefinedCursorPositionInRow =
      this.getNodeIndexInRowByGlobalIndex(this.lastUserDefinedCaretPosition) ??
      0;
    const symbolsAfterCaretInCurrentRow =
      this.currentChainRow.length - currentNodeIndexInRow;

    newCaretPosition += symbolsAfterCaretInCurrentRow;
    newCaretPosition += Math.min(
      lastUserDefinedCursorPositionInRow,
      this.nextRowOfNodes.length - 1,
    );

    this.setCaretPosition(newCaretPosition);
  }

  public static moveCaretForward() {
    const operation = new RestoreSequenceCaretPositionOperation(
      this.caretPosition,
      this.nextCaretPosition ?? this.caretPosition,
    );
    this.resetLastUserDefinedCaretPosition();

    return operation;
  }

  public static moveCaretBack() {
    const operation = new RestoreSequenceCaretPositionOperation(
      this.caretPosition,
      this.previousCaretPosition ?? this.caretPosition,
    );
    this.resetLastUserDefinedCaretPosition();

    return operation;
  }

  public static get currentChainIndex() {
    let currentChainIndex = -1;

    for (const { nodeIndexOverall, chainIndex } of this.nodesInAllChains) {
      if (nodeIndexOverall === this.caretPosition) {
        currentChainIndex = chainIndex;
      }
    }

    return currentChainIndex;
  }

  public static get lastNodeCaretPosition(): number | undefined {
    if (this.chainsCollection.chains.length === 0) {
      return undefined;
    }

    let lastNodeIndex = -1;

    for (const _ of this.nodesInAllChains) {
      lastNodeIndex++;
    }

    return lastNodeIndex === -1 ? undefined : lastNodeIndex;
  }

  public static getNodeByPointer(sequencePointer?: number) {
    if (sequencePointer === undefined) return undefined;
    let nodeToReturn: ITwoStrandedChainItem | undefined;

    for (const { twoStrandedNode, nodeIndexOverall } of this.nodesInAllChains) {
      if (nodeIndexOverall === sequencePointer) {
        nodeToReturn = twoStrandedNode;
      }
    }

    return nodeToReturn;
  }

  public static get currentEdittingNode() {
    return this.getNodeByPointer(this.caretPosition);
  }

  public static get previousFromCurrentEdittingMonomer() {
    return this.getNodeByPointer(this.previousCaretPosition);
  }

  public static get currentChain() {
    return this.chainsCollection.chains[this.currentChainIndex];
  }

  public static get previousChain() {
    return this.sequenceViewModel?.chains[this.currentChainIndex - 1];
  }

  public static get nextChain() {
    return this.chainsCollection.chains[this.currentChainIndex + 1];
  }

  public static getLastNonEmptyNode(chain: Chain) {
    const subChainBeforeLast = chain.subChains[chain.subChains.length - 2];

    return subChainBeforeLast.nodes[subChainBeforeLast.nodes.length - 1];
  }

  public static getLastNode(chain: Chain) {
    const lastSubChain = chain.subChains[chain.subChains.length - 1];

    return lastSubChain.nodes[lastSubChain.nodes.length - 1];
  }

  public static get nextNode() {
    return this.getNodeByPointer(this.nextCaretPosition);
  }

  public static get previousNode() {
    return this.getNodeByPointer(this.previousCaretPosition);
  }

  public static get nextNodeInSameChain() {
    if (this.nextCaretPosition === this.caretPosition) {
      return undefined;
    }

    const currentNode = this.currentEdittingNode;
    const nextNodeInSameChain = this.getNodeByPointer(this.nextCaretPosition);

    return nextNodeInSameChain?.chain === currentNode?.chain
      ? nextNodeInSameChain
      : undefined;
  }

  public static get previousNodeInSameChain() {
    const currentEdittingNode = this.currentEdittingNode;

    if (!currentEdittingNode) {
      return undefined;
    }

    return this.getPreviousNodeInSameChain(currentEdittingNode);
  }

  private static get nextCaretPosition(): number | undefined {
    const nodeOnNextPosition = this.getNodeByPointer(this.caretPosition + 1);

    return nodeOnNextPosition ? this.caretPosition + 1 : undefined;
  }

  public static get previousCaretPosition() {
    const nodeOnPreviousPosition = this.getNodeByPointer(
      this.caretPosition - 1,
    );

    return nodeOnPreviousPosition ? this.caretPosition - 1 : undefined;
  }

  public static get lastChain() {
    return this.chainsCollection.chains[
      this.chainsCollection.chains.length - 1
    ];
  }

  public static get lastChainLength() {
    return this.lastChain.length;
  }

  public static startNewSequence(indexOfRowBefore?: number) {
    const editor = CoreEditor.provideEditorInstance();
    const oldNewSequenceChainIndex = this.chainsCollection.chains.findIndex(
      (chain) => {
        return chain.isNewSequenceChain;
      },
    );
    const chainsCollection = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);
    chainsCollection.rearrange();

    this.show(
      chainsCollection,
      oldNewSequenceChainIndex !== -1 &&
        isNumber(indexOfRowBefore) &&
        indexOfRowBefore > oldNewSequenceChainIndex
        ? indexOfRowBefore - 1
        : indexOfRowBefore,
    );
  }

  public static getPreviousNodeInSameChain(
    nodeToCompare: ITwoStrandedChainItem,
  ): ITwoStrandedChainItem | undefined {
    let previousNode: ITwoStrandedChainItem | undefined;
    let previousNodeChainIndex = -1;
    let nodeToReturn: ITwoStrandedChainItem | undefined;

    for (const { twoStrandedNode, chainIndex } of this.nodesInAllChains) {
      if (
        nodeToCompare === twoStrandedNode &&
        chainIndex === previousNodeChainIndex
      ) {
        nodeToReturn = previousNode;
      }
      previousNodeChainIndex = chainIndex;
      previousNode = twoStrandedNode;
    }

    return nodeToReturn;
  }

  public static getNextNodeInSameChain(
    nodeToCompare: ITwoStrandedChainItem,
  ): ITwoStrandedChainItem | undefined {
    let previousNode: ITwoStrandedChainItem | undefined;
    let previousNodeChainIndex = -1;
    let nodeToReturn: ITwoStrandedChainItem | undefined;

    for (const { twoStrandedNode, chainIndex } of this.nodesInAllChains) {
      if (
        nodeToCompare === previousNode &&
        chainIndex === previousNodeChainIndex
      ) {
        nodeToReturn = twoStrandedNode;
      }
      previousNodeChainIndex = chainIndex;
      previousNode = twoStrandedNode;
    }

    return nodeToReturn;
  }

  public static getPreviousNode(nodeToCompare: ITwoStrandedChainItem) {
    let previousNode: ITwoStrandedChainItem | undefined;
    let nodeToReturn: ITwoStrandedChainItem | undefined;

    for (const { twoStrandedNode } of this.nodesInAllChains) {
      if (nodeToCompare === twoStrandedNode) {
        nodeToReturn = previousNode;
      }
      previousNode = twoStrandedNode;
    }

    return nodeToReturn;
  }

  public static getNextNode(nodeToCompare: ITwoStrandedChainItem) {
    let previousNode: ITwoStrandedChainItem | undefined;
    let nodeToReturn: ITwoStrandedChainItem | undefined;

    for (const { twoStrandedNode } of this.nodesInAllChains) {
      if (previousNode === nodeToCompare) {
        nodeToReturn = twoStrandedNode;
      }
      previousNode = twoStrandedNode;
    }

    return nodeToReturn;
  }

  public static shiftArrowSelectionInEditMode(event) {
    const editor = CoreEditor.provideEditorInstance();
    let modelChanges = new Command();
    const arrowKey = event.code;

    if (arrowKey === 'ArrowRight') {
      const currentEdittingNode = this.currentEdittingNode;

      if (!currentEdittingNode?.senseNode) {
        return;
      }

      modelChanges = this.getShiftArrowChanges(editor, currentEdittingNode);
      modelChanges.addOperation(this.moveCaretForward());
    } else if (arrowKey === 'ArrowLeft') {
      const previousNodeInSameChain = this.previousNodeInSameChain;

      if (previousNodeInSameChain?.senseNode) {
        modelChanges = this.getShiftArrowChanges(
          editor,
          previousNodeInSameChain,
        );
      } else if (this.previousChain?.lastNode) {
        const previousChainLastEmptyNode = this.previousChain.lastNode;

        if (previousChainLastEmptyNode.senseNode) {
          const result =
            editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
              previousChainLastEmptyNode.senseNode.monomer,
            );
          modelChanges.merge(result.command);
        }

        if (previousChainLastEmptyNode.antisenseNode) {
          const result =
            editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
              previousChainLastEmptyNode.antisenseNode.monomer,
            );
          modelChanges.merge(result.command);
        }
      }
      modelChanges.addOperation(this.moveCaretBack());
    } else if (arrowKey === 'ArrowUp') {
      const previousCaretPosition = this.caretPosition;
      this.moveCaretUp();
      const newCaretPosition = this.caretPosition;

      for (const { twoStrandedNode, nodeIndexOverall } of this
        .nodesInAllChains) {
        if (
          nodeIndexOverall < previousCaretPosition &&
          nodeIndexOverall >= newCaretPosition &&
          twoStrandedNode.senseNode
        ) {
          modelChanges.merge(
            this.getShiftArrowChanges(editor, twoStrandedNode),
          );
        }
      }
    } else if (arrowKey === 'ArrowDown') {
      const previousCaretPosition = this.caretPosition;
      this.moveCaretDown();
      const newCaretPosition = this.caretPosition;

      for (const { twoStrandedNode, nodeIndexOverall } of this
        .nodesInAllChains) {
        if (
          nodeIndexOverall >= previousCaretPosition &&
          nodeIndexOverall < newCaretPosition &&
          twoStrandedNode.senseNode
        ) {
          modelChanges.merge(
            this.getShiftArrowChanges(editor, twoStrandedNode),
          );
        }
      }
    }
    editor.renderersContainer.update(modelChanges);
  }

  private static getShiftArrowChanges(
    editor: CoreEditor,
    twoStrandedNode: ITwoStrandedChainItem,
  ) {
    const modelChanges = new Command();
    const senseNodeMonomer = twoStrandedNode.senseNode?.monomer;
    const antiSenseNodeMonomer = twoStrandedNode.antisenseNode?.monomer;
    const needTurnOffSelection = senseNodeMonomer?.selected;

    if (senseNodeMonomer) {
      const result =
        editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
          senseNodeMonomer,
        );
      if (needTurnOffSelection) {
        modelChanges.merge(
          editor.drawingEntitiesManager.addDrawingEntitiesToSelection(
            result.drawingEntities,
          ),
        );
      } else {
        modelChanges.merge(result.command);
      }
    }

    if (antiSenseNodeMonomer) {
      const result =
        editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
          antiSenseNodeMonomer,
        );
      if (needTurnOffSelection) {
        modelChanges.merge(
          editor.drawingEntitiesManager.addDrawingEntitiesToSelection(
            result.drawingEntities,
          ),
        );
      } else {
        modelChanges.merge(result.command);
      }
    }

    return modelChanges;
  }

  public static unselectEmptyAndBackboneSequenceNodes() {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();
    for (const { twoStrandedNode } of this.nodesInAllChains) {
      if (
        twoStrandedNode.senseNode instanceof EmptySequenceNode ||
        twoStrandedNode.senseNode instanceof BackBoneSequenceNode
      ) {
        command.merge(
          editor.drawingEntitiesManager.unselectDrawingEntity(
            twoStrandedNode.senseNode.monomer,
          ),
        );
        twoStrandedNode.senseNode.renderer?.removeSelection();
      }
      if (
        twoStrandedNode.antisenseNode instanceof EmptySequenceNode ||
        twoStrandedNode.antisenseNode instanceof BackBoneSequenceNode
      ) {
        command.merge(
          editor.drawingEntitiesManager.unselectDrawingEntity(
            twoStrandedNode.antisenseNode.monomer,
          ),
        );
        twoStrandedNode.antisenseNode.renderer?.removeSelection();
      }
    }
    return command;
  }

  public static get selections() {
    const editor = CoreEditor.provideEditorInstance();
    const selections: TwoStrandedNodesSelection = [];
    let lastSelectionRangeIndex = -1;
    let previousNode;

    for (const { twoStrandedNode, nodeIndexOverall } of this.nodesInAllChains) {
      const nodeToCheck = twoStrandedNode.senseNode?.monomer.selected
        ? twoStrandedNode.senseNode
        : twoStrandedNode.antisenseNode;

      if (nodeToCheck?.monomer.selected) {
        const selection: Partial<TwoStrandedNodeSelection> = {};

        // Add field 'isNucleosideConnectedAndSelectedWithPhosphate' to the Nucleoside elements
        if (nodeToCheck instanceof Nucleoside) {
          const nextMonomer = getNextMonomerInChain(nodeToCheck.sugar);

          selection.isNucleosideConnectedAndSelectedWithPhosphate =
            nextMonomer instanceof Phosphate &&
            nextMonomer.selected &&
            editor.drawingEntitiesManager.isNucleosideAndPhosphateConnectedAsNucleotide(
              nodeToCheck,
              nextMonomer,
            );
        }

        // Add field 'hasR1Connection' to the Nucleotide/Nucleoside elements
        if (
          nodeToCheck instanceof Nucleotide ||
          nodeToCheck instanceof Nucleoside
        ) {
          selection.hasR1Connection =
            !!nodeToCheck.sugar.attachmentPointsToBonds.R1;
        }

        if (!previousNode?.monomer.selected) {
          lastSelectionRangeIndex = selections.push([]) - 1;
        }
        selections[lastSelectionRangeIndex].push({
          ...selection,
          node: twoStrandedNode,
          nodeIndexOverall,
        });
      }
      previousNode = nodeToCheck;
    }

    return selections;
  }

  public static getRenderedStructuresBbox() {
    let left;
    let right;
    let top;
    let bottom;
    for (const { twoStrandedNode } of this.nodesInAllChains) {
      assert(
        twoStrandedNode.senseNode?.monomer.renderer instanceof
          BaseSequenceItemRenderer,
      );
      const nodePosition =
        twoStrandedNode.senseNode.monomer.renderer
          ?.scaledMonomerPositionForSequence;
      left = left ? Math.min(left, nodePosition.x) : nodePosition.x;
      right = right ? Math.max(right, nodePosition.x) : nodePosition.x;
      top = top ? Math.min(top, nodePosition.y) : nodePosition.y;
      bottom = bottom ? Math.max(bottom, nodePosition.y) : nodePosition.y;
    }
    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }

  public static getRendererByMonomer(monomer: BaseMonomer) {
    let rendererToReturn;

    for (const { twoStrandedNode } of this.nodesInAllChains) {
      if (
        twoStrandedNode.senseNode?.monomers.includes(monomer) ||
        twoStrandedNode.antisenseNode?.monomers.includes(monomer)
      ) {
        rendererToReturn =
          twoStrandedNode.senseNode?.renderer ??
          twoStrandedNode.antisenseNode?.renderer;
      }
    }

    return rendererToReturn;
  }

  public static showNewSequenceButton(indexOfRowBefore: number, width = 0) {
    const newSequenceButton = new NewSequenceButton(indexOfRowBefore);
    newSequenceButton.show();
    newSequenceButton.setWidth(width);
    this.newSequenceButtons.push(newSequenceButton);
  }

  public static isEmptyCanvas() {
    return this.sequenceViewModel?.hasOnlyOneNewChain;
  }

  public static get isCaretAtChainEnd() {
    return this.currentEdittingNode?.senseNode instanceof EmptySequenceNode;
  }

  public static clear() {
    if (!this.sequenceViewModel) return;
    for (const {
      twoStrandedNode,
    } of this.sequenceViewModel.nodesInAllChains()) {
      twoStrandedNode.senseNode?.renderer?.remove();
      twoStrandedNode.antisenseNode?.renderer?.remove();
    }
    this.removeNewSequenceButtons();
  }
}

export function sequenceReplacer(key: string, value: unknown): unknown {
  if (key === 'renderer') {
    return `<${typeof value}>`;
  } else if (key === 'baseRenderer') {
    return `<${typeof value}>`;
  } else if (['R1', 'R2', 'R3'].includes(key)) {
    return `<${typeof value}>`;
  } else if (value instanceof Pool) {
    return {
      // eslint-disable-next-line dot-notation
      nextId: value['nextId'],
      items: Array.from(value),
    };
  } else if (
    value instanceof Object &&
    !['Object', 'Array'].includes(value.constructor.name)
  ) {
    const valueObj = value as object;
    const hasOwnToString = valueObj.toString !== Object.prototype.toString;
    return {
      ctor: value.constructor.name,
      ...(hasOwnToString && { repr: valueObj.toString() }),
      ...value,
    };
  }
  return value;
}
