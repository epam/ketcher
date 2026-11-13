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

interface ImageBounds {
  topLeftPosition: Vec2;
  bottomRightPosition: Vec2;
}

export class ImageResize extends BaseOperation {
  private previousBounds: ImageBounds | null = null;
  constructor(
    private readonly id: number,
    private readonly position: Vec2,
    private readonly referencePositionName: ImageReferenceName,
    private readonly bounds?: ImageBounds,
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
    this.previousBounds = {
      topLeftPosition: new Vec2(referencePositions.topLeftPosition),
      bottomRightPosition: new Vec2(referencePositions.bottomRightPosition),
    };
    const diff = Vec2.diff(
      this.position,
      referencePositions[this.referencePositionName],
    );
    const topLeftPosition = new Vec2(
      this.bounds?.topLeftPosition ?? referencePositions.topLeftPosition,
    );
    const bottomRightPosition = new Vec2(
      this.bounds?.bottomRightPosition ??
        referencePositions.bottomRightPosition,
    );

    if (!this.bounds) {
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
    }

    item.resize(topLeftPosition, bottomRightPosition);
    const next = renderItem.visel.paths[0].next;
    reStruct.clearVisel(renderItem.visel);
    renderItem.show(reStruct, reStruct.render.options, next);
  }

  invert(): BaseOperation {
    // `previousBounds` is only null before `execute` has run. `invert` is
    // only ever called on an operation that has already been executed, so
    // reaching this with a null value indicates a programming error.
    if (!this.previousBounds) {
      throw new Error(
        'ImageResize: cannot invert an operation that has not been executed yet',
      );
    }

    return new ImageResize(
      this.id,
      this.previousBounds.topLeftPosition,
      this.referencePositionName,
      this.previousBounds,
    );
  }

  isDummy(restruct?: ReStruct) {
    if (!restruct) return false;
    const item = restruct.molecule.images.get(this.id);
    if (!item) return false;
    if (this.bounds) {
      const { topLeftPosition, bottomRightPosition } =
        item.getReferencePositions();
      return (
        this.bounds.topLeftPosition.x === topLeftPosition.x &&
        this.bounds.topLeftPosition.y === topLeftPosition.y &&
        this.bounds.bottomRightPosition.x === bottomRightPosition.x &&
        this.bounds.bottomRightPosition.y === bottomRightPosition.y
      );
    }
    const currentPosition =
      item.getReferencePositions()[this.referencePositionName];
    return (
      this.position.x === currentPosition.x &&
      this.position.y === currentPosition.y
    );
  }
}
