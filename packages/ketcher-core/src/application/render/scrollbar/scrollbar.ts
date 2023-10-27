import { Render } from '../raphaelRender';
import { ViewBox } from '../render.types';
import { RaphaelElement, RaphaelRectAttr } from './types';

export abstract class Scrollbar {
  protected bar: RaphaelElement | null = null;
  protected render: Render;
  protected viewBoxBeforeDrag: ViewBox | null = null;

  protected MIN_LENGTH = 40;
  protected RADIUS = 2;
  protected MARGIN = 5;
  protected WIDTH = 4;
  protected DIST_TO_EDGE = 5;
  protected COLOR = '#b2bbc3';

  protected constructor(render: Render) {
    this.render = render;
  }

  update() {
    this.bar = this.hasOffset() ? this.redraw() : this.hide();
  }

  protected redraw() {
    return this.bar ? this.updateAttr() : this.draw();
  }

  protected updateAttr() {
    const attr = this.getDynamicAttr();
    return this.bar?.attr(attr);
  }

  protected hide() {
    this.bar?.undrag();
    this.bar?.remove();
    return null;
  }

  protected draw() {
    const { x, y, width, height, r } = this.getDynamicAttr();
    const bar = this.render.paper.rect(x, y, width, height, r).attr({
      stroke: this.COLOR,
      fill: this.COLOR,
    });

    /** @see https://dmitrybaranovskiy.github.io/raphael/reference.html#Element.drag */
    bar.drag(
      this.onDragMove,
      this.onDragStart,
      this.onDragEnd,
      this,
      this,
      this,
    );

    return bar;
  }

  protected onDragStart(_x: number, _y: number, event: MouseEvent) {
    this.viewBoxBeforeDrag = { ...this.render.viewBox };
    event.stopPropagation();
  }

  protected onDragEnd(event: MouseEvent) {
    event.stopPropagation();
  }

  abstract hasOffset(): boolean;
  abstract getDynamicAttr(): RaphaelRectAttr;
  abstract onDragMove(
    dx: number,
    dy: number,
    x: number,
    y: number,
    event: MouseEvent,
  ): void;
}
