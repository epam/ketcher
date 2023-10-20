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

export class VerticalScrollbar extends Scrollbar {
  #scrollOffset: ScrollOffset;

  constructor(render: Render, scrollOffset: ScrollOffset) {
    super(render);
    this.#scrollOffset = scrollOffset;
  }

  hasOffset(): boolean {
    return this.#scrollOffset.hasVerticalOffset();
  }

  getDynamicAttr(): RaphaelRectAttr {
    const minX =
      this.render.viewBox.minX +
      this.render.viewBox.width -
      getZoomedValue(this.DIST_TO_EDGE, this.render.options);
    const minY =
      this.render.viewBox.minY +
      clamp(
        getUserFriendlyScrollOffset(this.#scrollOffset.up),
        getZoomedValue(this.MARGIN, this.render.options),
        this.render.viewBox.height -
          getZoomedValue(this.MIN_LENGTH + this.MARGIN, this.render.options),
      );
    const maxY =
      this.render.viewBox.minY +
      this.render.viewBox.height -
      clamp(
        getUserFriendlyScrollOffset(this.#scrollOffset.down),
        getZoomedValue(this.MARGIN, this.render.options),
        this.render.viewBox.height,
      );
    const length = Math.max(
      maxY - minY,
      getZoomedValue(this.MIN_LENGTH, this.render.options),
    );

    return {
      x: minX,
      y: minY,
      width: getZoomedValue(this.WIDTH, this.render.options),
      height: length,
      r: getZoomedValue(this.RADIUS, this.render.options),
    };
  }

  onDragMove(
    _dx: number,
    dy: number,
    _x: number,
    _y: number,
    _event: MouseEvent,
  ): void {
    if (!this.viewBoxBeforeDrag) {
      return;
    }

    this.render.setViewBox({
      ...this.viewBoxBeforeDrag,
      minY: this.viewBoxBeforeDrag.minY + getUserFriendlyViewBoxDelta(dy),
    });
  }
}
