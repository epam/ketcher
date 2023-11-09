import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class RNABase extends BaseMonomer {
  public getValidSourcePoint() {
    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint() {
    return this.firstFreeAttachmentPoint;
  }
}
