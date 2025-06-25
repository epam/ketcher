import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { BaseBond } from './BaseBond';
import { FlexOrSequenceOrSnakeModePolymerBondRenderer } from 'domain/entities/PolymerBond';
import { IBaseMonomer } from './types';

export class HydrogenBond extends BaseBond {
  public renderer?: FlexOrSequenceOrSnakeModePolymerBondRenderer = undefined;

  constructor(
    public firstMonomer: IBaseMonomer,
    public secondMonomer?: IBaseMonomer,
  ) {
    super();
    this.firstMonomer = firstMonomer;
    this.secondMonomer = secondMonomer;
  }

  public setFirstMonomer(monomer: IBaseMonomer) {
    this.firstMonomer = monomer;
  }

  public setSecondMonomer(monomer: IBaseMonomer) {
    this.secondMonomer = monomer;
  }

  public setRenderer(
    renderer: FlexOrSequenceOrSnakeModePolymerBondRenderer,
  ): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public get isBackBoneChainConnection() {
    return false;
  }

  public get firstMonomerAttachmentPoint() {
    return this.firstMonomer.getAttachmentPointByBond(this);
  }

  public get secondMonomerAttachmentPoint() {
    return this.secondMonomer?.getAttachmentPointByBond(this);
  }

  public get isSideChainConnection() {
    return true;
  }

  get firstEndEntity(): IBaseMonomer {
    return this.firstMonomer as IBaseMonomer;
  }

  get secondEndEntity(): IBaseMonomer | undefined {
    return this.secondMonomer;
  }

  public getAnotherMonomer(monomer: IBaseMonomer): IBaseMonomer | undefined {
    return super.getAnotherEntity(monomer) as IBaseMonomer;
  }

  public get isHorizontal() {
    return false;
  }

  public get isVertical() {
    return false;
  }
}
