import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { BaseMonomer } from './BaseMonomer';
import { BaseBond } from './BaseBond';

export class HydrogenBond extends BaseBond {
  public secondMonomer?: BaseMonomer;
  public renderer?: SnakeModePolymerBondRenderer = undefined;

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

  public setRenderer(renderer: SnakeModePolymerBondRenderer): void {
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
