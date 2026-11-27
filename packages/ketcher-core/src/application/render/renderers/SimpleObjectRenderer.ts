import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from 'application/render/types';
import { Coordinates } from 'application/editor/shared/coordinates';
import { provideEditorSettings } from 'application/editor/editorSettings';
import type { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import type { Vec2 } from 'domain/entities/vec2';
import {
  getEllipseGeometry,
  getLineGeometry,
  getRectangleGeometry,
} from 'application/render/renderers/simpleObjectGeometry';
import { SELECTION_COLOR } from 'application/render/renderers/constants';

const SHAPE_STROKE_WIDTH = 2;
const HOVER_COLOR = '#0097A8';

export class SimpleObjectRenderer extends BaseRenderer {
  private selectionElement:
    D3SvgElementSelection<SVGRectElement, void> | undefined;

  constructor(public simpleObject: CoreSimpleObject) {
    super(simpleObject);
    this.simpleObject.setBaseRenderer(this as BaseRenderer);
  }

  private get canvasPoints(): [Vec2, Vec2] {
    return this.simpleObject.mapPoints((point) =>
      Coordinates.modelToCanvas(point),
    );
  }

  private get contourPadding() {
    return provideEditorSettings().macroModeScale / 4;
  }

  private get contourGeometry() {
    const { x, y, width, height } = getRectangleGeometry(this.canvasPoints);
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
      .attr('data-testid', 'simple-object') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;

    this.appendShape();
    this.appendHoverAreaElement();
    this.drawSelection();
    this.rootElement.selectAll('*').datum(this);
  }

  private appendShape() {
    if (!this.rootElement) {
      return;
    }

    const [start, end] = this.canvasPoints;

    if (this.simpleObject.mode === SimpleObjectMode.rectangle) {
      const { x, y, width, height } = getRectangleGeometry([start, end]);

      this.rootElement
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', SHAPE_STROKE_WIDTH);
    } else if (this.simpleObject.mode === SimpleObjectMode.ellipse) {
      const { cx, cy, rx, ry } = getEllipseGeometry([start, end]);

      this.rootElement
        .append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', SHAPE_STROKE_WIDTH);
    } else {
      const { x1, y1, x2, y2 } = getLineGeometry([start, end]);

      this.rootElement
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#000')
        .attr('stroke-width', SHAPE_STROKE_WIDTH);
    }
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }

    if (this.simpleObject.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
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
  }
}
