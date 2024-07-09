import { ReObject, ReStruct } from 'application/render/restruct';
import { RASTER_IMAGE_KEY, RasterImage } from 'domain/entities/rasterImage';
import { RenderOptions } from 'application/render/render.types';
import { Scale } from 'domain/helpers';
import { RaphaelElement } from 'raphael';
import { Box2Abs, Vec2 } from 'domain/entities';

export class ReRasterImage extends ReObject {
  private element?: RaphaelElement;

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

  show(restruct: ReStruct, renderOptions: RenderOptions) {
    if (this.element) {
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

  move(diff: Vec2) {
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
}
