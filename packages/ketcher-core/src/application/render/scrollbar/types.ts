export type RaphaelRectAttr = {
  x: number;
  y: number;
  width: number;
  height: number;
  r: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RaphaelElement extends Record<string, any> {
  readonly raphaelid: string;

  attr(attr: RaphaelRectAttr): this;

  attr(): RaphaelRectAttr;
}
