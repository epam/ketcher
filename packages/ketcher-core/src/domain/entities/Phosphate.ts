import { BaseMonomer } from './BaseMonomer';
import { MonomerItemType } from 'domain/types';
import { Vec2 } from './vec2';
import { Sugar } from './Sugar';

export class Phosphate extends BaseMonomer {
  constructor(monomerItem: MonomerItemType, _position?: Vec2) {
    super(monomerItem, _position);
  }

  public getValidSourcePoint(monomer: BaseMonomer) {
    if (
      monomer instanceof Sugar &&
      this.hasAttachmentPoint('R2') &&
      !this.isAttachmentPointUsed('R2')
    ) {
      return 'R2';
    }
    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    if (
      monomer instanceof Sugar &&
      this.hasAttachmentPoint('R2') &&
      !this.isAttachmentPointUsed('R2')
    ) {
      return 'R2';
    }
    return this.firstFreeAttachmentPoint;
  }
}