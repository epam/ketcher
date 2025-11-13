import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { KetMonomerClass } from 'application/formatters';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';

export class AmbiguousSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    // Ambiguous CHEM monomers should display @ symbol
    if (
      this.node.monomer instanceof AmbiguousMonomer &&
      this.node.monomer.monomerClass === KetMonomerClass.CHEM
    ) {
      return '@';
    }
    return this.node.monomer.label;
  }

  protected drawModification() {}

  /**
   * Checks if this node should be hidden because it's a consecutive ambiguous CHEM
   * following another ambiguous CHEM. Only the first ambiguous CHEM in a sequence
   * of consecutive ambiguous CHEMs should be shown.
   */
  private shouldHideConsecutiveAmbiguousChem(): boolean {
    if (
      !(this.node.monomer instanceof AmbiguousMonomer) ||
      this.node.monomer.monomerClass !== KetMonomerClass.CHEM
    ) {
      return false;
    }

    // Get the nodes from the chain
    const nodes = this.currentChain.nodes;
    const currentNode = this.node as AmbiguousMonomerSequenceNode;
    const currentNodeIndex = nodes.findIndex((node) => node === currentNode);

    // If this is the first node, show it
    if (currentNodeIndex === 0 || currentNodeIndex === -1) {
      return false;
    }

    // Check if the previous node is also an ambiguous CHEM
    const previousNode = nodes[currentNodeIndex - 1];
    if (
      previousNode instanceof AmbiguousMonomerSequenceNode &&
      previousNode.monomer instanceof AmbiguousMonomer &&
      previousNode.monomer.monomerClass === KetMonomerClass.CHEM
    ) {
      // Hide this node as it's consecutive to another ambiguous CHEM
      return true;
    }

    return false;
  }

  public show(): void {
    // Don't show if this is a consecutive ambiguous CHEM
    if (this.shouldHideConsecutiveAmbiguousChem()) {
      return;
    }

    super.show();
  }
}
