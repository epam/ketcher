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
            subChain,
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
              subChain.bonds.push(polymerBond);
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
}
