import { select, Selection } from 'd3';

export abstract class BaseRenderer {
  public static isSelectable = () => false;
  protected abstract rootElement:
    | Selection<SVGGElement, this, HTMLElement, never>
    | undefined;

  protected canvas: Selection<SVGElement, unknown, HTMLElement, never>;
  // TO DO
  protected constructor() {
    this.canvas = select<SVGElement, unknown>('#polymer-editor-canvas');
  }

  public abstract show(theme): void;
}
