import { Vec2 } from 'domain/entities/vec2';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { D3SvgElementSelection } from 'application/render/types';
import { Selection, line } from 'd3';
import { BaseMonomer } from './entities/BaseMonomer';
import assert from 'assert';
import {
  canvasToMonomerCoordinates,
  findLabelPoint,
  getSearchFunction,
  Coordinates,
} from './helpers/attachmentPointCalculations';

export class AttachmentPoint {
  static attachmentPointVector = 12;
  static attachmentPointLength = Math.hypot(
    AttachmentPoint.attachmentPointVector,
    AttachmentPoint.attachmentPointVector,
  );

  static labelOffset = 7;
  static radius = 6;
  static colors = {
    fillUsed: '#FF7A00',
    fill: 'white',
    fillPotentially: '#167782',
    strokeUsed: '#FF7A00',
    stroke: '#167782',
    strokePotentially: '#167782',
  };

  private rootElement: D3SvgElementSelection<SVGGElement, void>;
  private monomer: BaseMonomer;
  private bodyWidth: number;
  private bodyHeight: number;
  private attachmentPointName: string;
  private canvasOffset: Coordinates;
  private centerOFMonomer: Coordinates;
  private element: Selection<SVGGElement, void, HTMLElement, never> | undefined;
  private hoverableArea:
    | Selection<SVGGElement, void, HTMLElement, never>
    | undefined;

  private initialAngle = 0;
  private isUsed: boolean;
  private fill: string;
  private stroke: string;
  private isSnake;

  constructor(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
    monomer,
    bodyWidth,
    bodyHeight,
    canvas,
    attachmentPointName,
    isUsed,
    isPotentiallyUsed,
    angle = 0,
    isSnake,
  ) {
    this.rootElement = rootElement;
    this.monomer = monomer;
    this.bodyWidth = bodyWidth;
    this.bodyHeight = bodyHeight;
    this.canvasOffset = canvas.node().getBoundingClientRect();
    this.attachmentPointName = attachmentPointName;
    this.centerOFMonomer = monomer.renderer.center;
    this.isSnake = isSnake;
    this.isUsed = isUsed;
    this.initialAngle = angle;

    if (isUsed) {
      this.fill = AttachmentPoint.colors.fillUsed;
      this.stroke = AttachmentPoint.colors.strokeUsed;
    } else if (isPotentiallyUsed) {
      this.fill = AttachmentPoint.colors.fillPotentially;
      this.stroke = AttachmentPoint.colors.strokePotentially;
    } else {
      this.fill = AttachmentPoint.colors.fill;
      this.stroke = AttachmentPoint.colors.stroke;
    }

    this.appendAttachmentPoint();
  }

  private renderAttachmentPointByCoordinates(
    attachmentOnBorder: Coordinates,
    attachmentPointCoordinates: Coordinates,
    labelCoordinatesOnMonomer: Coordinates,
  ) {
    const fill = this.fill;
    const stroke = this.stroke;

    const attachmentPoint = this.rootElement.insert('g', ':first-child');

    const attachmentPointElement = attachmentPoint.append('g');

    attachmentPointElement
      .append('line')
      .attr('x1', attachmentOnBorder.x)
      .attr('y1', attachmentOnBorder.y)
      .attr('x2', attachmentPointCoordinates.x)
      .attr('y2', attachmentPointCoordinates.y)
      .attr('stroke', stroke)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', '2px');

    attachmentPointElement
      .append('circle')
      .attr('r', AttachmentPoint.radius)
      .attr('cx', attachmentPointCoordinates.x)
      .attr('cy', attachmentPointCoordinates.y)
      .attr('stroke', fill === 'white' ? '#0097A8' : 'white')
      .attr('stroke-width', '1px')
      .attr('fill', fill);

    const labelGroup = attachmentPoint.append('text');

    labelGroup
      .text(this.attachmentPointName)
      .attr('x', labelCoordinatesOnMonomer.x)
      .attr('y', labelCoordinatesOnMonomer.y)
      .style('font-size', '12px')
      .style('fill', '#585858')
      .style('user-select', 'none');

    return attachmentPoint;
  }

