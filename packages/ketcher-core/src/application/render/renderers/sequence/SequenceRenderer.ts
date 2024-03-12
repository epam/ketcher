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
import { RestoreSequenceCaretPositionCommand } from 'application/editor/operations/modes';
import assert from 'assert';
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';
import { BaseMonomerRenderer } from 'application/render';
import { Command } from 'domain/entities/Command';

export type SequencePointer = number;

export class SequenceRenderer {
  public static caretPosition: SequencePointer = -1;
  public static chainsCollection: ChainsCollection;
  private static emptySequenceItemRenderers: EmptySequenceItemRenderer[] = [];
  private static lastChainStartPosition: Vec2;

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
          node.monomer?.setRenderer(renderer);
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

  private static getNextChainPosition(
    currentChainStartPosition: Vec2,
    lastChain: Chain,
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
            if (!polymerBond.isSideChainConnection) {
              polymerBond.setRenderer(
                new BackBoneBondSequenceRenderer(polymerBond),
              );
              subChain.bonds.push(polymerBond);
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
            subChain.bonds.push(polymerBond);
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

  public static moveCaretForward() {
    return new RestoreSequenceCaretPositionCommand(
      this.caretPosition,
      this.nextCaretPosition || this.caretPosition,
    );
  }

  public static moveCaretBack() {
    return new RestoreSequenceCaretPositionCommand(
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

  public static getLastNonEmptyNode(chain: Chain) {
    const subChainBeforeLast = chain.subChains[chain.subChains.length - 2];

    return subChainBeforeLast.nodes[subChainBeforeLast.nodes.length - 1];
  }

  public static getLastNode(chain: Chain) {
    const lastSubChain = chain.subChains[chain.subChains.length - 1];

    return lastSubChain.nodes[lastSubChain.nodes.length - 1];
  }

  public static get nextNodeFromCurrent() {
    return SequenceRenderer.getNodeByPointer(
      SequenceRenderer.nextCaretPosition,
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

  private static get previousCaretPosition() {
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

  public static shiftArrowSelectionInEditMode(event) {
    const editor = CoreEditor.provideEditorInstance();
    const getSelectedDrawingEntities = (selectedNode: SubChainNode) => {
      const drawingEntities = editor.drawingEntitiesManager.getDrawingEntities(
        selectedNode.monomer,
      );
      const modelChanges =
        editor.drawingEntitiesManager.addDrawingEntitiesToSelection(
          drawingEntities,
        );
      return modelChanges;
    };

    const modelChanges = new Command();
    const arrowKey = event.code;
    if (arrowKey === 'ArrowRight') {
      const modelChanges = getSelectedDrawingEntities(this.currentEdittingNode);
      modelChanges.addOperation(this.moveCaretForward());
    } else if (arrowKey === 'ArrowLeft') {
      const modelChanges = getSelectedDrawingEntities(
        this.previousNodeInSameChain,
      );
      modelChanges.addOperation(this.moveCaretBack());
    }
    editor.renderersContainer.update(modelChanges);
  }
}
