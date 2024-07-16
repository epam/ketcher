import { LayerMap, ReObject, ReStruct } from 'application/render/restruct';
import {
  RasterImage,
  RasterImageReferenceName,
  RasterImageReferencePositionInfo,
} from 'domain/entities/rasterImage';
import { RenderOptions } from 'application/render/render.types';
import { Scale } from 'domain/helpers';
import { RaphaelElement, RaphaelSet, RaphaelPaper } from 'raphael';
import { Box2Abs, Vec2 } from 'domain/entities';
import draw from 'application/render/draw';
import { RASTER_IMAGE_KEY } from 'domain/constants';
import { Render } from 'application/render';

type GetReferencePositions = ReturnType<RasterImage['getReferencePositions']>;
const REFERENCE_POINT_LINE_WIDTH_MULTIPLIER = 0.4;

interface ClosestReferencePosition {
  distance: number;
  ref: RasterImageReferencePositionInfo | null;
}

export class ReRasterImage extends ReObject {
  private element?: RaphaelElement;
  private selectionPointsSet: RaphaelSet;

  static isSelectable(): boolean {
    return true;
  }

  constructor(public rasterImage: RasterImage) {
    super(RASTER_IMAGE_KEY);
  }

  private getScaledPointWithOffset(
    originalPoint: Vec2,
    renderOptions: RenderOptions,
  ): Vec2 {
    const scaledPoint: Vec2 = Scale.modelToCanvas(originalPoint, renderOptions);
    return scaledPoint.add(renderOptions.offset);
  }

  private getScale(renderOptions: RenderOptions) {
    return renderOptions.microModeScale / 8;
  }

  private getDimensions(renderOptions: RenderOptions): Vec2 {
    return Vec2.diff(
      this.getScaledPointWithOffset(
        this.rasterImage.getBottomRightPosition(),
        renderOptions,
      ),
      this.getScaledPointWithOffset(
        this.rasterImage.getTopLeftPosition(),
        renderOptions,
      ),
    );
  }

  private getSelectionReferencePositions(
    renderOptions: RenderOptions,
  ): GetReferencePositions {
    const scale = this.getScale(renderOptions) * 2;
    const [
      topLeftPosition,
      topRightPosition,
      bottomRightPosition,
      bottomLeftPosition,
    ] = this.rasterImage
      .getCornerPositions()
      .map((position) => Scale.modelToCanvas(position, renderOptions));
    const selectionTopLeftPosition = topLeftPosition.sub(
      new Vec2(scale, scale),
    );
    const selectionTopRightPosition = topRightPosition.add(
      new Vec2(scale, -1 * scale),
    );
    const selectionBottomRightPosition = bottomRightPosition.add(
      new Vec2(scale, scale),
    );
    const selectionBottomLeftPosition = bottomLeftPosition.add(
      new Vec2(-1 * scale, scale),
    );

    return {
      topLeftPosition: selectionTopLeftPosition,
      topMiddlePosition: Vec2.centre(
        selectionTopLeftPosition,
        selectionTopRightPosition,
      ),
      topRightPosition: selectionTopRightPosition,
      rightMiddlePosition: Vec2.centre(
        selectionTopRightPosition,
        selectionBottomRightPosition,
      ),
      bottomRightPosition: selectionBottomRightPosition,
      bottomMiddlePosition: Vec2.centre(
        selectionBottomLeftPosition,
        selectionBottomRightPosition,
      ),
      bottomLeftPosition: selectionBottomLeftPosition,
      leftMiddlePosition: Vec2.centre(
        selectionTopLeftPosition,
        selectionBottomLeftPosition,
      ),
    };
  }

  private drawSelectionLine(
    paper: RaphaelPaper,
    renderOptions: RenderOptions,
  ): RaphaelSet {
    const selectionSet = paper.set();
    const scale = this.getScale(renderOptions);
    const {
      topLeftPosition,
      topRightPosition,
      bottomRightPosition,
      bottomLeftPosition,
    } = this.getSelectionReferencePositions(renderOptions);
    const polygon = [
      topLeftPosition,
      topRightPosition,
      bottomRightPosition,
      bottomLeftPosition,
    ];
    const styleOptions = renderOptions.selectionStyleSimpleObject;
    const strokeWidth =
      Number(styleOptions['stroke-width']) +
      scale * REFERENCE_POINT_LINE_WIDTH_MULTIPLIER;

    selectionSet.push(
      draw.selectionPolygon(paper, polygon, renderOptions).attr({
        ...renderOptions.selectionStyleSimpleObject,
        'stroke-width': strokeWidth,
      }),
    );
    return selectionSet;
  }

