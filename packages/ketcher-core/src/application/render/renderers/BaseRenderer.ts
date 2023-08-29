import { select, Selection } from 'd3';

export interface IBaseRenderer {
  show(theme: any): void;
  remove(): void;
}

export abstract class BaseRenderer implements IBaseRenderer {
  public static isSelectable = () => false;
  protected abstract rootElement:
    | Selection<SVGGElement, this, HTMLElement, never>
    | undefined;

  protected canvas: Selection<SVGElement, unknown, HTMLElement, never>;
  protected constructor() {
    this.canvas = select<SVGElement, unknown>('#polymer-editor-canvas');
  }

  public abstract show(theme): void;

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }
}
