import { BaseMonomer } from './BaseMonomer';
import { MonomerItemType } from 'domain/types';
import { Vec2 } from './vec2';
import { Sugar } from './Sugar';

export class Phosphate extends BaseMonomer {
  constructor(monomerItem: MonomerItemType, _position?: Vec2) {
    super(monomerItem, _position);
  }

  public getValidSourcePoint(secondMonomer: BaseMonomer) {
    if (
      secondMonomer instanceof Sugar &&
      secondMonomer.isAttachmentPointExistAndFree('R2') &&
      this.isAttachmentPointExistAndFree('R1')
    ) {
      return 'R1';
    }

    if (
      secondMonomer instanceof Sugar &&
      !secondMonomer.isAttachmentPointExistAndFree('R2') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }

    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer) {
    // same implementation for both source and target attachment points
    return this.getValidSourcePoint(firstMonomer);
  }
}
