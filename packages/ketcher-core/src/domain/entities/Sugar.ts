import { BaseMonomer } from './BaseMonomer';
import { RNABase } from './RNABase';
import { Phosphate } from './Phosphate';

export class Sugar extends BaseMonomer {
  public getValidSourcePoint(secondMonomer: BaseMonomer) {
    if (
      secondMonomer instanceof RNABase &&
      this.isAttachmentPointExistAndFree('R3')
    ) {
      return 'R3';
    }

    if (
      secondMonomer instanceof Phosphate &&
      secondMonomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R2')
    ) {
      return 'R2';
    }

    if (
      secondMonomer instanceof Phosphate &&
      !secondMonomer.isAttachmentPointExistAndFree('R1') &&
      this.isAttachmentPointExistAndFree('R1')
    ) {
      return 'R1';
    }

    return this.firstFreeAttachmentPoint;
  }

  public getValidTargetPoint(firstMonomer: BaseMonomer) {
    // same implementation for both source and target attachment points
    return this.getValidSourcePoint(firstMonomer);
  }
}
