import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { KetMonomerClass } from 'application/formatters';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';

export class AmbiguousSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    // Ambiguous monomers (alternatives and mixed) should display @ symbol for non-peptide types
    if (
      this.node.monomer instanceof AmbiguousMonomer &&
      this.node.monomer.monomerClass !== KetMonomerClass.AminoAcid
    ) {
      return '@';
    }
    return this.node.monomer.label;
  }

  protected drawModification() {}
}
