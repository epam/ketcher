import { BaseOperation } from 'application/editor/operations/base';
import { Vec2 } from 'domain/entities';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { Scale } from 'domain/helpers';

export class ImageMove extends BaseOperation {
  constructor(private id: number, private offset: Vec2) {
    super(OperationType.IMAGE_MOVE);
  }

  execute(reStruct: ReStruct) {
    const renderItem = reStruct.images.get(this.id);
    const item = reStruct.molecule.images.get(this.id);

    if (!item || !renderItem) {
      return;
    }
    const scaledOffset = Scale.modelToCanvas(
      this.offset,
      reStruct.render.options,
    );

    renderItem.visel.translate(scaledOffset);
    item.addPositionOffset(this.offset);
  }

  invert(): BaseOperation {
    return new ImageMove(this.id, this.offset.negated());
  }
}
