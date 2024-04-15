import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { SequenceNodeRendererFactory } from 'application/render/renderers/sequence/SequenceNodeRendererFactory';
import { BaseMonomer, RNABase, Sugar, Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import {
  getRnaBaseFromSugar,
  getSugarFromRnaBase,
} from 'domain/helpers/monomers';
import { BackBoneBondSequenceRenderer } from 'application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { EmptySequenceItemRenderer } from 'application/render/renderers/sequence/EmptySequenceItemRenderer';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { EmptySubChain } from 'domain/entities/monomer-chains/EmptySubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { CoreEditor } from 'application/editor/internal';
import { SequenceMode } from 'application/editor/modes';
import { RestoreSequenceCaretPositionOperation } from 'application/editor/operations/modes';
import assert from 'assert';
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';
import { BaseMonomerRenderer } from 'application/render';
import { Command } from 'domain/entities/Command';

export type SequencePointer = number;
export type SequencePointerStep = number;

export type NodeSelection = {
  node: SubChainNode;
  nodeIndexOverall: number;
};

export type NodesSelection = NodeSelection[][];

export class SequenceRenderer {
  public static caretPosition: SequencePointer = -1;
  public static chainsCollection: ChainsCollection;
  public static step: SequencePointerStep = 30;
  public static lastChainStartPosition: Vec2;
  private static emptySequenceItemRenderers: EmptySequenceItemRenderer[] = [];
  public static show(chainsCollection: ChainsCollection) {
    SequenceRenderer.chainsCollection = chainsCollection;
    this.removeEmptyNodes();
    this.showNodes(SequenceRenderer.chainsCollection);
    this.showBonds(SequenceRenderer.chainsCollection);
  }

  public static removeEmptyNodes() {
    SequenceRenderer.emptySequenceItemRenderers.forEach(
      (emptySequenceItemRenderer) => {
        emptySequenceItemRenderer.remove();
        SequenceRenderer.emptySequenceItemRenderers = [];
      },
    );
  }

  private static showNodes(chainsCollection: ChainsCollection) {
    const firstNode = chainsCollection.firstNode;

    let currentChainStartPosition = firstNode
      ? BaseMonomerRenderer.getScaledMonomerPosition(
          firstNode.monomer.position,
          firstNode.monomer.renderer?.monomerSize,
        )
      : new Vec2(41.5, 41.5);

    let currentMonomerIndexInChain = 0;
    let currentMonomerIndexOverall = 0;
    const editor = CoreEditor.provideEditorInstance();
    const isEditMode =
      editor.mode instanceof SequenceMode && editor.mode.isEditMode;

    if (isEditMode) {
      chainsCollection.chains.forEach((chain) => {
        const emptySequenceNode = new EmptySequenceNode();
        const emptySubChain = new EmptySubChain();
        emptySubChain.add(emptySequenceNode);
        chain.subChains.push(emptySubChain);
      });
    }

    chainsCollection.chains.forEach((chain) => {
      currentMonomerIndexInChain = 0;
      chain.subChains.forEach((subChain) => {
        subChain.nodes.forEach((node) => {
          const renderer = SequenceNodeRendererFactory.fromNode(
            node,
            currentChainStartPosition,
            currentMonomerIndexInChain,
            currentMonomerIndexInChain + 1 + (isEditMode ? 1 : 0) ===
              chain.subChains.reduce(
                (prev, curr) => prev + curr.nodes.length,
                0,
              ),
            subChain,
            currentMonomerIndexOverall === SequenceRenderer.caretPosition,
            node.monomer.renderer,
          );
          renderer.show();
          node.monomers?.forEach((monomer) => monomer.setRenderer(renderer));
          currentMonomerIndexInChain++;
          currentMonomerIndexOverall++;

          if (node instanceof EmptySequenceNode) {
            SequenceRenderer.emptySequenceItemRenderers.push(renderer);
            node.setRenderer(renderer);
          }
        });
      });

      currentChainStartPosition = SequenceRenderer.getNextChainPosition(
        currentChainStartPosition,
        chain,
      );
    });

    if (this.caretPosition > currentMonomerIndexOverall) {
      this.setCaretPosition(currentMonomerIndexOverall);
    }

    this.lastChainStartPosition = currentChainStartPosition;
  }

  public static getNextChainPosition(
    currentChainStartPosition: Vec2 = SequenceRenderer.lastChainStartPosition,
    lastChain: Chain = SequenceRenderer.lastChain,
  ) {
    return new Vec2(
      currentChainStartPosition.x,
      currentChainStartPosition.y +
        75 +
        47 * Math.floor((lastChain.length - 1) / 30),
    );
  }

  private static showBonds(chainsCollection: ChainsCollection) {
    const handledMonomersToAttachmentPoints: Map<
      BaseMonomer,
      Set<AttachmentPointName>
    > = new Map();

    chainsCollection.chains.forEach((chain) => {
      chain.subChains.forEach((subChain) => {
        subChain.nodes.forEach((node) => {
          if (node instanceof EmptySequenceNode) {
            return;
          }

          if (!handledMonomersToAttachmentPoints.has(node.monomer)) {
            handledMonomersToAttachmentPoints.set(node.monomer, new Set());
          }
          node.monomer.forEachBond((polymerBond, attachmentPointName) => {
            if (!subChain.bonds.includes(polymerBond)) {
              subChain.bonds.push(polymerBond);
            }
            if (!polymerBond.isSideChainConnection) {
              polymerBond.setRenderer(
                new BackBoneBondSequenceRenderer(polymerBond),
              );
              return;
            }

            const handledAttachmentPoints =
              handledMonomersToAttachmentPoints.get(
                node.monomer,
              ) as Set<AttachmentPointName>;

            if (handledAttachmentPoints.has(attachmentPointName)) {
              return;
            }

            const anotherMonomer = polymerBond.getAnotherMonomer(
              node.monomer,
            ) as BaseMonomer;

            // Skip handling side chains for sugar(R3) + base(R1) connections.
            if (
              (node.monomer instanceof Sugar &&
                getRnaBaseFromSugar(node.monomer) === anotherMonomer) ||
              (anotherMonomer instanceof Sugar &&
                getRnaBaseFromSugar(anotherMonomer) === node.monomer)
            ) {
              return;
            }

            let bondRenderer;

            // If side connection comes from rna base then take connected sugar and draw side connection from it
            // because for rna we display only one letter instead of three
            if (anotherMonomer instanceof RNABase) {
              const connectedSugar = getSugarFromRnaBase(anotherMonomer);
              bondRenderer = new PolymerBondSequenceRenderer(
                new PolymerBond(node.monomer, connectedSugar),
              );
            } else {
              bondRenderer = new PolymerBondSequenceRenderer(polymerBond);
            }
            bondRenderer.show();
            polymerBond.setRenderer(bondRenderer);
            handledAttachmentPoints.add(attachmentPointName);

            if (!handledMonomersToAttachmentPoints.get(anotherMonomer)) {
              handledMonomersToAttachmentPoints.set(anotherMonomer, new Set());
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
  }

  public static setCaretPosition(caretPosition: SequencePointer) {
    const oldSubChainNode = SequenceRenderer.currentEdittingNode;

    if (oldSubChainNode) {
      assert(oldSubChainNode.renderer instanceof BaseSequenceItemRenderer);
      oldSubChainNode.renderer.isEditingSymbol = false;
      oldSubChainNode.renderer?.remove();
      oldSubChainNode.renderer?.show();
    }
    SequenceRenderer.caretPosition = caretPosition;
    const subChainNode = SequenceRenderer.currentEdittingNode;

    if (!subChainNode) {
      return;
    }

    assert(subChainNode.renderer instanceof BaseSequenceItemRenderer);
    subChainNode.renderer.isEditingSymbol = true;
    subChainNode.renderer?.remove();
    subChainNode.renderer?.show();
  }

  public static forEachNode(
    forEachCallback: (params: {
      chainIndex: number;
      subChainIndex: number;
      nodeIndex: number;
      nodeIndexOverall: number;
      node: SubChainNode;
      subChain: BaseSubChain;
      chain: Chain;
    }) => void,
  ) {
    let nodeIndexOverall = 0;

    this.chainsCollection.chains.forEach((chain, chainIndex) => {
      chain.subChains.forEach((subChain, subChainIndex) => {
        subChain.nodes.forEach((node, nodeIndex) => {
          forEachCallback({
            chainIndex,
            subChainIndex,
            nodeIndex,
            nodeIndexOverall,
            node,
            subChain,
            chain,
          });
          nodeIndexOverall++;
        });
      });
    });
  }

  public static setCaretPositionBySequenceItemRenderer(
    sequenceItemRenderer: BaseSequenceItemRenderer,
  ) {
    let newCaretPosition = -1;

    SequenceRenderer.forEachNode(({ node, nodeIndexOverall }) => {
      if (node.renderer === sequenceItemRenderer) {
        newCaretPosition = nodeIndexOverall;
      }
    });

    this.setCaretPosition(newCaretPosition);
  }

  public static setCaretPositionByMonomer(monomer: BaseMonomer) {
    let newCaretPosition = -1;

    SequenceRenderer.forEachNode(({ node, nodeIndexOverall }) => {
      if (node.monomer === monomer) {
        newCaretPosition = nodeIndexOverall;
      }
    });

    this.setCaretPosition(newCaretPosition);
  }

  public static getMonomersByCaretPositionRange(
    startCaretPosition: SequencePointer,
    endCaretPosition,
  ) {
    const monomers: BaseMonomer[] = [];
    SequenceRenderer.forEachNode(({ node, nodeIndexOverall }) => {
      if (
        startCaretPosition <= nodeIndexOverall &&
        nodeIndexOverall < (endCaretPosition || this.caretPosition)
      ) {
        monomers.push(node.monomer);
      }
    });
    return monomers;
  }

  public static moveCaretUp() {
    const {
      currentEdittingNode: currentNode,
      currentChain,
      previousChain,
      step,
    } = this;
    const currentArrayLength = currentChain.length;
    const baseArray = currentChain.subChains.flatMap((item) => item.nodes);
    const nodeIndex = baseArray.indexOf(currentNode);
    const tailLength = previousChain
      ? previousChain.length > step
        ? previousChain.length - step * Math.floor(previousChain.length / step)
        : previousChain.length
      : 0;

    const restoreCaretPosition = (
      tailOrLength,
      caretPosition = this.caretPosition,
    ) =>
      new RestoreSequenceCaretPositionOperation(
        this.caretPosition,
        this.caretPosition - tailOrLength || caretPosition,
      );

    if (this.caretPosition >= step) {
      if (currentArrayLength > step && nodeIndex >= step) {
        restoreCaretPosition(step, 0);
      } else if (nodeIndex < tailLength - 1) {
        restoreCaretPosition(
          tailLength - currentArrayLength + currentArrayLength,
        );
      } else {
        restoreCaretPosition(nodeIndex + 1);
      }
    } else {
      restoreCaretPosition(0);
    }
  }

  public static moveCaretDown() {
    debugger;
    const {
      currentEdittingNode: currentNode,
      currentChain,
      nextChain,
      step,
    } = this;
    const restoreCaretPosition = (offset) =>
      new RestoreSequenceCaretPositionOperation(
        this.caretPosition,
        this.caretPosition + offset || this.caretPosition,
      );
    const baseArray = currentChain.subChains.flatMap((item) => item.nodes);
    const currentArrayLength = currentChain.length;
    const nodeIndex = baseArray.indexOf(currentNode);
    const prevStepBound =
      currentArrayLength > step
        ? step * Math.floor(currentArrayLength / step) - 1
        : currentArrayLength;

    if (!nextChain && nodeIndex > prevStepBound) {
      restoreCaretPosition(0);
      return;
    }

    if (currentArrayLength > step) {
      const remaining = currentArrayLength - nodeIndex;

      if (prevStepBound >= nodeIndex) {
        restoreCaretPosition(remaining <= step ? remaining - 1 : step);
      } else {
        const offset = currentArrayLength - prevStepBound - remaining;
        restoreCaretPosition(
          offset > nextChain.length
            ? remaining + nextChain.length - 1
            : currentArrayLength - prevStepBound - 1,
        );
      }
    } else {
      const offset = currentArrayLength - nodeIndex;
      restoreCaretPosition(
        nodeIndex > nextChain.length - 1
          ? offset + nextChain.length - 1
          : currentArrayLength,
      );
    }
  }

  public static moveCaretForward() {
    return new RestoreSequenceCaretPositionOperation(
      this.caretPosition,
      this.nextCaretPosition || this.caretPosition,
    );
  }

  public static moveCaretBack() {
    return new RestoreSequenceCaretPositionOperation(
      this.caretPosition,
      this.previousCaretPosition === undefined
        ? this.caretPosition
        : this.previousCaretPosition,
    );
  }

  public static get hasNewChain() {
    return SequenceRenderer.newChainCaretPosition !== undefined;
  }

  public static moveCaretToNewChain() {
    this.setCaretPosition(
      SequenceRenderer.newChainCaretPosition === undefined
        ? -1
        : SequenceRenderer.newChainCaretPosition,
    );
  }

  private static get currentChainIndex() {
    let currentChainIndex = -1;

    SequenceRenderer.forEachNode(({ nodeIndexOverall, chainIndex }) => {
      if (nodeIndexOverall === this.caretPosition) {
        currentChainIndex = chainIndex;
      }
    });

    return currentChainIndex;
  }

  public static get newChainCaretPosition(): SequencePointer | undefined {
    const lastNodeCaretPosition = SequenceRenderer.lastNodeCaretPosition;
    if (lastNodeCaretPosition === undefined) {
      return undefined;
    }
    const lastChain = SequenceRenderer.getChainByPointer(lastNodeCaretPosition);

    return lastChain.isEmpty ? lastNodeCaretPosition : undefined;
  }

  public static get lastNodeCaretPosition(): SequencePointer | undefined {
    if (SequenceRenderer.chainsCollection.chains.length === 0) {
      return undefined;
    }

    let lastNodeIndex = -1;

    SequenceRenderer.forEachNode(() => {
      lastNodeIndex++;
    });

    return lastNodeIndex === -1 ? undefined : lastNodeIndex;
  }

  public static getNodeByPointer(sequencePointer?: SequencePointer) {
    if (sequencePointer === undefined) return;
    let nodeToReturn;

    SequenceRenderer.forEachNode(({ node, nodeIndexOverall }) => {
      if (nodeIndexOverall === sequencePointer) {
        nodeToReturn = node;
      }
    });

    return nodeToReturn;
  }

  private static getChainByPointer(sequencePointer: SequencePointer) {
    let chainToReturn;

    SequenceRenderer.forEachNode(({ chain, nodeIndexOverall }) => {
      if (nodeIndexOverall === sequencePointer) {
        chainToReturn = chain;
      }
    });

    return chainToReturn;
  }

  public static get currentEdittingNode() {
    return SequenceRenderer.getNodeByPointer(this.caretPosition);
  }

  public static get previousFromCurrentEdittingMonomer() {
    return SequenceRenderer.getNodeByPointer(
      SequenceRenderer.previousCaretPosition,
    );
  }

  public static get currentChain() {
    return SequenceRenderer.chainsCollection.chains[
      SequenceRenderer.currentChainIndex
    ];
  }

  public static get previousChain() {
    return SequenceRenderer.chainsCollection.chains[
      SequenceRenderer.currentChainIndex - 1
    ];
  }

  public static get nextChain() {
    return SequenceRenderer.chainsCollection.chains[
      SequenceRenderer.currentChainIndex + 1
    ];
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
    return SequenceRenderer.getNodeByPointer(
      SequenceRenderer.nextCaretPosition,
    );
  }

  public static get previousNode() {
    return SequenceRenderer.getNodeByPointer(
      SequenceRenderer.previousCaretPosition,
    );
  }

  public static get nextNodeInSameChain() {
    if (SequenceRenderer.nextCaretPosition !== SequenceRenderer.caretPosition) {
      return;
    }

    return SequenceRenderer.getNodeByPointer(
      SequenceRenderer.nextCaretPosition,
    );
  }

  public static get previousNodeInSameChain() {
    return SequenceRenderer.getPreviousNodeInSameChain(
      SequenceRenderer.currentEdittingNode,
    );
  }

  private static get nextCaretPosition(): SequencePointer | undefined {
    const nodeOnNextPosition = SequenceRenderer.getNodeByPointer(
      this.caretPosition + 1,
    );

    return nodeOnNextPosition ? this.caretPosition + 1 : undefined;
  }

  public static get previousCaretPosition() {
    const nodeOnPreviousPosition = SequenceRenderer.getNodeByPointer(
      this.caretPosition - 1,
    );

    return nodeOnPreviousPosition ? this.caretPosition - 1 : undefined;
  }

  public static get lastChain() {
    return SequenceRenderer.chainsCollection.chains[
      SequenceRenderer.chainsCollection.chains.length - 1
    ];
  }

  public static startNewSequence() {
    const chain = new Chain();
    const emptySequenceNode = new EmptySequenceNode();
    const emptySubChain = new EmptySubChain();
    emptySubChain.add(emptySequenceNode);
    chain.subChains.push(emptySubChain);

    const renderer = SequenceNodeRendererFactory.fromNode(
      emptySequenceNode,
      this.lastChainStartPosition,
      0,
      false,
      emptySubChain,
      true,
    );
    renderer.show();
    emptySequenceNode.setRenderer(renderer);
    SequenceRenderer.emptySequenceItemRenderers.push(renderer);
    SequenceRenderer.chainsCollection.chains.push(chain);
  }

  public static getPreviousNodeInSameChain(nodeToCompare: SubChainNode) {
    let previousNode;
    let previousNodeChainIndex = -1;
    let nodeToReturn;

    SequenceRenderer.forEachNode(({ node, chainIndex }) => {
      if (nodeToCompare === node && chainIndex === previousNodeChainIndex) {
        nodeToReturn = previousNode;
      }
      previousNodeChainIndex = chainIndex;
      previousNode = node;
    });

    return nodeToReturn;
  }

  public static getNextNodeInSameChain(nodeToCompare: SubChainNode) {
    let previousNode;
    let previousNodeChainIndex = -1;
    let nodeToReturn;

    SequenceRenderer.forEachNode(({ node, chainIndex }) => {
      if (
        nodeToCompare === previousNode &&
        chainIndex === previousNodeChainIndex
      ) {
        nodeToReturn = node;
      }
      previousNodeChainIndex = chainIndex;
      previousNode = node;
    });

    return nodeToReturn;
  }

  public static getPreviousNode(nodeToCompare: SubChainNode) {
    let previousNode;
    let nodeToReturn;

    SequenceRenderer.forEachNode(({ node }) => {
      if (nodeToCompare === node) {
        nodeToReturn = previousNode;
      }
      previousNode = node;
    });

    return nodeToReturn;
  }

  public static getNextNode(nodeToCompare: SubChainNode) {
    let previousNode;
    let nodeToReturn;

    SequenceRenderer.forEachNode(({ node }) => {
      if (previousNode === nodeToCompare) {
        nodeToReturn = node;
      }
      previousNode = node;
    });

    return nodeToReturn;
  }

  public static shiftArrowSelectionInEditMode(event) {
    const editor = CoreEditor.provideEditorInstance();
    let modelChanges;
    const arrowKey = event.code;
    if (arrowKey === 'ArrowRight') {
      modelChanges = SequenceRenderer.getShiftArrowChanges(
        editor,
        this.currentEdittingNode.monomer,
      );
      modelChanges.addOperation(this.moveCaretForward());
    } else if (arrowKey === 'ArrowLeft') {
      if (this.previousNodeInSameChain) {
        modelChanges = SequenceRenderer.getShiftArrowChanges(
          editor,
          this.previousNodeInSameChain.monomer,
        );
      } else if (SequenceRenderer.previousChain) {
        const previousChainLastEmptyNode = SequenceRenderer.getLastNode(
          SequenceRenderer.previousChain,
        );
        ({ command: modelChanges } =
          editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
            previousChainLastEmptyNode.monomer,
          ));
      }
      modelChanges.addOperation(this.moveCaretBack());
    }
    editor.renderersContainer.update(modelChanges);
  }

  private static getShiftArrowChanges(
    editor: CoreEditor,
    monomer: BaseMonomer,
  ) {
    let modelChanges;
    const needTurnOffSelection = monomer.selected;
    const result =
      editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
        monomer,
      );
    if (needTurnOffSelection) {
      modelChanges =
        editor.drawingEntitiesManager.addDrawingEntitiesToSelection(
          result.drawingEntities,
        );
    } else {
      modelChanges = result.command;
    }
    return modelChanges;
  }

  public static unselectEmptySequenceNodes() {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();
    SequenceRenderer.forEachNode(({ node }) => {
      if (node instanceof EmptySequenceNode) {
        command.merge(
          editor.drawingEntitiesManager.unselectDrawingEntity(node.monomer),
        );
      }
    });
    return command;
  }

  public static get selections() {
    const selections: NodesSelection = [];
    let lastSelectionRangeIndex = -1;
    let previousNode;

    SequenceRenderer.forEachNode(({ node, nodeIndexOverall }) => {
      if (node.monomer.selected) {
        if (!previousNode?.monomer.selected) {
          lastSelectionRangeIndex = selections.push([]) - 1;
        }
        selections[lastSelectionRangeIndex].push({
          node,
          nodeIndexOverall,
        });
      }
      previousNode = node;
    });

    return selections;
  }

  public static getRenderedStructuresBbox() {
    let left;
    let right;
    let top;
    let bottom;
    SequenceRenderer.forEachNode(({ node }) => {
      assert(node.monomer.renderer instanceof BaseSequenceItemRenderer);
      const nodePosition =
        node.monomer.renderer?.scaledMonomerPositionForSequence;
      left = left ? Math.min(left, nodePosition.x) : nodePosition.x;
      right = right ? Math.max(right, nodePosition.x) : nodePosition.x;
      top = top ? Math.min(top, nodePosition.y) : nodePosition.y;
      bottom = bottom ? Math.max(bottom, nodePosition.y) : nodePosition.y;
    });
    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }
}
