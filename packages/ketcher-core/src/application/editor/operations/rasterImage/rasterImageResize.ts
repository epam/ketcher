import { BaseOperation } from 'application/editor/operations/base';
import { RasterImageReferenceName, Vec2 } from 'domain/entities';
import { ReStruct } from 'application/render';
import { OperationType } from 'application/editor';

const moveLeftPositions: Array<RasterImageReferenceName> = [
  'topLeftPosition',
  'leftMiddlePosition',
  'bottomLeftPosition',
];

const moveRightPositions: Array<RasterImageReferenceName> = [
  'topRightPosition',
  'rightMiddlePosition',
  'bottomRightPosition',
];

const moveTopPositions: Array<RasterImageReferenceName> = [
  'topLeftPosition',
  'topMiddlePosition',
  'topRightPosition',
];

const moveBottomPositions: Array<RasterImageReferenceName> = [
  'bottomLeftPosition',
  'bottomMiddlePosition',
  'bottomRightPosition',
];

export class RasterImageResize extends BaseOperation {
  private previousPosition: Vec2 | null = null;
  constructor(
    private id: number,
    private position: Vec2,
    private referencePositionName: RasterImageReferenceName,
  ) {
    super(OperationType.RASTER_IMAGE_RESIZE);
  }

  execute(reStruct: ReStruct) {
    const item = reStruct.molecule.rasterImages.get(this.id);
    const renderItem = reStruct.rasterImages.get(this.id);

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
    renderItem.show(reStruct, reStruct.render.options);
  }

  invert(): BaseOperation {
    return new RasterImageResize(
      this.id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.previousPosition!,
      this.referencePositionName,
    );
  }
}
