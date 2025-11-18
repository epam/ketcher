import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { KetMonomerClass } from 'application/formatters';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';

export class AmbiguousSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    const ambiguousMonomer = this.node.monomer as AmbiguousMonomer;

    // Ambiguous CHEM and Sugar monomers should display @ symbol
    if (
      ambiguousMonomer.monomerClass === KetMonomerClass.CHEM ||
      ambiguousMonomer.monomerClass === KetMonomerClass.Sugar
    ) {
      return '@';
    }
    return ambiguousMonomer.label;
  }

  protected drawModification() {}
}
