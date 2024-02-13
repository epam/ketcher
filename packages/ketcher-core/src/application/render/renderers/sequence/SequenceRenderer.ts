import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { SequenceNodeRendererFactory } from 'application/render/renderers/sequence/SequenceNodeRendererFactory';
import { BaseMonomer, RNABase, Sugar, Vec2 } from 'domain/entities';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { AttachmentPointName } from 'domain/types';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { getRnaBaseFromSugar } from 'domain/helpers/monomers';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';

export class SequenceRenderer {
  public static show(chainsCollection: ChainsCollection) {
    const firstNode = chainsCollection.firstNode;

    if (!firstNode) {
      return;
    }

    let currentChainStartPosition = new Vec2(
      firstNode.monomer.renderer?.scaledMonomerPosition.x,
      firstNode.monomer.renderer?.scaledMonomerPosition.y,
    );

    let currentMonomerIndexInChain = 0;
    let currentMonomerNumberInSubChain = 0;

    chainsCollection.chains.forEach((chain) => {
      currentMonomerIndexInChain = 0;
      chain.subChains.forEach((subChain) => {
        currentMonomerNumberInSubChain = 0;
        subChain.nodes.forEach((node) => {
          const renderer = SequenceNodeRendererFactory.fromNode(
            node,
            currentChainStartPosition,
            currentMonomerIndexInChain,
            currentMonomerNumberInSubChain,
          );
          renderer.show();
          node.monomer.renderer = renderer;
          currentMonomerIndexInChain++;
          currentMonomerNumberInSubChain++;
        });
      });

      currentChainStartPosition = new Vec2(
        currentChainStartPosition.x,
        currentChainStartPosition.y + 100 + 30 * Math.floor(chain.length / 30),
      );
    });

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
            const anotherMonomer = polymerBond.getAnotherMonomer(node.monomer);

            if (!polymerBond.isSideChainConnection) {
              return;
            }

            const handledAttachmentPoints =
              handledMonomersToAttachmentPoints.get(node.monomer);

            if (handledAttachmentPoints.has(attachmentPointName)) {
              return;
            }

            // Special case for sugar + base connections. Need to move somewhere
            // TODO if base R2 -> sugar R1 - handle as side connection
            if (
              (node.monomer instanceof Sugar &&
                getRnaBaseFromSugar(node.monomer) === anotherMonomer) ||
              (anotherMonomer instanceof Sugar &&
                getRnaBaseFromSugar(anotherMonomer) === node.monomer)
            ) {
              return;
            }

            const bondRenderer = new PolymerBondSequenceRenderer(polymerBond);
            bondRenderer.show();
            polymerBond.setRenderer(bondRenderer);
            handledAttachmentPoints.add(attachmentPointName);

            if (!handledMonomersToAttachmentPoints.get(anotherMonomer)) {
              handledMonomersToAttachmentPoints.set(anotherMonomer, new Set());
            }
            const anotherMonomerHandledAttachmentPoints =
              handledMonomersToAttachmentPoints.get(anotherMonomer);

            anotherMonomerHandledAttachmentPoints.add(
              anotherMonomer?.getAttachmentPointByBond(polymerBond),
            );
          });
        });
      });
    });
  }
}
