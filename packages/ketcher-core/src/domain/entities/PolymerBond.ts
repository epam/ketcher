import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { BackBoneBondSequenceRenderer } from 'application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
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
    // • Not RNA base [R2] — [R1] Not RNA base
    // • Not RNA base [R1] — [R2] Not RNA base
    // • Sugar [R3] — [R1] RNA base
    // • [R1] RNA base — Sugar [R3]
    if (!this.secondMonomer) {
      return true;
    }

    const firstMonomer = this.firstMonomer;
    const secondMonomer = this.secondMonomer;
    const firstMonomerAttachmentPoint =
      firstMonomer.getAttachmentPointByBond(this);
    const secondMonomerAttachmentPoint =
      secondMonomer.getAttachmentPointByBond(this);
    if (!firstMonomerAttachmentPoint || !secondMonomerAttachmentPoint) {
      return true;
    }

    const thereAreR1AndR2 =
      (firstMonomerAttachmentPoint === AttachmentPointName.R2 &&
        secondMonomerAttachmentPoint === AttachmentPointName.R1) ||
      (firstMonomerAttachmentPoint === AttachmentPointName.R1 &&
        secondMonomerAttachmentPoint === AttachmentPointName.R2);
    const thereAreNotRNABase =
      !(firstMonomer instanceof RNABase) || !(secondMonomer instanceof RNABase);
    if (thereAreR1AndR2 && thereAreNotRNABase) {
      return true;
    }

    let thereAreSugarWithR3AndRNABaseWithR1 =
      firstMonomer instanceof Sugar &&
      firstMonomerAttachmentPoint === AttachmentPointName.R3 &&
      secondMonomer instanceof RNABase &&
      secondMonomerAttachmentPoint === AttachmentPointName.R1;
    thereAreSugarWithR3AndRNABaseWithR1 ||=
      secondMonomer instanceof Sugar &&
      secondMonomerAttachmentPoint === AttachmentPointName.R3 &&
      firstMonomer instanceof RNABase &&
      firstMonomerAttachmentPoint === AttachmentPointName.R1;
    return thereAreSugarWithR3AndRNABaseWithR1;
  }

  public get isSideChainConnection(): boolean {
    return !this.isBackboneChainConnection;
  }
}
