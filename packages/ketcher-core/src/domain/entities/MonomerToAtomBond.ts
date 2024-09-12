import { Vec2 } from 'domain/entities/vec2';
import { Atom } from 'domain/entities/CoreAtom';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { BaseRenderer } from 'application/render';
import { MonomerToAtomBondRenderer } from 'application/render/renderers/MonomerToAtomBondRenderer';

export class MonomerToAtomBond extends DrawingEntity {
  public endPosition: Vec2 = new Vec2();
  public renderer?: MonomerToAtomBondRenderer = undefined;

  constructor(public monomer: BaseMonomer, public atom: Atom) {
    super();
  }

  public setRenderer(renderer: MonomerToAtomBondRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public moveBondStartAbsolute(x, y) {
    this.moveAbsolute(new Vec2(x, y));
  }

  public moveBondEndAbsolute(x, y) {
    this.endPosition = new Vec2(x, y);
  }

  public get startPosition() {
    return this.position;
  }

  public moveToLinkedMonomerAndAtom() {
    const firstMonomerCenter = this.monomer.position;
    const secondMonomerCenter = this.atom?.position;
    this.moveBondStartAbsolute(firstMonomerCenter.x, firstMonomerCenter.y);
    if (secondMonomerCenter) {
      this.moveBondEndAbsolute(secondMonomerCenter.x, secondMonomerCenter.y);
    }
  }
}
