import { BaseOperation } from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { MULTITAIL_ARROW_KEY } from 'domain/constants';

export class MultitailArrowResizeTailHead extends BaseOperation {
  constructor(
    private id: number,
    private offset: number,
    private isHead: boolean,
  ) {
    super(OperationType.MULTITAIL_ARROW_RESIZE_HEAD_TAIL);
  }

  execute(reStruct: ReStruct) {
    const multitailArrow = reStruct.molecule.multitailArrows.get(this.id);
    if (!multitailArrow) {
      return;
    }
    this.offset = this.isHead
      ? multitailArrow.resizeHead(this.offset)
      : multitailArrow.resizeTails(this.offset);
    BaseOperation.invalidateItem(reStruct, MULTITAIL_ARROW_KEY, this.id, 1);
  }

  invert(): BaseOperation {
    return new MultitailArrowResizeTailHead(this.id, -this.offset, this.isHead);
  }
}
