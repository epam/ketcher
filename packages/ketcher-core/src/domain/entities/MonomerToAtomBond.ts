import type { Atom } from 'domain/entities/CoreAtom';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { BaseRenderer } from 'application/render';
import type { MonomerToAtomBondRenderer } from 'application/render/renderers/MonomerToAtomBondRenderer';
import type { MonomerToAtomBondSequenceRenderer } from 'application/render/renderers/sequence/MonomerToAtomBondSequenceRenderer';
import { BaseBond } from './BaseBond';

export class MonomerToAtomBond extends BaseBond {
  public renderer?:
    | MonomerToAtomBondRenderer
    | MonomerToAtomBondSequenceRenderer = undefined;

  constructor(public monomer: BaseMonomer, public atom: Atom) {
    super();
  }

  public setRenderer(
    renderer: MonomerToAtomBondRenderer | MonomerToAtomBondSequenceRenderer,
  ): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  get firstEndEntity(): BaseMonomer {
    return this.monomer;
  }

  get secondEndEntity(): Atom {
    return this.atom;
  }

  public get isHorizontal() {
    return false;
  }

  public get isVertical() {
    return false;
  }
}
