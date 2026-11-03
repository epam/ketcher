import { BaseRenderer } from './BaseRenderer';
import type { RGroupAttachmentPointDrawingEntity } from 'domain/entities/RGroupAttachmentPointDrawingEntity';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Vec2 } from 'domain/entities/vec2';
import { Box2Abs } from 'domain/entities/box2Abs';
import { getRGroupAttachmentPointDirection } from './rGroupAttachmentPointGeometry';
import { getSvgCurveShapeAttachmentPoint } from 'application/render/draw';
import { editorEvents } from 'application/editor/editorEvents';
import type { D3SvgElementSelection } from 'application/render/types';
import {
  atomLabelShift,
  attachmentPointGeometry,
} from 'application/render/geometry/atomGeometry';
import { SELECTION_COLOR } from './constants';

export class RGroupAttachmentPointRenderer extends BaseRenderer {
  private geometryKey?: string;
  private contour?: D3SvgElementSelection<SVGRectElement, void>;
  public showNumber = false;
  public both = false;

  constructor(
    public readonly attachmentPoint: RGroupAttachmentPointDrawingEntity,
  ) {
    super(attachmentPoint);
    attachmentPoint.setBaseRenderer(this as BaseRenderer);
  }

  private get direction() {
    return getRGroupAttachmentPointDirection(
      this.attachmentPoint.atom,
      this.attachmentPoint.point.type,
      this.both,
    );
  }

  private get geometry() {
    const atom = this.attachmentPoint.atom;
    const position = Coordinates.modelToCanvas(atom.position);
    const direction = this.direction;
    const scale = this.editorSettings.macroModeScale;
    const shift = atomLabelShift(
      position,
      direction,
      atom.renderer?.labelBBoxes.map((box) => Box2Abs.fromRelBox(box)) ?? [],
    );
    const stemStart = position.addScaled(
      direction,
      shift > 0 ? shift + (3 * scale) / 20 : 0,
    );
    return attachmentPointGeometry(position, direction, scale, stemStart);
  }

  public get endPoint() {
    return this.geometry.attachmentPointEnd;
  }

  public get selectionPoints() {
    return [this.endPoint];
  }

  /** Relative bounds consumed by the definition's bracket renderer. */
  public get relativeBox(): Box2Abs {
    const end = this.endPoint.sub(
      Coordinates.modelToCanvas(this.attachmentPoint.atom.position),
    );
    return new Box2Abs(new Vec2().min(end), new Vec2().max(end)).extend(
      new Vec2(20, 12),
      new Vec2(20, 12),
    );
  }

  public refresh(): void {
    const labelBoxes = this.attachmentPoint.atom.renderer?.labelBBoxes
      .map(({ x, y, width, height }) => `${x},${y},${width},${height}`)
      .join(';');
    const key = `${this.attachmentPoint.atom.position}:${this.direction}:${this.showNumber}:${labelBoxes}`;
    if (key !== this.geometryKey || !this.rootElement) {
      this.remove();
      this.geometryKey = key;
      this.show();
    }
    this.drawSelection();
    this.redrawHover();
  }

  public show(): void {
    const { atom, point } = this.attachmentPoint;
    const {
      shiftedStemStart: start,
      attachmentPointEnd: end,
      labelPosition: label,
    } = this.geometry;
    const direction = this.direction;
    const scale = this.editorSettings.macroModeScale;
    this.rootElement = this.canvas
      .append('g')
      .data([this])
      .attr('data-testid', 'attachment-point')
      .attr('data-primary-or-secondary', point.type)
      .attr('data-attached-to-atomid', atom.atomIdInMicroMode)
      .on('mouseover', (event) =>
        editorEvents.mouseOverDrawingEntity.dispatch(event),
      )
      .on('mouseleave', (event) =>
        editorEvents.mouseLeaveDrawingEntity.dispatch(event),
      ) as never as D3SvgElementSelection<SVGGElement, void>;
    this.rootElement
      .append('path')
      .attr(
        'd',
        `M${start.x},${start.y}L${end.x},${end.y} ${getSvgCurveShapeAttachmentPoint(end, direction, scale)}`,
      )
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', scale / 20)
      .attr('pointer-events', 'none');
    if (this.showNumber) {
      this.rootElement
        .append('text')
        .attr('x', label.x)
        .attr('y', label.y)
        .attr('font-family', 'Arial')
        .attr('font-size', 13 * 0.9)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('pointer-events', 'all')
        .text(point.type === 'primary' ? '1' : '2');
    }
    const bbox = this.rootElement.node()?.getBBox();
    if (!bbox) return;
    this.contour = this.rootElement
      .insert('rect', ':first-child')
      .attr('x', bbox.x - 4)
      .attr('y', bbox.y - 4)
      .attr('width', bbox.width + 8)
      .attr('height', bbox.height + 8)
      .attr('rx', 4)
      .attr('fill', 'none')
      .attr('pointer-events', 'none');
    this.rootElement
      .append('path')
      .data([this])
      .attr(
        'd',
        `M${start.x},${start.y}L${end.x},${end.y} ${getSvgCurveShapeAttachmentPoint(end, direction, scale)}`,
      )
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 10)
      .attr('pointer-events', 'stroke');
  }

  public drawSelection(): void {
    this.contour?.attr(
      'fill',
      this.attachmentPoint.atom.selected ? SELECTION_COLOR : 'none',
    );
  }
  public moveSelection(): void {
    this.refresh();
  }
  protected appendHover(): void {
    this.contour?.attr('stroke', '#0097a8').attr('stroke-width', 1.2);
  }
  protected removeHover(): void {
    this.contour?.attr('stroke', 'none');
  }
  protected appendHoverAreaElement(): void {
    /* Hit testing uses the widened stem and wave path. */
  }
}
