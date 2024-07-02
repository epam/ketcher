import { ReObject, ReStruct } from 'application/render/restruct';
import { RasterImage } from 'domain/entities/rasterImage';
import { RenderOptions } from 'application/render/render.types';
import { Scale } from 'domain/helpers';
import { RaphaelElement } from 'raphael';
import { Vec2 } from 'domain/entities';

export class ReRasterImage extends ReObject {
  private element?: RaphaelElement;

  static isSelectable(): boolean {
    return true;
  }

  constructor(private item: RasterImage) {
    super('image');
  }

  show(restruct: ReStruct, options: RenderOptions) {
    if (this.element) {
      return;
    }

    const render = restruct.render;
    const [topLeft, bottomRight] = this.item.position;
    const scaledTopLeft = Scale.modelToCanvas(topLeft, options);
    const scaledBottomRight = Scale.modelToCanvas(bottomRight, options);
    const topLeftWithOffset = scaledTopLeft.add(options.offset);

    const width = scaledBottomRight.x - scaledTopLeft.x;
    const height = scaledBottomRight.y - scaledTopLeft.y;

    this.element = render.paper.image(
      this.item.bitmap,
      topLeftWithOffset.x,
      topLeftWithOffset.y,
      width,
      height,
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
}
