import { Peptide } from 'domain/entities/Peptide';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Vec2 } from 'domain/entities/vec2';

export class PolymerBond extends DrawingEntity {
  public secondMonomer?: Peptide;
  public renderer?: PolymerBondRenderer;
  public endPosition: Vec2 = new Vec2();

  constructor(public firstMonomer) {
    super();
    this.firstMonomer = firstMonomer;
  }

  public setFirstMonomer(monomer: Peptide) {
    this.firstMonomer = monomer;
  }

  public setSecondMonomer(monomer: Peptide) {
    this.secondMonomer = monomer;
  }

  public setRenderer(renderer: PolymerBondRenderer) {
    this.renderer = renderer;
  }

  public get finished() {
    return Boolean(this.firstMonomer && this.secondMonomer);
  }

  public moveToLinkedMonomers() {
    const firstMonomerCenter = this.firstMonomer.renderer.center;
    const secondMonomerCenter = this.secondMonomer?.renderer?.center;
    this.moveBondStartAbsolute(firstMonomerCenter.x, firstMonomerCenter.y);
    if (secondMonomerCenter) {
      this.moveBondEndAbsolute(secondMonomerCenter.x, secondMonomerCenter.y);
    }
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

  public override turnOnSelection() {
    super.turnOnSelection();
    this.firstMonomer.turnOnSelection();
    this.secondMonomer?.turnOnSelection();
  }

  public override turnOffSelection() {
    super.turnOffSelection();
    this.firstMonomer.turnOffSelection();
    this.secondMonomer?.turnOffSelection();
  }
}
