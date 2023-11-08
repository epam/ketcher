import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class RNABase extends BaseMonomer {
  public getValidSourcePoint(monomer: BaseMonomer) {
    return monomer.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    return monomer.firstFreeAttachmentPoint;
  }
}