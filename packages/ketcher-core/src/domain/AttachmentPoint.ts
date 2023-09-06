import { Vec2 } from 'domain/entities/vec2';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer } from './entities/BaseMonomer';

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
  private RN: string;
  private canvasOffset: { x: number; y: number };
  private centerOFMonomer: { x: number; y: number };
  private element;
  private initialAngle;

  public static appendAttachmentPointUnused(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
    position,
    rotation,
    isAttachmentPointPotentiallyUsed,
    label: string,
    x,
    y,
  ) {
    let fill = this.colors.fill;
    let stroke = this.colors.stroke;

    if (isAttachmentPointPotentiallyUsed) {
      fill = this.colors.fillPotentially;
      stroke = this.colors.strokePotentially;
    }

    const attachmentPointElement = rootElement
      ?.append('g')
      .attr('transform', `translate(${position.x}, ${position.y})`);

    const attachmentPointRotationGroup = attachmentPointElement
      .append('g')
      .attr('transform', `rotate(${rotation})`);

    attachmentPointRotationGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', -AttachmentPoint.attachmentPointLength)
      .attr('y2', 0)
      .attr('stroke', stroke)
      .attr('stroke-width', '2px');

    attachmentPointRotationGroup
      .append('circle')
      .attr('r', 6)
      .attr('cx', -12)
      .attr('cy', 0)
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
  ) {
    this.rootElement = rootElement;
    this.monomer = monomer;
    this.bodyWidth = bodyWidth;
    this.bodyHeight = bodyHeight;
    this.canvasOffset = canvas.node().getBoundingClientRect();
    this.RN = RN;
    this.centerOFMonomer = monomer.renderer.center;

    this.appendAttachmentPointToBond();
  }

  private renderUsedAttachmentPointByCoordinates(
    attachmentOnBorder,
    attachmentPointCoordinates,
    labelCoordinatesOnMonomer,
  ) {
    const fill = AttachmentPoint.colors.fillUsed;
    const stroke = AttachmentPoint.colors.strokeUsed;

    const attachmentPoint = this.rootElement.insert('g', ':first-child');

    const attachmentPointElement = attachmentPoint.append('g');

    attachmentPointElement
      .append('line')
      .attr('x1', attachmentOnBorder.x)
      .attr('y1', attachmentOnBorder.y)
      .attr('x2', attachmentPointCoordinates.x)
      .attr('y2', attachmentPointCoordinates.y)
      .attr('stroke', stroke)
      .attr('stroke-width', '2px');

    attachmentPointElement
      .append('circle')
      .attr('r', 6)
      .attr('cx', attachmentPointCoordinates.x)
      .attr('cy', attachmentPointCoordinates.y)
      .attr('stroke', 'white')
      .attr('stroke-width', '1px')
      .attr('fill', fill);

    const labelGroup = attachmentPoint.append('text');

    labelGroup
      .text(this.RN)
      .attr('x', labelCoordinatesOnMonomer.x)
      .attr('y', labelCoordinatesOnMonomer.y)
      .style('font-size', '12px')
      .style('fill', '#585858')
      .style('user-select', 'none');

    return attachmentPoint;
  }

  public appendAttachmentPointToBond() {
    let rad;

    if (
      this.monomer.id ===
      this.monomer.attachmentPointsToBonds[this.RN]?.firstMonomer?.id
    ) {
      rad = this.rotateToAngle(
        this.monomer.attachmentPointsToBonds[this.RN],
        true,
      );
    } else {
      rad = this.rotateToAngle(this.monomer.attachmentPointsToBonds[this.RN]);
    }
    const deg = Vec2.radians_to_degrees(rad);

    const [pointOnBorder, pointOfAttachment, labelPoint] =
      this.catchThePoint(deg);
    const attachmentOnBorder =
      this.canvas_to_monomer_coordinates(pointOnBorder);

    const attachmentPointCoordinates =
      this.canvas_to_monomer_coordinates(pointOfAttachment);

    const labelCoordinatesOnMonomer =
      this.canvas_to_monomer_coordinates(labelPoint);

    const attachmentPoint = this.renderUsedAttachmentPointByCoordinates(
      attachmentOnBorder,
      attachmentPointCoordinates,
      labelCoordinatesOnMonomer,
    );

    this.element = attachmentPoint;
    return attachmentPoint;
  }

  public rotateToAngle(polymerBond: PolymerBond | null, flip = false) {
    if (!polymerBond) {
      return 0;
    }
    let rad;
    if (flip) {
      rad = Vec2.oxAngleForVector(
        polymerBond.endPosition,
        polymerBond.position,
      );
    } else {
      rad = Vec2.oxAngleForVector(
        polymerBond.position,
        polymerBond.endPosition,
      );
    }

    return rad;
  }

  private catchThePoint(rotationAngle: number): { x: number; y: number }[] {
    if (!this.monomer.renderer) return Array(3).fill({ x: 0, y: 0 });

    const lengthInitial = (this.bodyWidth + this.bodyHeight) / 2.3;

    const currentMonomerCenter = {
      x: this.monomer.renderer.center.x,
      y: this.monomer.renderer.center.y,
    };

    this.initialAngle = rotationAngle - 180;

    const pointOnBorder = this.fastFindThePoint(
      currentMonomerCenter,
      lengthInitial,
    );

    const [labelPoint, pointOfAttachment] = this.findLabelPoint(
      pointOnBorder,
      this.initialAngle,
    );
    return [pointOnBorder, pointOfAttachment, labelPoint];
  }

  private fastFindThePoint(coordStart, length, angle = this.initialAngle) {
    const angleRadians = Vec2.degrees_to_radians(angle);

    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);

    const deltaX = length * cos;
    const deltaY = length * sin;

    const x2 = coordStart.x + deltaX;
    const y2 = coordStart.y + deltaY;

    const diff = Vec2.diff(
      new Vec2(coordStart.x, coordStart.y),
      new Vec2(x2, y2),
    );

    // exit recursion
    if (diff.length() < 4) {
      // there is small inaccurancy about 2 pixels in this calculations,
      // so we fix it with additional length from point.
      const deltaXO = 2 * cos;
      const deltaYO = 2 * sin;
      const newCoordStartWithOffset = { x: x2 + deltaXO, y: y2 + deltaYO };

      return newCoordStartWithOffset;
    }

    const newLength = Math.round(diff.length() / 2);
    const newCoordStart = { x: x2, y: y2 };

    const newPointCoord = {
      x: Math.round(x2) + this.canvasOffset.x,
      y: Math.round(y2) + this.canvasOffset.y,
    };
    const newPoint = document.elementFromPoint(
      newPointCoord.x,
      newPointCoord.y,
    );

    let newAngle;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((newPoint as any)?.__data__ === this.monomer.renderer) {
      newAngle = this.initialAngle;
    } else {
      newAngle = this.initialAngle - 180;
    }

    return this.fastFindThePoint(newCoordStart, newLength, newAngle);
  }

  private findLabelPoint(pointOnBorder, angle) {
    // based on https://ru.stackoverflow.com/a/1442905

    const angleRadians = Vec2.degrees_to_radians(angle);

    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);

    const deltaX = AttachmentPoint.attachmentPointLength * cos;
    const deltaY = AttachmentPoint.attachmentPointLength * sin;

    const pointOfAttachment = {
      x: pointOnBorder.x + deltaX,
      y: pointOnBorder.y + deltaY,
    };

    // find vector between pointOnBorder and pointOfAttachment

    const attachmentVector = { x: deltaX, y: deltaY };

    // rotate this vector at 90 degrees - change x and y, then make one negative
    let rotatedVector;
    if (angle >= -200 && angle < -60) {
      rotatedVector = { x: -attachmentVector.y, y: attachmentVector.x }; // for angle -200 to -60
    } else {
      rotatedVector = { x: attachmentVector.y, y: -attachmentVector.x }; // for angle -0 to -270
    }

    // normalize vector
    const normalizedVector = {
      x: rotatedVector.x / AttachmentPoint.attachmentPointLength,
      y: rotatedVector.y / AttachmentPoint.attachmentPointLength,
    };

    // find vector for Label, using normalized vector and length

    let addedLabelOffset = 0;
    if (angle >= -225 && angle < -180) {
      addedLabelOffset = 5;
    } else if (angle >= -60 && angle <= 0) {
      addedLabelOffset = 5;
    }

    const labelVector = {
      x: normalizedVector.x * (AttachmentPoint.labelOffset + addedLabelOffset),
      y: normalizedVector.y * (AttachmentPoint.labelOffset + addedLabelOffset),
    };

    // add this vector to point of attachment

    const labelCoordinates = {
      x: pointOfAttachment.x + labelVector.x,
      y: pointOfAttachment.y + labelVector.y,
    };

    return [labelCoordinates, pointOfAttachment];
  }

  public canvas_to_monomer_coordinates(coordinatesOnCanvas) {
    const zeroPointCoord = {
      x: this.centerOFMonomer.x - this.bodyWidth / 2,
      y: this.centerOFMonomer.y - this.bodyHeight / 2,
    };

    const monomerCoord = {
      x: coordinatesOnCanvas.x - zeroPointCoord.x,
      y: coordinatesOnCanvas.y - zeroPointCoord.y,
    };

    return monomerCoord;
  }

  public getElement() {
    return this.element;
  }
}
