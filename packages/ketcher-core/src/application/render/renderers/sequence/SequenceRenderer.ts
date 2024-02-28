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
import {
  BaseSequenceItemRenderer,
  SymbolEditingMode,
} from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export type SequencePointer = [number, number, number];

export class SequenceRenderer {
  private static caretPosition: SequencePointer = [-1, -1, -1];
  private static chainsCollection: ChainsCollection;
  public static show(chainsCollection: ChainsCollection) {
    SequenceRenderer.chainsCollection = chainsCollection;
    this.showNodes(SequenceRenderer.chainsCollection);
    this.showBonds(SequenceRenderer.chainsCollection);
  }

  private static showNodes(chainsCollection: ChainsCollection) {
    const firstNode = chainsCollection.firstNode;

    if (!firstNode) {
      return;
    }

    let currentChainStartPosition = new Vec2(
      firstNode.monomer.renderer?.scaledMonomerPosition.x,
      firstNode.monomer.renderer?.scaledMonomerPosition.y,
    );

    let currentMonomerIndexInChain = 0;

    chainsCollection.chains.forEach((chain, chainIndex) => {
      currentMonomerIndexInChain = 0;
      chain.subChains.forEach((subChain, subChainIndex) => {
        subChain.nodes.forEach((node, nodeIndex) => {
          const renderer = SequenceNodeRendererFactory.fromNode(
            node,
            currentChainStartPosition,
            currentMonomerIndexInChain,
            currentMonomerIndexInChain + 1 ===
              chain.subChains.reduce(
                (prev, curr) => prev + curr.nodes.length,
                0,
              ),
            chainIndex === SequenceRenderer.caretPosition[0] &&
              subChainIndex === SequenceRenderer.caretPosition[1] &&
              nodeIndex === SequenceRenderer.caretPosition[2] &&
              SymbolEditingMode.AFTER,
          );
          renderer.show();
          node.monomer.setRenderer(renderer);
          currentMonomerIndexInChain++;
        });
      });

      currentChainStartPosition = new Vec2(
        currentChainStartPosition.x,
        currentChainStartPosition.y + 75 + 47 * Math.floor(chain.length / 31),
      );
    });
  }

