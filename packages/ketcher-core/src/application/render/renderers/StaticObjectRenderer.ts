import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from 'application/render/types';
import { Coordinates } from 'application/editor/shared/coordinates';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import type { CoreStaticObject } from 'domain/entities/CoreStaticObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import type { Vec2 } from 'domain/entities/vec2';
import { getBoxHandles, getHandles } from 'domain/staticObjects/geometry';
import { parseTextContent } from 'domain/staticObjects/text';
import type { Handle, ShapeGeometry } from 'domain/staticObjects/types';

const HOVER_COLOR = '#0097A8';
const STROKE_COLOR = '#000';
const HOVER_AREA_WIDTH = 10;
const HANDLE_RADIUS = 4;
const TEXT_FONT_FAMILY = 'Arial';
const TEXT_FONT_SIZE_PX = 13;
const TEXT_LINE_HEIGHT = 1.2;
const SCRIPT_FONT_SCALE = 0.5;

export const STATIC_OBJECT_HANDLE_ATTRIBUTE = 'data-static-object-handle';

type GroupSelection = D3SvgElementSelection<SVGGElement, void>;

function toCanvas(point: Vec2): Vec2 {
  return Coordinates.modelToCanvas(point);
}

function appendShapeOutline(
  parent: GroupSelection,
  geometry: ShapeGeometry,
): D3SvgElementSelection<SVGElement, void> {
  const start = toCanvas(geometry.start);
  const end = toCanvas(geometry.end);

  switch (geometry.kind) {
    case SimpleObjectMode.ellipse:
      return parent
        .append('ellipse')
        .attr('cx', (start.x + end.x) / 2)
        .attr('cy', (start.y + end.y) / 2)
        .attr('rx', Math.abs(end.x - start.x) / 2)
        .attr('ry', Math.abs(end.y - start.y) / 2) as never;
    case SimpleObjectMode.rectangle:
      return parent
        .append('rect')
        .attr('x', Math.min(start.x, end.x))
        .attr('y', Math.min(start.y, end.y))
        .attr('width', Math.abs(end.x - start.x))
        .attr('height', Math.abs(end.y - start.y)) as never;
    default:
      return parent
        .append('line')
        .attr('x1', start.x)
        .attr('y1', start.y)
        .attr('x2', end.x)
        .attr('y2', end.y) as never;
  }
}

export class StaticObjectRenderer extends BaseRenderer {
  private selectionElement?: GroupSelection;

  constructor(public staticObject: CoreStaticObject) {
    super(staticObject);
    this.staticObject.setRenderer(this);
  }

  public get resizeHandles(): ReadonlyMap<Handle, Vec2> {
    const { content } = this.staticObject;
    if (content.type === 'shape') {
      return getHandles(content.geometry);
    }
    if (content.type === 'image') {
      return getBoxHandles(content.box);
    }
    return new Map();
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', '.monomer')
      .data([this])
      .attr('data-testid', `static-object-${this.staticObject.content.type}`)
      .attr('data-static-object-id', this.staticObject.id) as never;

    this.appendBody();
    this.appendHoverAreaElement();
    this.drawSelection();
  }

  private appendBody() {
    if (!this.rootElement) {
      return;
    }
    const { content } = this.staticObject;

    if (content.type === 'shape') {
      appendShapeOutline(this.rootElement, content.geometry)
        .attr('fill', 'none')
        .attr('stroke', STROKE_COLOR)
        .attr('stroke-width', 1);
      return;
    }

    if (content.type === 'image') {
      const topLeft = toCanvas(content.box.min);
      const bottomRight = toCanvas(content.box.max);
      this.rootElement
        .append('image')
        .attr('href', content.bitmap)
        .attr('x', topLeft.x)
        .attr('y', topLeft.y)
        .attr('width', bottomRight.x - topLeft.x)
        .attr('height', bottomRight.y - topLeft.y)
        .attr('preserveAspectRatio', 'none');
      return;
    }

    this.appendText(content.content, toCanvas(content.position));
  }

