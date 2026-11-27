import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from 'application/render/types';
import { Coordinates } from 'application/editor/shared/coordinates';
import { provideEditorSettings } from 'application/editor/editorSettings';
import type { CoreImage } from 'domain/entities/CoreImage';
import { getRectangleGeometry } from 'application/render/renderers/simpleObjectGeometry';
import {
  SELECTION_COLOR,
  SELECTION_OUTLINE_COLOR,
} from 'application/render/renderers/constants';

const HOVER_COLOR = '#0097A8';
const HANDLE_RADIUS = 4;

export class ImageRenderer extends BaseRenderer {
  private selectionElement:
    D3SvgElementSelection<SVGRectElement, void> | undefined;
  private handleElements: D3SvgElementSelection<SVGCircleElement, void>[] = [];

  constructor(public image: CoreImage) {
    super(image);
    this.image.setBaseRenderer(this as BaseRenderer);
  }

  private get canvasCorners() {
    return {
      topLeft: Coordinates.modelToCanvas(this.image.position),
      bottomRight: Coordinates.modelToCanvas(this.image.bottomRight),
    };
  }

  private get contourPadding() {
    return provideEditorSettings().macroModeScale / 4;
  }

  private get contourGeometry() {
    const { topLeft, bottomRight } = this.canvasCorners;
    const { x, y, width, height } = getRectangleGeometry([
      topLeft,
      bottomRight,
    ]);
    const padding = this.contourPadding;

    return {
      x: x - padding,
      y: y - padding,
      width: width + padding * 2,
      height: height + padding * 2,
    };
  }

  private setContourAttributes(
    contourElement: D3SvgElementSelection<SVGRectElement, void>,
  ) {
    const { x, y, width, height } = this.contourGeometry;

    return contourElement
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height)
      .attr('rx', this.contourPadding / 2);
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .attr('data-testid', 'image') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;

    this.appendBitmap();
    this.appendHoverAreaElement();
    this.drawSelection();
    this.rootElement.selectAll('*').datum(this);
  }

  private appendBitmap() {
    if (!this.rootElement) {
      return;
    }

    const { x, y, width, height } = getRectangleGeometry([
      this.canvasCorners.topLeft,
      this.canvasCorners.bottomRight,
    ]);

    this.rootElement
      .append('image')
      .attr('href', this.image.bitmap)
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height)
      .attr('preserveAspectRatio', 'none');
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }

    if (this.image.selected) {
      this.appendSelection();
      this.appendHandles();
    } else {
      this.removeSelection();
      this.removeHandles();
    }
  }

  private appendSelection() {
    if (!this.rootElement) {
      return;
    }

    this.selectionElement = this.canvas
      .insert('rect', ':first-child')
      .attr('fill', SELECTION_COLOR)
      .attr('stroke', SELECTION_COLOR)
      .attr('class', 'dynamic-element') as never as D3SvgElementSelection<
      SVGRectElement,
      void
    >;

    this.setContourAttributes(this.selectionElement);
  }

  private removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
  }

  private appendHandles() {
    this.removeHandles();
    if (!this.rootElement) {
      return;
    }

    const rootElement = this.rootElement;
    const handlePoints = [
      this.canvasCorners.topLeft,
      this.canvasCorners.bottomRight,
    ];
    this.handleElements = handlePoints.map(
      (point, index) =>
        rootElement
          .append('circle')
          .attr('cx', point.x)
          .attr('cy', point.y)
          .attr('r', HANDLE_RADIUS)
          .attr('fill', '#FFF')
          .attr('stroke', SELECTION_OUTLINE_COLOR)
          .attr('class', 'dynamic-element')
          .attr('data-point-index', index)
          .datum(this) as never as D3SvgElementSelection<
          SVGCircleElement,
          void
        >,
    );
  }

  private removeHandles() {
    this.handleElements.forEach((handle) => handle.remove());
    this.handleElements = [];
  }

  protected appendHover(): void {
    if (!this.rootElement) {
      return;
    }

    this.hoverElement = this.rootElement
      .insert('rect', ':first-child')
      .attr('fill', 'none')
      .attr('stroke', HOVER_COLOR)
      .attr('stroke-width', 1.2)
      .attr('class', 'dynamic-element') as never as D3SvgElementSelection<
      SVGRectElement,
      void
    >;

    this.setContourAttributes(this.hoverElement);
    this.hoverElement.datum(this);
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  protected appendHoverAreaElement(): void {
    if (!this.rootElement) {
      return;
    }

    this.hoverAreaElement = this.rootElement
      .append('rect')
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('pointer-events', 'all')
      .attr('class', 'dynamic-element') as never as D3SvgElementSelection<
      SVGRectElement,
      void
    >;

    this.setContourAttributes(this.hoverAreaElement);

    this.hoverAreaElement
      ?.on('mouseover', () => {
        this.appendHover();
      })
      .on('mouseout', () => {
        this.removeHover();
      });
  }

  public moveSelection() {}

  public remove() {
    super.remove();
    this.removeHover();
    this.removeSelection();
    this.removeHandles();
  }
}
