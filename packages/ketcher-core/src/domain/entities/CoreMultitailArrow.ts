import { DrawingEntity } from 'domain/entities/DrawingEntity';
import {
  FixedPrecisionCoordinates,
  KetFileMultitailArrowNode,
  MultitailArrow as MicromoleculeMultitailArrow,
  MultitailArrowsReferencePositions,
  Pool,
  Vec2,
} from 'domain/entities';
import { KetFileNode } from 'domain/serializers';
import { BaseRenderer } from 'application/render';
import { MultitailArrowRenderer } from 'application/render/renderers/MultitailArrowRenderer';

export class MultitailArrow extends DrawingEntity {
  public renderer?: MultitailArrowRenderer = undefined;

  constructor(
    private spineTopX: FixedPrecisionCoordinates,
    private spineTopY: FixedPrecisionCoordinates,
    private height: FixedPrecisionCoordinates,
    private headOffsetX: FixedPrecisionCoordinates,
    private headOffsetY: FixedPrecisionCoordinates,
    private tailLength: FixedPrecisionCoordinates,
    private tailsYOffset: Pool<FixedPrecisionCoordinates>,
  ) {
    super();
  }

  // public get startPosition() {
  //   return this.startEndPosition[0];
  // }
  //
  // private set startPosition(newStartPosition: Vec2) {
  //   this.startEndPosition[0] = newStartPosition;
  // }
  //
  // public get endPosition() {
  //   return this.startEndPosition[1];
  // }
  //
  // private set endPosition(newEndPosition: Vec2) {
  //   this.startEndPosition[1] = newEndPosition;
  // }
  //
  public get center(): Vec2 {
    return Vec2.centre(
      new Vec2(
        this.spineTopX.sub(this.tailLength).getFloatingPrecision(),
        this.spineTopY.getFloatingPrecision(),
      ),
      new Vec2(
        this.spineTopX.add(this.headOffsetX).getFloatingPrecision(),
        this.spineTopY.add(this.height).getFloatingPrecision(),
      ),
    );
  }

  public setRenderer(renderer: MultitailArrowRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public override moveRelative(delta: Vec2): void {
    this.spineTopX = this.spineTopX.add(
      FixedPrecisionCoordinates.fromFloatingPrecision(delta.x),
    );
    this.spineTopY = this.spineTopY.add(
      FixedPrecisionCoordinates.fromFloatingPrecision(delta.y),
    );
  }

  public override moveAbsolute(position: Vec2) {
    const delta = Vec2.diff(
      position,
      new Vec2(this.spineTopX.value, this.spineTopY.value),
    );

    this.moveRelative(delta);
  }

  static fromKet(
    multitailArrowKetNode: KetFileNode<KetFileMultitailArrowNode>,
  ) {
    const {
      spineTopX,
      spineTopY,
      height,
      headOffsetX,
      headOffsetY,
      tailsLength,
      tailsYOffset,
    } = MicromoleculeMultitailArrow.getConstructorParamsFromKetNode(
      multitailArrowKetNode,
    );

    return new MultitailArrow(
      spineTopX,
      spineTopY,
      height,
      headOffsetX,
      headOffsetY,
      tailsLength,
      tailsYOffset,
    );
  }

  toKetNode(): KetFileNode<KetFileMultitailArrowNode> {
    return MicromoleculeMultitailArrow.getParametersForKetNode(
      this.spineTopX,
      this.spineTopY,
      this.headOffsetX,
      this.headOffsetY,
      this.tailLength,
      this.tailsYOffset,
      this.height,
      this.center,
      false,
    );
  }

  getReferencePositions(): MultitailArrowsReferencePositions {
    return MicromoleculeMultitailArrow.getReferencePositions(
      this.spineTopX,
      this.spineTopY,
      this.height,
      this.headOffsetX,
      this.headOffsetY,
      this.tailLength,
      this.tailsYOffset,
    );
  }
}
