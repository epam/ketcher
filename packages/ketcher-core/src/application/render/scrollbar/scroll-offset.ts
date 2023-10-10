import { Box2Abs, Vec2 } from 'domain/entities';
import { Render } from '../raphaelRender';
import { Scale } from 'domain/helpers';

export class ScrollOffset {
  #render: Render;
  up = 0;
  down = 0;
  left = 0;
  right = 0;

  constructor(render: Render) {
    this.#render = render;
  }

  getAbsViewBox(): Box2Abs {
    const viewBox = this.#render.viewBox;
    const viewBoxMinXY = new Vec2(viewBox.minX, viewBox.minY);
    const viewBoxMaxXY = new Vec2(
      viewBox.minX + viewBox.width,
      viewBox.minY + viewBox.height,
    );
    return new Box2Abs(viewBoxMinXY, viewBoxMaxXY);
  }

  getAbsBoundingBox(): Box2Abs {
    const protoBoundingBox = this.#render.ctab.getVBoxObj();
    const boundingBoxMinXY = Scale.protoToCanvas(
      protoBoundingBox.p0,
      this.#render.options,
    );
    const boundingBoxMaxXY = Scale.protoToCanvas(
      protoBoundingBox.p1,
      this.#render.options,
    );
    return new Box2Abs(boundingBoxMinXY, boundingBoxMaxXY);
  }

  #calculateOffset() {
    const absBoundingBox = this.getAbsBoundingBox();
    if (absBoundingBox.hasZeroArea()) {
      this.up = 0;
      this.down = 0;
      this.left = 0;
      this.right = 0;
    } else {
      const absViewBox = this.getAbsViewBox();
      this.up = absViewBox.p0.y - absBoundingBox.p0.y;
      this.down = absBoundingBox.p1.y - absViewBox.p1.y;
      this.left = absViewBox.p0.x - absBoundingBox.p0.x;
      this.right = absBoundingBox.p1.x - absViewBox.p1.x;
    }
  }

  update() {
    this.#calculateOffset();
  }

  hasVerticalOffset() {
    return this.up > 0 || this.down > 0;
  }

  hasHorizontalOffset() {
    return this.left > 0 || this.right > 0;
  }
}
