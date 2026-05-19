import { Vec2 } from 'domain/entities/vec2';
import { OperationType } from 'application/editor/operations/OperationType';
import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { ReStruct } from 'application/render';
import { Scale } from 'domain/helpers';

export class ImageMove extends BaseOperation {
  constructor(private readonly id: number, private readonly offset: Vec2) {
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
