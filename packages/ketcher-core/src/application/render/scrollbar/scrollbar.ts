import { Render } from '../raphaelRender';
import { RaphaelElement, RaphaelRectAttr } from './types';

export abstract class Scrollbar {
  protected bar: RaphaelElement | null = null;
  protected render: Render;

  protected MIN_LENGTH = 40;
  protected RADIUS = 2;
  protected MARGIN = 5;
  protected WIDTH = 4;
  protected DIST_TO_EDGE = 5;
  protected COLOR = '#b2bbc3';

  protected constructor(render: Render) {
    this.render = render;
  }

  protected update() {
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
    this.bar?.remove();
    return null;
  }

  protected draw() {
    const { x, y, width, height, r } = this.getDynamicAttr();
    return this.render.paper.rect(x, y, width, height, r).attr({
      stroke: this.COLOR,
      fill: this.COLOR,
    });
  }

  abstract hasOffset(): boolean;
  abstract getDynamicAttr(): RaphaelRectAttr;
}
