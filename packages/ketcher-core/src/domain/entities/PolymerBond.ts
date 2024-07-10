import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from './BaseMonomer';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { AttachmentPointName } from 'domain/types';
import { BackBoneBondSequenceRenderer } from 'application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { Sugar } from 'domain/entities/Sugar';
import { RNABase } from 'domain/entities/RNABase';

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

  public static get backBoneChainAttachmentPoints() {
    return [AttachmentPointName.R1, AttachmentPointName.R2];
  }

  public get isBackBoneChainConnection() {
    return !this.isSideChainConnection;
  }

  public get isSideChainConnection() {
    const firstMonomerAttachmentPoint =
      this.firstMonomer.getAttachmentPointByBond(this);
    const secondMonomerAttachmentPoint =
      this.secondMonomer?.getAttachmentPointByBond(this);

    if (!firstMonomerAttachmentPoint || !secondMonomerAttachmentPoint) {
      return false;
    }

    return (
      (!(
        PolymerBond.backBoneChainAttachmentPoints.includes(
          firstMonomerAttachmentPoint,
        ) &&
        PolymerBond.backBoneChainAttachmentPoints.includes(
          secondMonomerAttachmentPoint,
        )
      ) ||
        firstMonomerAttachmentPoint === secondMonomerAttachmentPoint) &&
      !(
        (firstMonomerAttachmentPoint === AttachmentPointName.R1 &&
          this.firstMonomer instanceof RNABase &&
          secondMonomerAttachmentPoint === AttachmentPointName.R3 &&
          this.secondMonomer instanceof Sugar) ||
        (firstMonomerAttachmentPoint === AttachmentPointName.R3 &&
          this.firstMonomer instanceof Sugar &&
          secondMonomerAttachmentPoint === AttachmentPointName.R1 &&
          this.secondMonomer instanceof RNABase)
      )
    );
  }
}
