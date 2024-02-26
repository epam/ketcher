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

export class SequenceRenderer {
  private static caretPosition: [number, number, number] = [-1, -1, -1];
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
              nodeIndex === SequenceRenderer.caretPosition[2],
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

  public static setCaretPosition(caretPosition: [number, number, number]) {
    const oldSubChainNode =
      SequenceRenderer.chainsCollection.chains[caretPosition[0]]?.subChains[
        caretPosition[1]
      ]?.nodes[caretPosition[2]];
    if (oldSubChainNode) {
      oldSubChainNode.monomer.renderer.isEditting = false;
      oldSubChainNode.monomer.renderer?.remove();
      oldSubChainNode.monomer.renderer?.show();
    }
    SequenceRenderer.caretPosition = caretPosition;
    const subChainNode =
      SequenceRenderer.chainsCollection.chains[caretPosition[0]].subChains[
        caretPosition[1]
      ].nodes[caretPosition[2]];

    subChainNode.monomer.renderer.isEditting = true;
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
}
