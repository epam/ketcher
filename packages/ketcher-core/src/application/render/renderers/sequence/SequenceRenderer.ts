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

export class SequenceRenderer {
  public static show(chainsCollection: ChainsCollection) {
    this.showNodes(chainsCollection);
    this.showBonds(chainsCollection);
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

    chainsCollection.chains.forEach((chain) => {
      currentMonomerIndexInChain = 0;
      chain.subChains.forEach((subChain) => {
        subChain.nodes.forEach((node) => {
          const renderer = SequenceNodeRendererFactory.fromNode(
            node,
            currentChainStartPosition,
            currentMonomerIndexInChain,
            currentMonomerIndexInChain + 1 ===
              chain.subChains.reduce(
                (prev, curr) => prev + curr.nodes.length,
                0,
              ),
          );
          renderer.show();
          node.monomer.setRenderer(renderer);
          currentMonomerIndexInChain++;
        });
      });

      currentChainStartPosition = new Vec2(
        currentChainStartPosition.x,
        currentChainStartPosition.y + 50 + 30 * Math.floor(chain.length / 30),
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
              handledMonomersToAttachmentPoints.get(node.monomer);

            if (handledAttachmentPoints.has(attachmentPointName)) {
              return;
            }

            // Special case for sugar + base connections. Need to move somewhere
            // TODO if base R2 -> sugar R1 - handle as side connection
            const anotherMonomer = polymerBond.getAnotherMonomer(node.monomer);

            if (
              (node.monomer instanceof Sugar &&
                getRnaBaseFromSugar(node.monomer) === anotherMonomer) ||
              (anotherMonomer instanceof Sugar &&
                getRnaBaseFromSugar(anotherMonomer) === node.monomer)
            ) {
              return;
            }

            let bondRenderer;

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
