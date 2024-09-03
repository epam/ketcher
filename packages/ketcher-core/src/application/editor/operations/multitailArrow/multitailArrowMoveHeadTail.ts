import { BaseOperation } from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { MultitailArrowRefName, ReStruct } from 'application/render';
import { MULTITAIL_ARROW_KEY } from 'domain/constants';

export class MultitailArrowMoveHeadTail extends BaseOperation {
  constructor(
    private id: number,
    private offset: number,
    private name: string,
    private tailId: number | null,
    private normalize?: true,
  ) {
    super(OperationType.MULTITAIL_ARROW_MOVE_HEAD_TAIL);
  }

  execute(reStruct: ReStruct) {
    const reMultitailArrow = reStruct.multitailArrows.get(this.id);
    const multitailArrow = reStruct.molecule.multitailArrows.get(this.id);
    if (!multitailArrow || !reMultitailArrow) {
      return;
    }
    switch (this.name) {
      case MultitailArrowRefName.HEAD:
        this.offset = multitailArrow.moveHead(this.offset);
        break;
      case MultitailArrowRefName.TOP_TAIL:
        this.offset = multitailArrow.moveTail(this.offset, this.name);
        break;
      case MultitailArrowRefName.BOTTOM_TAIL:
        this.offset = multitailArrow.moveTail(this.offset, this.name);
        break;
      default:
        this.offset = multitailArrow.moveTail(
          this.offset,
          this.tailId as number,
          this.normalize,
        );
    }
    BaseOperation.invalidateItem(reStruct, MULTITAIL_ARROW_KEY, this.id, 1);
  }

  invert(): BaseOperation {
    return new MultitailArrowMoveHeadTail(
      this.id,
      -this.offset,
      this.name,
      this.tailId,
    );
  }
}
