import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { KetMonomerClass } from 'application/formatters';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';

export class AmbiguousSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    // Ambiguous CHEM monomers (alternatives and mixed) should display @ symbol
    // Check if this is an ambiguous monomer with CHEM class
    if (!(this.node.monomer instanceof AmbiguousMonomer)) {
      return this.node.monomer.label;
    }

    const ambiguousMonomer = this.node.monomer as AmbiguousMonomer;

    // For CHEM class ambiguous monomers, display @ symbol
    // Note: Mixed ambiguous monomers (containing different monomer types) are also classified as CHEM
    if (ambiguousMonomer.monomerClass === KetMonomerClass.CHEM) {
      return '@';
    }

    // For other ambiguous monomers (bases, peptides, sugars, etc.), display the label (typically '%')
    return ambiguousMonomer.label;
  }

  protected drawModification() {}
}
