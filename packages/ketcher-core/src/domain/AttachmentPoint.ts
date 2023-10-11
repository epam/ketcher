import { Vec2 } from 'domain/entities/vec2';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer } from './entities/BaseMonomer';
import assert from 'assert';
import {
  canvasToMonomerCoordinates,
  findLabelPoint,
  getSearchFunction,
} from './helpers/attachmentPointCalculations';

export class AttachmentPoint {
  static attachmentPointVector = 12;
  static attachmentPointLength = Math.hypot(
    AttachmentPoint.attachmentPointVector,
    AttachmentPoint.attachmentPointVector,
  );

  static labelOffset = 7;
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
  private canvasOffset: { x: number; y: number };
  private centerOFMonomer: { x: number; y: number };
  private element;
  private initialAngle: number;
  private isUsed: boolean;
  private fill: string;
  private stroke: string;
  private isSnake;

  public static appendAttachmentPointUnused(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
    position,
    rotation,
    isAttachmentPointPotentiallyUsed,
    label: string,
    x,
    y,
    length = AttachmentPoint.attachmentPointLength,
    y2 = 0,
    cx = -12,
    cy = 0,
  ) {
    let fill = this.colors.fill;
    let stroke = this.colors.stroke;

    if (isAttachmentPointPotentiallyUsed) {
      fill = this.colors.fillPotentially;
      stroke = this.colors.strokePotentially;
    }

    const attachmentPointElement = rootElement
      ?.insert('g', ':first-child')
      .attr('transform', `translate(${position.x}, ${position.y})`);

    const attachmentPointRotationGroup = attachmentPointElement
      .append('g')
      .attr('transform', `rotate(${rotation})`);

    attachmentPointRotationGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', -length)
      .attr('y2', y2)
      .attr('stroke', stroke)
      .attr('stroke-width', '2px');

    attachmentPointRotationGroup
      .append('circle')
      .attr('r', 6)
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('stroke', fill === 'white' ? '#0097A8' : 'white')
      .attr('stroke-width', '1px')
      .attr('fill', fill);

    attachmentPointElement
      .append('text')
      .text(label)
      .attr('x', x)
      .attr('y', y)
      .style('font-size', '12px')
      .style('fill', '#585858')
      .style('user-select', 'none');

    return attachmentPointElement;
  }

  constructor(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
    monomer,
    bodyWidth,
    bodyHeight,
    canvas,
    RN,
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
    this.attachmentPointName = RN;
    this.centerOFMonomer = monomer.renderer.center;
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
    this.isSnake = isSnake;

    this.appendAttachmentPoint();
  }

  private renderAttachmentPointByCoordinates(
    attachmentOnBorder,
    attachmentPointCoordinates,
    labelCoordinatesOnMonomer,
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
      .attr('r', 6)
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

  public appendAttachmentPoint() {
    let angleDegrees;

    if (!this.isUsed) {
      angleDegrees = this.initialAngle;
    } else {
      const angleRadians = this.rotateToAngle(
        this.monomer.attachmentPointsToBonds[this.attachmentPointName],
        this.monomer.id ===
          this.monomer.attachmentPointsToBonds[this.attachmentPointName]
            ?.firstMonomer?.id,
      );

      angleDegrees = Vec2.radians_to_degrees(angleRadians);
    }

    const [pointOnBorder, pointOfAttachment, labelPoint] =
      this.catchThePoint(angleDegrees);
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
    return attachmentPoint;
  }

  public appendAttachmentPointToBond() {
    let angleRadians: number;
    const flip =
      this.monomer.id ===
      this.monomer.attachmentPointsToBonds[this.attachmentPointName]
        ?.firstMonomer?.id;
    if (this.isSnake) {
      angleRadians = flip ? Math.PI : 0;
    } else {
      angleRadians = this.rotateToAngle(
        this.monomer.attachmentPointsToBonds[this.attachmentPointName],
        flip,
      );
    }

    const angleDegrees = Vec2.radians_to_degrees(angleRadians);

    const [pointOnBorder, pointOfAttachment, labelPoint] =
      this.catchThePoint(angleDegrees);
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

  private catchThePoint(rotationAngle: number): { x: number; y: number }[] {
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

  public getAngle() {
    if (this.initialAngle < 0 && this.isUsed) {
      return this.initialAngle + 360;
    }
    return this.initialAngle;
  }
}
