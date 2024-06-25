import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { BackBoneBondSequenceRenderer } from 'application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName } from 'domain/types';

export class PolymerBond extends DrawingEntity {
  public secondMonomer?: BaseMonomer;
  public renderer?:
    | PolymerBondRenderer
    | BackBoneBondSequenceRenderer
    | PolymerBondSequenceRenderer = undefined;

  public endPosition: Vec2 = new Vec2();

  constructor(public firstMonomer: BaseMonomer, secondMonomer?: BaseMonomer) {
    super();
    this.firstMonomer = firstMonomer;
    this.secondMonomer = secondMonomer;
  }

  public setFirstMonomer(monomer: BaseMonomer) {
    this.firstMonomer = monomer;
  }

  public setSecondMonomer(monomer: BaseMonomer) {
    this.secondMonomer = monomer;
  }

  public setRenderer(
    renderer:
      | PolymerBondRenderer
      | BackBoneBondSequenceRenderer
      | PolymerBondSequenceRenderer,
  ) {
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

  public getAnotherMonomer(monomer: BaseMonomer): BaseMonomer | undefined {
    return this.firstMonomer === monomer
      ? this.secondMonomer
      : this.firstMonomer;
  }

  public get isBackboneChainConnection(): boolean {
    // Variants:
    // • Sugar [R2] — [R1] Phosphate
    // • Sugar [R1] — [R2] Phosphate
    // • Phosphate [R2] — [R1] Sugar
    // • Phosphate [R1] — [R2] Sugar
    // • Sugar [R3] — [R1] RNA base
    // • RNA base [R1] — [R3] Sugar
    if (!this.secondMonomer) {
      return true;
    }

    let sugarMonomer: Sugar;
    let anotherMonomer: BaseMonomer;
    if (this.firstMonomer instanceof Sugar) {
      sugarMonomer = this.firstMonomer;
      anotherMonomer = this.secondMonomer;
    } else if (this.secondMonomer instanceof Sugar) {
      sugarMonomer = this.secondMonomer;
      anotherMonomer = this.firstMonomer;
    } else {
      return false;
    }

    const sugarMonomerAttachmentPoint =
      sugarMonomer.getAttachmentPointByBond(this);
    const anotherMonomerAttachmentPoint =
      anotherMonomer.getAttachmentPointByBond(this);
    if (!sugarMonomerAttachmentPoint || !anotherMonomerAttachmentPoint) {
      return true;
    }

    const thereArePhosphateAndSugar = anotherMonomer instanceof Phosphate;
    const thereAreR1AndR2 =
      (sugarMonomerAttachmentPoint === AttachmentPointName.R2 &&
        anotherMonomerAttachmentPoint === AttachmentPointName.R1) ||
      (sugarMonomerAttachmentPoint === AttachmentPointName.R1 &&
        anotherMonomerAttachmentPoint === AttachmentPointName.R2);
    if (thereArePhosphateAndSugar && thereAreR1AndR2) {
      return true;
    }

    return (
      sugarMonomerAttachmentPoint === AttachmentPointName.R3 &&
      anotherMonomer instanceof RNABase &&
      anotherMonomerAttachmentPoint === AttachmentPointName.R1
    );
  }

  public get isSideChainConnection(): boolean {
    return !this.isBackboneChainConnection;
  }
}
