import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { BackBoneBondSequenceRenderer } from 'application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { Vec2 } from 'domain/entities/vec2';
import { isMonomerConnectedToR2RnaBase } from 'domain/helpers/monomers';
import { AttachmentPointName } from 'domain/types';
import { BaseMonomer } from './BaseMonomer';

export class PolymerBond extends DrawingEntity {
  public secondMonomer?: BaseMonomer;
  public renderer?:
    | BackBoneBondSequenceRenderer
    | FlexModePolymerBondRenderer
    | PolymerBondRenderer
    | PolymerBondSequenceRenderer
    | SnakeModePolymerBondRenderer = undefined;

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
      | BackBoneBondSequenceRenderer
      | FlexModePolymerBondRenderer
      | PolymerBondRenderer
      | PolymerBondSequenceRenderer
      | SnakeModePolymerBondRenderer,
  ): void {
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

  public get firstMonomerAttachmentPoint() {
    return this.firstMonomer.getAttachmentPointByBond(this);
  }

  public get secondMonomerAttachmentPoint() {
    return this.secondMonomer?.getAttachmentPointByBond(this);
  }

  public get isSideChainConnection() {
    const firstMonomerAttachmentPoint = this.firstMonomerAttachmentPoint;
    const secondMonomerAttachmentPoint = this.secondMonomerAttachmentPoint;

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
        (isMonomerConnectedToR2RnaBase(this.firstMonomer) &&
          this.secondMonomer instanceof RNABase) ||
        (isMonomerConnectedToR2RnaBase(this.secondMonomer) &&
          this.firstMonomer instanceof RNABase) ||
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