  private renderHoverableArea(
    monomerCenter: Coordinates,
    attachmentPointCenter: Coordinates,
    angleDegrees: number,
  ) {
    if (!this.element) {
      return;
    }

    const rotation = angleDegrees + 90;
    const halfWidth = 20;

    const areaHeight = Math.sqrt(
      (monomerCenter.x - attachmentPointCenter.x) ** 2 +
        (monomerCenter.y - attachmentPointCenter.y) ** 2,
    );

    const points: Coordinates[] = [
      { x: -AttachmentPoint.radius, y: 0 },
      { x: AttachmentPoint.radius, y: 0 },
      {
        x: halfWidth,
        y: -areaHeight,
      },
      {
        x: -halfWidth,
        y: -areaHeight,
      },
      { x: -AttachmentPoint.radius, y: 0 },
    ];

    const lineFunction = line<Coordinates>()
      .x(function (point) {
        return point.x;
      })
      .y(function (point) {
        return point.y;
      });

    const hoverableAreaElement = this.element.append('g');

    hoverableAreaElement
      .append('path')
      .attr('d', lineFunction(points) + 'z')
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('fill', '#0097A8')
      .attr(
        'transform',
        `translate(${attachmentPointCenter.x},${attachmentPointCenter.y})rotate(${rotation})`,
      );

    return hoverableAreaElement;
  }

  public appendAttachmentPoint() {
    let angleDegrees;
    let angleRadians: number;
    const flip =
      this.monomer.id ===
      this.monomer.attachmentPointsToBonds[this.attachmentPointName]
        ?.firstMonomer?.id;

    if (!this.isUsed) {
      angleDegrees = this.initialAngle;
    } else if (
      this.isSnake &&
      !this.monomer.attachmentPointsToBonds[
        this.attachmentPointName
      ]?.renderer.isMonomersOnSameHorizontalLine()
    ) {
      angleRadians = flip ? Math.PI : 0;
      angleDegrees = Vec2.radiansToDegrees(angleRadians);
    } else {
      const angleRadians = this.rotateToAngle(
        this.monomer.attachmentPointsToBonds[this.attachmentPointName],
        flip,
      );

      angleDegrees = Vec2.radiansToDegrees(angleRadians);
    }

    const [pointOnBorder, pointOfAttachment, labelPoint] =
      this.catchThePoint(angleDegrees);

    const attachmentToCenterCoordinates = canvasToMonomerCoordinates(
      this.centerOFMonomer,
      this.centerOFMonomer,
      this.bodyWidth,
      this.bodyHeight,
    );

    const attachmentToBorderCoordinates = canvasToMonomerCoordinates(
      pointOnBorder,
      this.centerOFMonomer,
      this.bodyWidth,
      this.bodyHeight,
    );

    const attachmentPointCoordinates = canvasToMonomerCoordinates(
      pointOfAttachment,
      this.centerOFMonomer,
      this.bodyWidth,
      this.bodyHeight,
    );

    const labelCoordinates = canvasToMonomerCoordinates(
      labelPoint,
      this.centerOFMonomer,
      this.bodyWidth,
      this.bodyHeight,
    );

    const attachmentPoint = this.renderAttachmentPointByCoordinates(
      attachmentToBorderCoordinates,
      attachmentPointCoordinates,
      labelCoordinates,
    );

    this.element = attachmentPoint;

    const hoverableArea = this.renderHoverableArea(
      attachmentToCenterCoordinates,
      attachmentPointCoordinates,
      angleDegrees,
    );

    this.hoverableArea = hoverableArea;

    return attachmentPoint;
  }

  public rotateToAngle(polymerBond: PolymerBond, flip = false) {
    let angleRadians = 0;
    if (flip) {
      angleRadians = Vec2.oxAngleForVector(
        polymerBond.endPosition,
        polymerBond.position,
      );
    } else {
      angleRadians = Vec2.oxAngleForVector(
        polymerBond.position,
        polymerBond.endPosition,
      );
    }

    return angleRadians;
  }

  private catchThePoint(rotationAngle: number): Coordinates[] {
    assert(this.monomer.renderer);

    const currentMonomerCenter = {
      x: this.monomer.renderer.center.x,
      y: this.monomer.renderer.center.y,
    };

    this.initialAngle = rotationAngle;

    const findPointOnMonomerBorder = getSearchFunction(
      this.initialAngle - 180,
      this.canvasOffset,
      this.monomer,
    );

    const pointOnBorder = findPointOnMonomerBorder(
      currentMonomerCenter,
      (this.bodyWidth + this.bodyHeight) / 2,
    );

    const [labelPoint, pointOfAttachment] = findLabelPoint(
      pointOnBorder,
      this.initialAngle - 180,
      AttachmentPoint.attachmentPointLength,
      AttachmentPoint.labelOffset,
    );
    return [pointOnBorder, pointOfAttachment, labelPoint];
  }

  public getElement() {
    return this.element;
  }

  public getHoverableArea() {
    return this.hoverableArea;
  }

  public getAngle() {
    if (this.initialAngle < 0 && this.isUsed) {
      return this.initialAngle + 360;
    }
    return this.initialAngle;
  }
}
