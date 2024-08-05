import { BaseOperation } from 'application/editor/operations/base';
import { ImageReferenceName, Vec2 } from 'domain/entities';
import { ReStruct } from 'application/render';
import { OperationType } from 'application/editor';

const moveLeftPositions: Array<ImageReferenceName> = [
  'topLeftPosition',
  'leftMiddlePosition',
  'bottomLeftPosition',
];

const moveRightPositions: Array<ImageReferenceName> = [
  'topRightPosition',
  'rightMiddlePosition',
  'bottomRightPosition',
];

const moveTopPositions: Array<ImageReferenceName> = [
  'topLeftPosition',
  'topMiddlePosition',
  'topRightPosition',
];

const moveBottomPositions: Array<ImageReferenceName> = [
  'bottomLeftPosition',
  'bottomMiddlePosition',
  'bottomRightPosition',
];

export class ImageResize extends BaseOperation {
  private previousPosition: Vec2 | null = null;
  constructor(
    private id: number,
    private position: Vec2,
    private referencePositionName: ImageReferenceName,
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

    if (moveTopPositions.includes(this.referencePositionName)) {
      topLeftPosition.add_(new Vec2(0, diff.y));
    } else if (moveBottomPositions.includes(this.referencePositionName)) {
      bottomRightPosition.add_(new Vec2(0, diff.y));
    }
    if (moveLeftPositions.includes(this.referencePositionName)) {
      topLeftPosition.add_(new Vec2(diff.x, 0));
    } else if (moveRightPositions.includes(this.referencePositionName)) {
      bottomRightPosition.add_(new Vec2(diff.x, 0));
    }

    item.resize(topLeftPosition, bottomRightPosition);
    reStruct.clearVisel(renderItem.visel);
    renderItem.show(reStruct, reStruct.render.options);
  }

  invert(): BaseOperation {
    return new ImageResize(
      this.id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.previousPosition!,
      this.referencePositionName,
    );
  }
}
