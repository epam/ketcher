import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class RNABase extends BaseMonomer {
  public getValidSourcePoint(_monomer: BaseMonomer) {
    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(_monomer: BaseMonomer) {
    return this.firstFreeAttachmentPoint;
  }
}
