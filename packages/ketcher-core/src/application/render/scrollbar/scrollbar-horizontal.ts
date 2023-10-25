import { clamp } from 'lodash';
import { Render } from '../raphaelRender';
import { ScrollOffset } from './scroll-offset';
import { Scrollbar } from './scrollbar';
import { RaphaelRectAttr } from './types';
import {
  getUserFriendlyScrollOffset,
  getUserFriendlyViewBoxDelta,
  getZoomedValue,
} from './utils';

export class HorizontalScrollbar extends Scrollbar {
  #scrollOffset: ScrollOffset;

  constructor(render: Render, scrollOffset: ScrollOffset) {
    super(render);
    this.#scrollOffset = scrollOffset;
  }

  hasOffset(): boolean {
    return this.#scrollOffset.hasHorizontalOffset();
  }

  getDynamicAttr(): RaphaelRectAttr {
    const minX =
      this.render.viewBox.minX +
      clamp(
        getUserFriendlyScrollOffset(this.#scrollOffset.left),
        getZoomedValue(this.MARGIN, this.render.options),
        this.render.viewBox.width -
          getZoomedValue(this.MIN_LENGTH + this.MARGIN, this.render.options),
      );
    const minY =
      this.render.viewBox.minY +
      this.render.viewBox.height -
      getZoomedValue(this.DIST_TO_EDGE, this.render.options);
    const maxX =
      this.render.viewBox.minX +
      this.render.viewBox.width -
      clamp(
        getUserFriendlyScrollOffset(this.#scrollOffset.right),
        getZoomedValue(this.MARGIN, this.render.options),
        this.render.viewBox.width,
      );
    const length = Math.max(
      maxX - minX,
      getZoomedValue(this.MIN_LENGTH, this.render.options),
    );

    return {
      x: minX,
      y: minY,
      width: length,
      height: getZoomedValue(this.WIDTH, this.render.options),
      r: getZoomedValue(this.RADIUS, this.render.options),
    };
  }

  onDragMove(
    dx: number,
    _dy: number,
    _x: number,
    _y: number,
    _event: MouseEvent,
  ): void {
    if (!this.viewBoxBeforeDrag) {
      return;
    }

    this.render.setViewBox({
      ...this.viewBoxBeforeDrag,
      minX: this.viewBoxBeforeDrag.minX + getUserFriendlyViewBoxDelta(dx),
    });
  }
}
