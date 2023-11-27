import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from './BaseMonomer';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';

export class PolymerBond extends DrawingEntity {
  public secondMonomer?: BaseMonomer;
  public renderer?: PolymerBondRenderer = undefined;
  public endPosition: Vec2 = new Vec2();

  constructor(public firstMonomer: BaseMonomer) {
    super();
    this.firstMonomer = firstMonomer;
  }

  public setFirstMonomer(monomer: BaseMonomer) {
    this.firstMonomer = monomer;
  }

  public setSecondMonomer(monomer: BaseMonomer) {
    this.secondMonomer = monomer;
  }

  public setRenderer(renderer: PolymerBondRenderer) {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public get finished() {
    return Boolean(this.firstMonomer && this.secondMonomer);
  }

  public get center() {
    return Vec2.centre(this.startPosition, this.endPosition);
  }

  public moveToLinkedMonomers() {
    const firstMonomerCenter = this.firstMonomer.position;
    const secondMonomerCenter = this.secondMonomer?.position;
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
}
