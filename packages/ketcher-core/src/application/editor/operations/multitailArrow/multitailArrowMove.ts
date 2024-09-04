import { Vec2 } from 'domain/entities';
import { OperationType } from 'application/editor';
import { Scale } from 'domain/helpers';
import { ReStruct } from 'application/render';
import BaseOperation from 'application/editor/operations/base';

export class MultitailArrowMove extends BaseOperation {
  constructor(private id: number, private offset: Vec2) {
    super(OperationType.MULTITAIL_ARROW_MOVE);
  }

  execute(reStruct: ReStruct) {
    const renderItem = reStruct.multitailArrows.get(this.id);
    const item = reStruct.molecule.multitailArrows.get(this.id);

    if (!item || !renderItem) {
      return;
    }
    const scaledOffset = Scale.modelToCanvas(
      this.offset,
      reStruct.render.options,
    );

    renderItem.visel.translate(scaledOffset);
    item.move(this.offset);
  }

  invert() {
    return new MultitailArrowMove(this.id, this.offset.negated());
  }
}
