import { BaseOperation } from 'application/editor/operations/BaseOperation';
import {
  type ImageReferenceName,
  IMAGE_REFERENCE_NAME_TO_HANDLE,
} from 'domain/entities/image';
import { resizeBox } from 'domain/staticObjects/geometry';
import type { Vec2 } from 'domain/entities/vec2';
import type { ReStruct } from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';

export class ImageResize extends BaseOperation {
  private previousPosition: Vec2 | undefined;
  constructor(
    private readonly id: number,
    private readonly position: Vec2,
    private readonly referencePositionName: ImageReferenceName,
  ) {
    super(OperationType.IMAGE_RESIZE);
  }

  execute(reStruct: ReStruct) {
    const item = reStruct.molecule.images.get(this.id);
    const renderItem = reStruct.images.get(this.id);

    if (!item || !renderItem) {
      return;
    }
    this.previousPosition =
      item.getReferencePositions()[this.referencePositionName];
    const { min, max } = resizeBox(
      {
        min: item.getTopLeftPosition(),
        max: item.getBottomRightPosition(),
      },
      IMAGE_REFERENCE_NAME_TO_HANDLE[this.referencePositionName],
      this.position,
    );

    item.resize(min, max);
    const next = renderItem.visel.paths[0].next;
    reStruct.clearVisel(renderItem.visel);
    renderItem.show(reStruct, reStruct.render.options, next);
  }

  invert(): BaseOperation {
    // `previousPosition` is only unset before `execute` has run. `invert` is
    // only ever called on an operation that has already been executed, so
    // reaching this with an unset value indicates a programming error.
    if (!this.previousPosition) {
      throw new Error(
        'ImageResize: cannot invert an operation that has not been executed yet',
      );
    }

    return new ImageResize(
      this.id,
      this.previousPosition,
      this.referencePositionName,
    );
  }

  isDummy(restruct?: ReStruct) {
    if (!restruct) return false;
    const item = restruct.molecule.images.get(this.id);
    if (!item) return false;
    const currentPosition =
      item.getReferencePositions()[this.referencePositionName];
    return (
      this.position.x === currentPosition.x &&
      this.position.y === currentPosition.y
    );
  }
}
