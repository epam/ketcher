import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Sugar } from './Sugar';

export class RNABase extends BaseMonomer {
  public getValidSourcePoint(monomer: BaseMonomer) {
    return this.firstFreeAttachmentPoint || '';
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    if (monomer instanceof Sugar) {
      return 'R3';
    }
    return this.firstFreeAttachmentPoint || '';
  }
}
