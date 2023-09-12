import { select } from 'd3';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import assert from 'assert';
import { D3SvgElementSelection } from 'application/render/types';

export interface IBaseRenderer {
  show(theme): void;
  remove(): void;
}

export abstract class BaseRenderer implements IBaseRenderer {
  protected rootElement?: D3SvgElementSelection<SVGGElement, void>;

  protected bodyElement?: D3SvgElementSelection<SVGElement, this>;

  protected hoverElement?: D3SvgElementSelection<
    SVGUseElement & SVGGElement,
    void
  >;

  protected hoverAreaElement?: D3SvgElementSelection<
    SVGGElement | SVGLineElement,
    void
  >;

  protected canvas: D3SvgElementSelection<SVGSVGElement, void>;
  protected constructor(public drawingEntity: DrawingEntity) {
    this.canvas = select('#polymer-editor-canvas');
  }

  public get rootBBox() {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get width() {
    return this.rootBBox?.width || 0;
  }

  public get height() {
    return this.rootBBox?.height || 0;
  }

  public get x() {
    return this.rootBBox?.x || 0;
  }

  public get y() {
    return this.rootBBox?.y || 0;
  }

  public get bodyBBox() {
    const rootNode = this.bodyElement?.node();
    const canvasNode = this.canvas.node();
    assert(canvasNode);
    if (!rootNode) return;
    const canvasBbox = canvasNode.getBoundingClientRect();
    const rootBbox = rootNode.getBoundingClientRect();

    return {
      x: rootBbox.x - canvasBbox.x,
      y: rootBbox.y - canvasBbox.y,
      width: rootBbox.width,
      height: rootBbox.height,
    };
  }

  public get bodyWidth() {
    return this.bodyBBox?.width || 0;
  }

  public get bodyHeight() {
    return this.bodyBBox?.height || 0;
  }

  public get bodyX() {
    return this.bodyBBox?.x || 0;
  }

  public get bodyY() {
    return this.bodyBBox?.y || 0;
  }

  public abstract show(theme): void;
  public abstract drawSelection(): void;
  public abstract moveSelection(): void;
  protected abstract appendHover(
    hoverArea,
  ): D3SvgElementSelection<SVGUseElement, void> | void;

  protected abstract removeHover(): void;
  protected abstract appendHoverAreaElement(): void;

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }

  public redrawHover() {
    if (this.drawingEntity.hovered) {
      const hoverElement = this.appendHover(this.hoverAreaElement);
      if (hoverElement) {
        this.hoverElement = hoverElement;
      }
    } else {
      this.removeHover();
      this.hoverElement = undefined;
    }
  }
}
