import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { D3SvgElementSelection } from 'application/render/types';
import { provideEditorSettings } from 'application/editor/editorSettings';
import ZoomTool from 'application/editor/tools/Zoom';
import { select } from 'd3';
import {
  canvasSelector,
  drawnStructuresSelector,
} from 'application/editor/constants';
import { Vec2 } from 'domain/entities';

export interface IBaseRenderer {
  show(theme): void;
  remove(): void;
}

export abstract class BaseRenderer implements IBaseRenderer {
  protected rootElement?: D3SvgElementSelection<SVGGElement, void>;

  public bodyElement?:
    | D3SvgElementSelection<SVGUseElement, this>
    | D3SvgElementSelection<SVGLineElement, this>
    | D3SvgElementSelection<SVGPathElement, this>
    | D3SvgElementSelection<SVGCircleElement, this>;

  protected hoverElement?:
    | D3SvgElementSelection<SVGUseElement, void>
    | D3SvgElementSelection<SVGGElement, void>
    | D3SvgElementSelection<SVGCircleElement, void>
    | D3SvgElementSelection<SVGRectElement, void>
    | D3SvgElementSelection<SVGPathElement, void>;

  // An extra invisible area around `bodyElement` to make it easier for a user to hover over it.
  protected hoverAreaElement?:
    | D3SvgElementSelection<SVGGElement, void>
    | D3SvgElementSelection<SVGPathElement, void>
    | D3SvgElementSelection<SVGRectElement, void>
    | D3SvgElementSelection<SVGLineElement, void>;

  protected hoverCircleAreaElement?: D3SvgElementSelection<
    SVGGElement | SVGCircleElement,
    void
  >;

  protected canvasWrapper: D3SvgElementSelection<SVGSVGElement, void>;

  protected canvas: D3SvgElementSelection<SVGSVGElement, void>;
  protected constructor(public drawingEntity: DrawingEntity) {
    this.canvasWrapper =
      ZoomTool.instance?.canvasWrapper || select(canvasSelector);
    this.canvas = ZoomTool.instance?.canvas || select(drawnStructuresSelector);
  }

  protected get editorSettings() {
    return provideEditorSettings();
  }

  public get rootBBox() {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get rootBoundingClientRect() {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBoundingClientRect();
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

  public get selectionPoints(): Vec2[] | undefined {
    return undefined;
  }

  public abstract show(theme, force?: boolean): void;
  public abstract drawSelection(): void;
  public abstract moveSelection(): void;
  protected abstract appendHover(
    hoverArea,
  ):
    | D3SvgElementSelection<SVGGElement, void>
    | D3SvgElementSelection<SVGUseElement, void>
    | D3SvgElementSelection<SVGCircleElement, void>
    | D3SvgElementSelection<SVGRectElement, void>
    | D3SvgElementSelection<SVGPathElement, void>
    | void;

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

  public setVisibility(isVisible: boolean) {
    this.rootElement?.style('opacity', isVisible ? 1 : 0);
  }

  move() {}
}
