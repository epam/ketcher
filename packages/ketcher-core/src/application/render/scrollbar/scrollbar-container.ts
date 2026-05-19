import { Render } from '../raphaelRender';
import { ScrollOffset } from './scroll-offset';
import { VerticalScrollbar } from './scrollbar-vertical';
import { HorizontalScrollbar } from './scrollbar-horizontal';

export class ScrollbarContainer {
  readonly #scrollOffset: ScrollOffset;
  readonly #verticalBar: VerticalScrollbar;
  readonly #horizontalBar: HorizontalScrollbar;

  constructor(render: Render) {
    this.#scrollOffset = new ScrollOffset(render);
    this.#verticalBar = new VerticalScrollbar(render, this.#scrollOffset);
    this.#horizontalBar = new HorizontalScrollbar(render, this.#scrollOffset);
  }

  public destroy() {
    this.#verticalBar.destroy();
    this.#horizontalBar.destroy();
  }

  /** Specified {@link render} resets scrollbars */
  update() {
    this.#scrollOffset.update();
    this.#verticalBar.update();
    this.#horizontalBar.update();
  }
}
