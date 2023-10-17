import { select } from 'd3';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import assert from 'assert';
import { D3SvgElementSelection } from 'application/render/types';
import { provideEditorSettings } from 'application/editor/editorSettings';
import {
  canvasSelector,
  drawnStructuresSelector,
} from 'application/editor/constants';
import { Vec2 } from 'domain/entities';
import ZoomTool from 'application/editor/tools/Zoom';

export interface IBaseRenderer {
  show(theme): void;
  remove(): void;
}

export abstract class BaseRenderer implements IBaseRenderer {
  protected rootElement?: D3SvgElementSelection<SVGGElement, void>;

  public bodyElement?: D3SvgElementSelection<SVGElement, this>;

  protected hoverElement?: D3SvgElementSelection<
    SVGUseElement & SVGGElement,
    void
  >;

  protected hoverAreaElement?: D3SvgElementSelection<
    SVGGElement | SVGLineElement,
    void
  >;

  protected canvasWrapper: D3SvgElementSelection<SVGSVGElement, void>;
  protected canvas: D3SvgElementSelection<SVGSVGElement, void>;
  protected constructor(public drawingEntity: DrawingEntity) {
    this.canvasWrapper = select(canvasSelector);
    this.canvas = select(drawnStructuresSelector);
  }

  protected get editorSettings() {
    return provideEditorSettings();
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
    const canvasWrapperNode = this.canvasWrapper.node();
    assert(canvasWrapperNode);
    if (!rootNode) return;
    const canvasBbox = canvasWrapperNode.getBoundingClientRect();
    const rootBbox = rootNode.getBoundingClientRect();
    const position = ZoomTool.instance.invertZoom(
      new Vec2(rootBbox.x - canvasBbox.x, rootBbox.y - canvasBbox.y),
    );
    const zoomLevel = ZoomTool.instance.getZoomLevel();

    return {
      x: position.x,
      y: position.y,
      width: rootBbox.width / zoomLevel,
      height: rootBbox.height / zoomLevel,
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
