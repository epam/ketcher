import { BaseOperation } from 'application/editor/operations/BaseOperation';
import type { ImageReferenceName } from 'domain/entities/image';
import { Vec2 } from 'domain/entities/vec2';
import type { ReStruct } from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';

const moveLeftPositions = new Set<ImageReferenceName>([
  'topLeftPosition',
  'leftMiddlePosition',
  'bottomLeftPosition',
]);

const moveRightPositions = new Set<ImageReferenceName>([
  'topRightPosition',
  'rightMiddlePosition',
  'bottomRightPosition',
]);

const moveTopPositions = new Set<ImageReferenceName>([
  'topLeftPosition',
  'topMiddlePosition',
  'topRightPosition',
]);

const moveBottomPositions = new Set<ImageReferenceName>([
  'bottomLeftPosition',
  'bottomMiddlePosition',
  'bottomRightPosition',
]);

export class ImageResize extends BaseOperation {
  private previousPosition: Vec2 | null = null;
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
    const referencePositions = item.getReferencePositions();
    this.previousPosition = referencePositions[this.referencePositionName];
    const diff = Vec2.diff(this.position, this.previousPosition);
    const topLeftPosition = new Vec2(referencePositions.topLeftPosition);
    const bottomRightPosition = new Vec2(
      referencePositions.bottomRightPosition,
    );

    if (moveTopPositions.has(this.referencePositionName)) {
      topLeftPosition.add_(new Vec2(0, diff.y));
    } else if (moveBottomPositions.has(this.referencePositionName)) {
      bottomRightPosition.add_(new Vec2(0, diff.y));
    }
    if (moveLeftPositions.has(this.referencePositionName)) {
      topLeftPosition.add_(new Vec2(diff.x, 0));
    } else if (moveRightPositions.has(this.referencePositionName)) {
      bottomRightPosition.add_(new Vec2(diff.x, 0));
    }

    item.resize(topLeftPosition, bottomRightPosition);
    const next = renderItem.visel.paths[0].next;
    reStruct.clearVisel(renderItem.visel);
    renderItem.show(reStruct, reStruct.render.options, next);
  }

  invert(): BaseOperation {
    // `previousPosition` is only null before `execute` has run. `invert` is
    // only ever called on an operation that has already been executed, so
    // reaching this with a null value indicates a programming error.
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
