/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-use-before-define */
import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { MultitailArrow } from 'domain/entities/multitailArrow';
import { OperationType } from 'application/editor/operations/OperationType';
import { ReStruct, ReMultitailArrow } from 'application/render';
import { MULTITAIL_ARROW_KEY } from 'domain/constants';

interface MultitailArrowUpsertData {
  id?: number;
  arrowId?: number;
}

interface MultitailArrowDeleteData {
  id: number;
  arrowId?: number;
}

export class MultitailArrowUpsert extends BaseOperation {
  readonly data: MultitailArrowUpsertData;
  constructor(
    private readonly multitailArrow: MultitailArrow,
    id?: number,
    arrowId?: number,
  ) {
    super(OperationType.MULTITAIL_ARROW_UPSERT);
    this.data = { id, arrowId };
  }

  execute(reStruct: ReStruct) {
    const struct = reStruct.molecule;

    if (this.data.id === undefined) {
      this.data.id = struct.multitailArrows.newId();
    }
    const id = this.data.id;
    const item = this.multitailArrow.clone();
    item.arrowId = this.data.arrowId;
    struct.setMultitailArrow(id, item);
    this.data.arrowId = item.arrowId;
    reStruct.multitailArrows.set(id, new ReMultitailArrow(item));

    BaseOperation.invalidateItem(reStruct, MULTITAIL_ARROW_KEY, id, 1);
  }

  invert(): BaseOperation {
    return new MultitailArrowDelete(this.data.id!);
  }
}

export class MultitailArrowDelete extends BaseOperation {
  private multitailArrow?: MultitailArrow;
  readonly data: MultitailArrowDeleteData;
  constructor(id: number) {
    super(OperationType.MULTITAIL_ARROW_DELETE);
    this.data = { id };
  }

  execute(reStruct: ReStruct) {
    const reMultitailArrow = reStruct.multitailArrows.get(this.data.id);

    if (!reMultitailArrow) {
      return;
    }

    this.multitailArrow = reMultitailArrow.multitailArrow.clone();
    this.data.arrowId = reMultitailArrow.multitailArrow.arrowId;
    reStruct.clearVisel(reMultitailArrow.visel);
    reStruct.markItemRemoved();
    reStruct.multitailArrows.delete(this.data.id);
    reStruct.molecule.multitailArrows.delete(this.data.id);
  }

  invert(): BaseOperation {
    return new MultitailArrowUpsert(
      this.multitailArrow!,
      this.data.id,
      this.data.arrowId,
    );
  }
}
