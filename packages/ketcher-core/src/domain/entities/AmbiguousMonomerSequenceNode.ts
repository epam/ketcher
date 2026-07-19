import type { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { KetMonomerClass } from 'domain/constants/monomers';

export class AmbiguousMonomerSequenceNode {
  constructor(public monomer: AmbiguousMonomer) {}

  public get SubChainConstructor() {
    return this.monomer.SubChainConstructor;
  }

  public get firstMonomerInNode() {
    return this.monomer;
  }

  public get lastMonomerInNode() {
    return this.monomer;
  }

  public get monomers() {
    return [this.monomer];
  }

  /**
   * Returns true if this node contains only phosphate monomers.
   * For ambiguous monomers, checks if the resolved monomerClass is Phosphate.
   */
  public get isPhosphateOnly() {
    return this.monomer.monomerClass === KetMonomerClass.Phosphate;
  }

  public get renderer() {
    return this.monomer.renderer;
  }

  public get modified() {
    return this.monomer.isModification;
  }
}
