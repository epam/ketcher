/* eslint-disable @typescript-eslint/no-use-before-define,@typescript-eslint/no-non-null-assertion */
import { BaseOperation } from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { FixedPrecisionCoordinates } from 'domain/entities';

export class MultitailArrowAddTail extends BaseOperation {
  constructor(
    private itemId: number,
    private tailId?: number,
    private coordinate?: FixedPrecisionCoordinates,
  ) {
    super(OperationType.MULTITAIL_ARROW_ADD_TAIL);
  }

  execute(reStruct: ReStruct) {
    const reMultitailArrow = reStruct.multitailArrows.get(this.itemId);
    const multitailArrow = reStruct.molecule.multitailArrows.get(this.itemId);

    if (!reMultitailArrow || !multitailArrow) {
      return;
    }
    this.tailId = multitailArrow.addTail(this.tailId, this.coordinate);
    BaseOperation.invalidateItem(reStruct, 'multitailArrows', this.itemId, 1);
  }

  invert() {
    return new MultitailArrowRemoveTail(this.itemId, this.tailId!);
  }
}

export class MultitailArrowRemoveTail extends BaseOperation {
  private coordinate?: FixedPrecisionCoordinates;
  constructor(private itemId: number, private tailId: number) {
    super(OperationType.MULTITAIL_ARROW_REMOVE_TAIL);
  }

  execute(reStruct: ReStruct) {
    const reMultitailArrow = reStruct.multitailArrows.get(this.itemId);
    const multitailArrow = reStruct.molecule.multitailArrows.get(this.itemId);
    this.coordinate = multitailArrow?.getTailCoordinate(this.tailId);

    if (!reMultitailArrow || !multitailArrow || !this.coordinate) {
      return;
    }

    multitailArrow.removeTail(this.tailId);
    BaseOperation.invalidateItem(reStruct, 'multitailArrows', this.itemId, 1);
  }

  invert(): BaseOperation {
    return new MultitailArrowAddTail(this.itemId, this.tailId, this.coordinate);
  }
}
