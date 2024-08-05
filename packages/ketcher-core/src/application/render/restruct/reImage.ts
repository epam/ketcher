import { LayerMap, ReObject, ReStruct } from 'application/render/restruct';
import {
  Image,
  ImageReferenceName,
  ImageReferencePositionInfo,
} from 'domain/entities/image';
import { RenderOptions } from 'application/render/render.types';
import { Scale } from 'domain/helpers';
import { RaphaelPaper, RaphaelSet } from 'raphael';
import { Box2Abs, Vec2 } from 'domain/entities';
import draw from 'application/render/draw';
import { IMAGE_KEY } from 'domain/constants';
import { Render } from 'application/render';

type GetReferencePositions = ReturnType<Image['getReferencePositions']>;
const REFERENCE_POINT_LINE_WIDTH_MULTIPLIER = 0.4;

interface ClosestReferencePosition {
  distance: number;
  ref: ImageReferencePositionInfo | null;
}

export class ReImage extends ReObject {
  private selectionPointsSet: RaphaelSet;

  static isSelectable(): boolean {
    return true;
  }

  constructor(public image: Image) {
    super(IMAGE_KEY);
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
        this.image.getBottomRightPosition(),
        renderOptions,
      ),
      this.getScaledPointWithOffset(
        this.image.getTopLeftPosition(),
        renderOptions,
      ),
    );
  }

  private getSelectionReferencePositions(
    renderOptions: RenderOptions,
  ): GetReferencePositions {
    // We need just one additional pixel for selection dots to not overlap with image
    const scale = this.getScale(renderOptions) + 1;
    const [
      topLeftPosition,
      topRightPosition,
      bottomRightPosition,
      bottomLeftPosition,
    ] = this.image
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
        'stroke-linecap': 'square',
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
    const selectionReferencePositions = Object.entries(
      this.getSelectionReferencePositions(renderOptions),
    );
    selectionReferencePositions.forEach(([key, { x, y }]) => {
      const element = paper.circle(x, y, scale).attr({
        fill: 'none',
        'stroke-width': strokeWidth,
      });
      if (element.node && element.node.setAttribute) {
        element.node.setAttribute('data-testid', `imageResize-${key}`);
      }

      this.selectionPointsSet.push(element);
    });
    reStruct.addReObjectPath(
      LayerMap.selectionPlate,
      this.visel,
      this.selectionPointsSet,
    );
  }

  show(restruct: ReStruct, renderOptions: RenderOptions) {
    const scaledTopLeftWithOffset = this.getScaledPointWithOffset(
      this.image.getTopLeftPosition(),
      renderOptions,
    );
    const dimensions = this.getDimensions(renderOptions);

    restruct.addReObjectPath(
      LayerMap.images,
      this.visel,
      restruct.render.paper.image(
        this.image.bitmap,
        scaledTopLeftWithOffset.x,
        scaledTopLeftWithOffset.y,
        dimensions.x,
        dimensions.y,
      ),
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
      this.image.getTopLeftPosition(),
      this.image.getBottomRightPosition(),
    );
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
    ) as Array<[ImageReferenceName, Vec2]>;
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
