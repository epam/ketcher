export type RaphaelRectAttr = {
  x: number;
  y: number;
  width: number;
  height: number;
  r: number;
};

export type RaphaelDragOnMove = (
  dx: number,
  dy: number,
  x: number,
  y: number,
  event: MouseEvent,
) => void;

export type RaphaelDragOnStart = (
  x: number,
  y: number,
  event: MouseEvent,
) => void;

export type RaphaelDragOnEnd = (event: MouseEvent) => void;

export interface RaphaelElement extends Record<string, unknown> {
  readonly raphaelid: string;

  attr(attr: RaphaelRectAttr): this;

  attr(): RaphaelRectAttr;

  drag(
    onMove: RaphaelDragOnMove,
    onStart: RaphaelDragOnStart,
    onEnd: RaphaelDragOnEnd,
    onMoveContext?: object,
    onStartContext?: object,
    onEndContext?: object,
  ): this;

  undrag(): this;

  remove(): this;
}
