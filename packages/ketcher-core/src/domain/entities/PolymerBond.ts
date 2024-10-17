import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { BackBoneBondSequenceRenderer } from 'application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { Sugar } from 'domain/entities/Sugar';
import {
  isMonomerConnectedToR2RnaBase,
  isRnaBaseOrAmbiguousRnaBase,
} from 'domain/helpers/monomers';
import { AttachmentPointName } from 'domain/types';
import { BaseMonomer } from './BaseMonomer';
import { BaseBond } from 'domain/entities/BaseBond';

type FlexOrSequenceOrSnakeModePolymerBondRenderer =
  | BackBoneBondSequenceRenderer
  | FlexModePolymerBondRenderer
  | PolymerBondSequenceRenderer
  | SnakeModePolymerBondRenderer;

export class PolymerBond extends BaseBond {
  public secondMonomer?: BaseMonomer;
  public renderer?: FlexOrSequenceOrSnakeModePolymerBondRenderer = undefined;

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
    renderer: FlexOrSequenceOrSnakeModePolymerBondRenderer,
  ): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
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
          isRnaBaseOrAmbiguousRnaBase(this.secondMonomer)) ||
        (isMonomerConnectedToR2RnaBase(this.secondMonomer) &&
          isRnaBaseOrAmbiguousRnaBase(this.firstMonomer)) ||
        firstMonomerAttachmentPoint === secondMonomerAttachmentPoint) &&
      !(
        (firstMonomerAttachmentPoint === AttachmentPointName.R1 &&
          isRnaBaseOrAmbiguousRnaBase(this.firstMonomer) &&
          secondMonomerAttachmentPoint === AttachmentPointName.R3 &&
          this.secondMonomer instanceof Sugar) ||
        (firstMonomerAttachmentPoint === AttachmentPointName.R3 &&
          this.firstMonomer instanceof Sugar &&
          secondMonomerAttachmentPoint === AttachmentPointName.R1 &&
          isRnaBaseOrAmbiguousRnaBase(this.secondMonomer))
      )
    );
  }

  get firstEndEntity(): BaseMonomer {
    return this.firstMonomer;
  }

  get secondEndEntity(): BaseMonomer | undefined {
    return this.secondMonomer;
  }

  public getAnotherMonomer(monomer: BaseMonomer): BaseMonomer | undefined {
    return super.getAnotherEntity(monomer) as BaseMonomer;
  }
}