  private static showBonds(chainsCollection: ChainsCollection) {
    const handledMonomersToAttachmentPoints: Map<
      BaseMonomer,
      Set<AttachmentPointName>
    > = new Map();

    chainsCollection.chains.forEach((chain) => {
      chain.subChains.forEach((subChain) => {
        subChain.nodes.forEach((node) => {
          if (!handledMonomersToAttachmentPoints.has(node.monomer)) {
            handledMonomersToAttachmentPoints.set(node.monomer, new Set());
          }
          node.monomer.forEachBond((polymerBond, attachmentPointName) => {
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
    const oldSubChainNode = SequenceRenderer.getNodeByPointer(
      this.caretPosition,
    );

    if (oldSubChainNode) {
      oldSubChainNode.monomer.renderer.symbolEditingMode = undefined;
      oldSubChainNode.monomer.renderer?.remove();
      oldSubChainNode.monomer.renderer?.show();
    }
    SequenceRenderer.caretPosition = caretPosition;
    const subChainNode = SequenceRenderer.getNodeByPointer(caretPosition);

    subChainNode.monomer.renderer.symbolEditingMode =
      caretPosition[2] === -1
        ? SymbolEditingMode.BEFORE
        : SymbolEditingMode.AFTER;
    subChainNode.monomer.renderer?.remove();
    subChainNode.monomer.renderer?.show();
  }

  public static setCaretPositionBySequenceItemRenderer(
    sequenceItemRenderer: BaseSequenceItemRenderer,
  ) {
    let chainIndex = -1;
    let subChainIndex = -1;
    let subChainNodeIndex = -1;

    this.chainsCollection.chains.forEach((chain, _chainIndex) => {
      chain.subChains.forEach((subChain, _subChainIndex) => {
        subChain.nodes.forEach((node, _nodeIndex) => {
          if (node.monomer.renderer === sequenceItemRenderer) {
            chainIndex = _chainIndex;
            subChainIndex = _subChainIndex;
            subChainNodeIndex = _nodeIndex;
          }
        });
      });
    });

    this.caretPosition = [chainIndex, subChainIndex, subChainNodeIndex];
  }

  public static moveCaretForward() {
    this.setCaretPosition(this.nextCaretPosition);
  }

  public static moveCaretBack() {
    this.setCaretPosition(this.previousCaretPosition);
  }

  public static get currentEdittingMonomer() {
    return SequenceRenderer.getNodeByPointer(this.caretPosition);
  }

  public static get previousFromCurrentEdittingMonomer() {
    return SequenceRenderer.getNodeByPointer(
      SequenceRenderer.previousCaretPosition,
    );
  }

  public static get nextFromCurrentEdittingMonomer() {
    return SequenceRenderer.getNodeByPointer(
      SequenceRenderer.nextCaretPosition,
    );
  }

  private static getNodeByPointer(sequencePointer: SequencePointer) {
    return SequenceRenderer.chainsCollection.chains[sequencePointer[0]]
      ?.subChains[sequencePointer[1]]?.nodes[
      sequencePointer[2] === -1 ? 0 : sequencePointer[2]
    ];
  }

  private static getSubChainByPointer(sequencePointer: SequencePointer) {
    return SequenceRenderer.chainsCollection.chains[sequencePointer[0]]
      ?.subChains[sequencePointer[1]];
  }

  private static getChainByPointer(sequencePointer: SequencePointer) {
    return SequenceRenderer.chainsCollection.chains[sequencePointer[0]];
  }

  private static get nextCaretPosition() {
    const currentChainIndex = SequenceRenderer.caretPosition[0];
    const currentSubChainIndex = SequenceRenderer.caretPosition[1];
    const currentNodeIndex = SequenceRenderer.caretPosition[2];
    const nextNodePointer: SequencePointer = [
      currentChainIndex,
      currentSubChainIndex,
      currentNodeIndex + 1,
    ];
    const nextSubChainPointer: SequencePointer = [
      currentChainIndex,
      currentSubChainIndex + 1,
      0,
    ];
    const nextChainPointer: SequencePointer = [currentChainIndex + 1, 0, -1];

    return (
      (this.getNodeByPointer(nextNodePointer) && nextNodePointer) ||
      (this.getNodeByPointer(nextSubChainPointer) && nextSubChainPointer) ||
      (this.getNodeByPointer(nextChainPointer) && nextChainPointer) ||
      this.caretPosition
    );
  }

  private static get previousCaretPosition() {
    const currentChainIndex = SequenceRenderer.caretPosition[0];
    const currentSubChainIndex = SequenceRenderer.caretPosition[1];
    const currentNodeIndex = SequenceRenderer.caretPosition[2];
    const previousNodePointer: SequencePointer = [
      currentChainIndex,
      currentSubChainIndex,
      currentNodeIndex - 1,
    ];
    const previousSubChainPointer: SequencePointer = [
      currentChainIndex,
      currentSubChainIndex - 1,
      this.getSubChainByPointer([
        currentChainIndex,
        currentSubChainIndex - 1,
        -1,
      ])?.nodes.length - 1,
    ];
    const previousChainPointer: SequencePointer = [
      currentChainIndex - 1,
      this.getChainByPointer([currentChainIndex - 1, -1, -1])?.subChains
        .length - 1,
      this.getSubChainByPointer([
        currentChainIndex - 1,
        this.getChainByPointer([currentChainIndex - 1, -1, -1])?.subChains
          .length - 1,
        -1,
      ])?.nodes.length - 1,
    ];

    return (
      (this.getNodeByPointer(previousNodePointer) && previousNodePointer) ||
      (this.getNodeByPointer(previousSubChainPointer) &&
        previousSubChainPointer) ||
      (currentNodeIndex === 0 && [
        currentChainIndex,
        currentSubChainIndex,
        -1,
      ]) ||
      (this.getNodeByPointer(previousChainPointer) && previousChainPointer) ||
      this.caretPosition
    );
  }

  public static get isCarretBeforeChain() {
    return this.caretPosition[2] === -1;
  }
}
