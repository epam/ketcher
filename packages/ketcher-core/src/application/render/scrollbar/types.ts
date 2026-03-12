export type RaphaelRectAttr = {
  x: number;
  y: number;
  width: number;
  height: number;
  r: number;
};

export interface RaphaelElement extends Record<string, unknown> {
  readonly raphaelid: string;

  attr(attr: RaphaelRectAttr): this;

  attr(): RaphaelRectAttr;
}
