import { Render } from '../raphaelRender';
import { ScrollOffset } from './scroll-offset';
import { VerticalScrollbar } from './scrollbar-vertical';
import { HorizontalScrollbar } from './scrollbar-horizontal';

export class ScrollbarContainer {
  #scrollOffset: ScrollOffset;
  #verticalBar: VerticalScrollbar | null = null;
  #horizontalBar: HorizontalScrollbar | null = null;

  constructor(render: Render) {
    this.#scrollOffset = new ScrollOffset(render);
    this.#verticalBar = new VerticalScrollbar(render, this.#scrollOffset);
    this.#horizontalBar = new HorizontalScrollbar(render, this.#scrollOffset);
  }

  update() {
    this.#scrollOffset.update();
    this.#verticalBar?.update();
    this.#horizontalBar?.update();
  }
}
