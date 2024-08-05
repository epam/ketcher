/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-use-before-define */
import { BaseOperation } from 'application/editor/operations/base';
import { MultitailArrow } from 'domain/entities/multitailArrow';
import { OperationType } from 'application/editor';
import { ReStruct, ReMultitailArrow } from 'application/render';
import { MULTITAIL_ARROW_KEY } from 'domain/constants';

export class MultitailArrowUpsert extends BaseOperation {
  constructor(
    private readonly multitailArrow: MultitailArrow,
    private id?: number,
  ) {
    super(OperationType.MULTITAIL_ARROW_UPSERT);
  }

  execute(reStruct: ReStruct) {
    const struct = reStruct.molecule;

    if (this.id === undefined) {
      this.id = struct.images.newId();
    }
    const id = this.id;
    const item = this.multitailArrow.clone();
    struct.multitailArrows.set(id, item);
    reStruct.multitailArrows.set(id, new ReMultitailArrow(item));

    BaseOperation.invalidateItem(reStruct, MULTITAIL_ARROW_KEY, id, 1);
  }

  invert(): BaseOperation {
    return new MultitailArrowDelete(this.id!);
  }
}

export class MultitailArrowDelete extends BaseOperation {
  private multitailArrow?: MultitailArrow;
  constructor(private id: number) {
    super(OperationType.MULTITAIL_ARROW_DELETE);
  }

  execute(reStruct: ReStruct) {
    const reMultitailArrow = reStruct.multitailArrows.get(this.id);

    if (!reMultitailArrow) {
      return;
    }

    this.multitailArrow = reMultitailArrow.multitailArrow.clone();
    reStruct.clearVisel(reMultitailArrow.visel);
    reStruct.markItemRemoved();
    reStruct.multitailArrows.delete(this.id);
    reStruct.molecule.multitailArrows.delete(this.id);
  }

  invert(): BaseOperation {
    return new MultitailArrowUpsert(this.multitailArrow!, this.id);
  }
}
