import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { KetMonomerClass } from 'application/formatters';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';

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
}