  private drawSelectionPoints(
    reStruct: ReStruct,
    paper: RaphaelPaper,
    renderOptions: RenderOptions,
  ) {
    this.selectionPointsSet = paper.set();
    const scale = this.getScale(renderOptions);
    const strokeWidth = scale * REFERENCE_POINT_LINE_WIDTH_MULTIPLIER;
    const selectionReferencePositions = Object.values(
      this.getSelectionReferencePositions(renderOptions),
    );
    selectionReferencePositions.forEach((rp) => {
      this.selectionPointsSet.push(
        paper
          .circle(rp.x, rp.y, scale)
          .attr({ fill: 'none', 'stroke-width': strokeWidth }),
      );
    });
    reStruct.addReObjectPath(
      LayerMap.selectionPlate,
      this.visel,
      this.selectionPointsSet,
    );
  }

  show(restruct: ReStruct, renderOptions: RenderOptions) {
    if (this.element) {
      restruct.clearVisel(this.visel);
      this.remove();
    }

    const scaledTopLeftWithOffset = this.getScaledPointWithOffset(
      this.rasterImage.getTopLeftPosition(),
      renderOptions,
    );
    const dimensions = this.getDimensions(renderOptions);

    this.element = restruct.render.paper.image(
      this.rasterImage.bitmap,
      scaledTopLeftWithOffset.x,
      scaledTopLeftWithOffset.y,
      dimensions.x,
      dimensions.y,
    );
  }

  drawHover(render: Render) {
    const offset =
      this.getScale(render.options) *
      (1 + REFERENCE_POINT_LINE_WIDTH_MULTIPLIER);
    const { topLeftPosition, bottomRightPosition } =
      this.getSelectionReferencePositions(render.options);
    const outerBorderOffset = new Vec2(offset, offset);
    const topLeftCorner = topLeftPosition.sub(outerBorderOffset);
    const dimensions = bottomRightPosition
      .sub(topLeftPosition)
      .add(outerBorderOffset.scaled(2));
    const paths = render.paper
      .rect(topLeftCorner.x, topLeftCorner.y, dimensions.x, dimensions.y)
      .attr({ ...render.options.hoverStyle, fill: '#fff' });

    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, paths);

    return paths;
  }

  makeSelectionPlate(
    reStruct: ReStruct,
    paper: RaphaelPaper,
    options: RenderOptions,
  ) {
    this.drawSelectionPoints(reStruct, paper, options);
    return this.drawSelectionLine(paper, options);
  }

  getVBoxObj(): Box2Abs | null {
    return new Box2Abs(
      this.rasterImage.getTopLeftPosition(),
      this.rasterImage.getBottomRightPosition(),
    );
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  move(reStruct: ReStruct, diff: Vec2) {
    reStruct.clearVisel(this.visel);
    if (this.element) {
      this.element.translate(diff.x, diff.y);
    }
  }

  // Workaround to always display images on top
  moveToBottomOfParentNode() {
    if (this.element && this.element.node && this.element.node.parentNode) {
      const node = this.element.node;
      const parentNode: HTMLElement = node.parentNode;
      parentNode?.appendChild(node);
    }
  }

  togglePoints(displayFlag: boolean) {
    displayFlag
      ? this.selectionPointsSet?.show()
      : this.selectionPointsSet?.hide();
  }

  calculateDistanceToPoint(point: Vec2, renderOptions: RenderOptions): number {
    if (this.isPointInsidePolygon(point, renderOptions)) {
      return 0;
    }
    const {
      topLeftPosition,
      topRightPosition,
      bottomRightPosition,
      bottomLeftPosition,
    } = this.getSelectionReferencePositions(renderOptions);

    return Math.min(
      point.calculateDistanceToLine([topLeftPosition, topRightPosition]),
      point.calculateDistanceToLine([topRightPosition, bottomRightPosition]),
      point.calculateDistanceToLine([bottomRightPosition, bottomLeftPosition]),
      point.calculateDistanceToLine([bottomLeftPosition, topLeftPosition]),
    );
  }

  calculateClosestReferencePosition(
    point: Vec2,
    renderOptions: RenderOptions,
  ): ClosestReferencePosition {
    const entries = Object.entries(
      this.getSelectionReferencePositions(renderOptions),
    ) as Array<[RasterImageReferenceName, Vec2]>;
    return entries.reduce(
      (acc, [key, position]) => {
        const offset = Vec2.diff(position, point);
        const distance = offset.length();
        if (distance < acc.distance) {
          return {
            distance,
            ref: {
              name: key,
              offset: Scale.canvasToModel(offset, renderOptions),
            },
          };
        } else {
          return acc;
        }
      },
      {
        ref: null,
        distance: Number.POSITIVE_INFINITY,
      } as ClosestReferencePosition,
    );
  }

  isPointInsidePolygon(point: Vec2, renderOptions: RenderOptions): boolean {
    const referencePositions =
      this.getSelectionReferencePositions(renderOptions);

    return point.isInsidePolygon([
      referencePositions.topLeftPosition,
      referencePositions.topRightPosition,
      referencePositions.bottomRightPosition,
      referencePositions.bottomLeftPosition,
    ]);
  }
}
