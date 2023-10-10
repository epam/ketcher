import { Render } from '../raphaelRender';
import { RaphaelElement } from './scrollbar.types';
import { ScrollOffset } from './scroll-offset';
import { clamp } from 'lodash';

const MIN_LENGTH = 40;
const RADIUS = 2;
const MARGIN = 5;
const WIDTH = 4;
const DIST_TO_EDGE = 5;
const COLOR = '#b2bbc3';

export class Scrollbar {
  #render: Render;
  #scrollOffset: ScrollOffset;
  #verticalBar: RaphaelElement | null = null;
  #horizontalBar: RaphaelElement | null = null;

  constructor(render: Render) {
    this.#render = render;
    this.#scrollOffset = new ScrollOffset(render);
  }

  getZoomedValue(value: number) {
    return value / this.#render.options.zoom;
  }

  drawVerticalBar() {
    const minX =
      this.#render.viewBox.minX +
      this.#render.viewBox.width -
      this.getZoomedValue(DIST_TO_EDGE);
    const minY =
      this.#render.viewBox.minY +
      clamp(
        this.#scrollOffset.up,
        this.getZoomedValue(MARGIN),
        this.#render.viewBox.height - this.getZoomedValue(MIN_LENGTH + MARGIN),
      );
    const maxY =
      this.#render.viewBox.minY +
      this.#render.viewBox.height -
      clamp(
        this.#scrollOffset.down,
        this.getZoomedValue(MARGIN),
        this.#render.viewBox.height,
      );
    const length = Math.max(maxY - minY, this.getZoomedValue(MIN_LENGTH));

    return this.#render.paper
      .rect(
        minX,
        minY,
        this.getZoomedValue(WIDTH),
        length,
        this.getZoomedValue(RADIUS),
      )
      .attr({
        stroke: COLOR,
        fill: COLOR,
      });
  }

  drawHorizontalBar() {
    const minX =
      this.#render.viewBox.minX +
      clamp(
        this.#scrollOffset.left,
        this.getZoomedValue(MARGIN),
        this.#render.viewBox.width - this.getZoomedValue(MIN_LENGTH + MARGIN),
      );
    const minY =
      this.#render.viewBox.minY +
      this.#render.viewBox.height -
      this.getZoomedValue(DIST_TO_EDGE);
    const maxX =
      this.#render.viewBox.minX +
      this.#render.viewBox.width -
      clamp(
        this.#scrollOffset.right,
        this.getZoomedValue(MARGIN),
        this.#render.viewBox.width,
      );
    const length = Math.max(maxX - minX, this.getZoomedValue(MIN_LENGTH));

    return this.#render.paper
      .rect(
        minX,
        minY,
        length,
        this.getZoomedValue(WIDTH),
        this.getZoomedValue(RADIUS),
      )
      .attr({
        stroke: COLOR,
        fill: COLOR,
      });
  }

  update() {
    this.#scrollOffset.update();
    this.#verticalBar = this.#scrollOffset.hasVerticalOffset()
      ? this.redrawVerticalBar()
      : this.hideVerticalBar();
    this.#horizontalBar = this.#scrollOffset.hasHorizontalOffset()
      ? this.redrawHorizontalBar()
      : this.hideHorizontalBar();
  }

  redrawVerticalBar() {
    this.#verticalBar?.remove();
    return this.drawVerticalBar();
  }

  hideVerticalBar() {
    this.#verticalBar?.remove();
    return null;
  }

  redrawHorizontalBar() {
    this.#horizontalBar?.remove();
    return this.drawHorizontalBar();
  }

  hideHorizontalBar() {
    this.#horizontalBar?.remove();
    return null;
  }
}