  private appendText(content: string, topLeft: Vec2) {
    if (!this.rootElement) {
      return;
    }
    const textElement = this.rootElement
      .append('text')
      .attr('data-testid', 'text-label')
      .attr('font-family', TEXT_FONT_FAMILY)
      .attr('font-size', TEXT_FONT_SIZE_PX)
      .attr('fill', STROKE_COLOR);

    (parseTextContent(content) ?? []).forEach((paragraph, lineIndex) => {
      const runs = paragraph.length > 0 ? paragraph : [null];
      runs.forEach((run, runIndex) => {
        const tspan = textElement.append('tspan').text(run?.text ?? ' ');

        if (runIndex === 0) {
          tspan
            .attr('x', topLeft.x)
            .attr(
              'y',
              topLeft.y +
                TEXT_FONT_SIZE_PX * TEXT_LINE_HEIGHT * (lineIndex + 1),
            );
        }
        if (!run) {
          return;
        }

        const fontSize = run.fontSizePx ?? TEXT_FONT_SIZE_PX;
        tspan
          .attr(
            'font-size',
            run.script === 'normal' ? fontSize : fontSize * SCRIPT_FONT_SCALE,
          )
          .attr('font-weight', run.bold ? 'bold' : null)
          .attr('font-style', run.italic ? 'italic' : null)
          .attr(
            'baseline-shift',
            run.script === 'normal'
              ? null
              : run.script === 'subscript'
                ? 'sub'
                : 'super',
          );
      });
    });
  }

  private get canvasBox() {
    const { content } = this.staticObject;
    if (content.type === 'text') {
      const bbox = this.rootBBox;
      return bbox
        ? { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
        : undefined;
    }
    const min = toCanvas(this.staticObject.box.min);
    const max = toCanvas(this.staticObject.box.max);
    return { x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y };
  }

  private appendContour(
    parent: GroupSelection | undefined,
  ): D3SvgElementSelection<SVGElement, void> | undefined {
    if (!parent) {
      return undefined;
    }
    const { content } = this.staticObject;
    if (content.type === 'shape') {
      return appendShapeOutline(parent, content.geometry).attr('fill', 'none');
    }
    const box = this.canvasBox;
    return parent
      .append('rect')
      .attr('x', box?.x ?? 0)
      .attr('y', box?.y ?? 0)
      .attr('width', box?.width ?? 0)
      .attr('height', box?.height ?? 0)
      .attr('fill', 'none') as never;
  }

  protected appendHoverAreaElement(): void {
    if (!this.rootElement) {
      return;
    }
    const contour = this.appendContour(this.rootElement)
      ?.attr('stroke', 'transparent')
      .attr('stroke-width', HOVER_AREA_WIDTH)
      .attr(
        'pointer-events',
        this.staticObject.content.type === 'shape' ? 'stroke' : 'all',
      );

    contour
      ?.on('mouseover', () => {
        this.appendHover();
      })
      .on('mouseout', () => {
        this.removeHover();
      });
    this.hoverAreaElement = contour as never;
  }

  protected appendHover() {
    if (!this.rootElement) {
      return;
    }
    this.removeHover();
    this.hoverElement = this.appendContour(this.rootElement)
      ?.attr('stroke', HOVER_COLOR)
      .attr('stroke-width', 1.2)
      .attr('pointer-events', 'none')
      .attr('class', 'dynamic-element') as never;
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  public drawSelection() {
    this.removeSelection();
    if (!this.rootElement || !this.staticObject.selected) {
      return;
    }

    this.selectionElement = this.rootElement
      .insert('g', ':first-child')
      .attr('class', 'dynamic-element') as never;

    this.appendContour(this.selectionElement)
      ?.attr('stroke', SELECTION_COLOR)
      .attr('stroke-width', 6)
      .attr('pointer-events', 'none');

    this.resizeHandles.forEach((position, handle) => {
      const point = toCanvas(position);
      this.rootElement
        ?.append('circle')
        .attr('class', 'dynamic-element static-object-handle')
        .attr(STATIC_OBJECT_HANDLE_ATTRIBUTE, handle)
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', HANDLE_RADIUS)
        .attr('fill', STROKE_COLOR)
        .attr('pointer-events', 'all')
        .style('cursor', 'pointer');
    });
  }

  private removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
    this.rootElement?.selectAll('.static-object-handle').remove();
  }

  public get selectionPoints(): Vec2[] {
    return [toCanvas(this.staticObject.center)];
  }

  public moveSelection(): void {
    // intentional no-op: static objects are redrawn after they move
  }

  public remove() {
    this.removeHover();
    this.removeSelection();
    super.remove();
  }
}
