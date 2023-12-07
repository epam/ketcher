import { Vec2 } from 'domain/entities/vec2';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { D3SvgElementSelection } from 'application/render/types';
import { Selection, line } from 'd3';
import { BaseMonomer } from './entities/BaseMonomer';
import assert from 'assert';
import {
  canvasToMonomerCoordinates,
  findLabelPoint,
  Coordinates,
  getSearchFunction,
} from './helpers/attachmentPointCalculations';
import { editorEvents } from 'application/editor/editorEvents';
import { AttachmentPointConstructorParams, AttachmentPointName } from './types';

export class AttachmentPoint {
  static attachmentPointVector = 12;
  static attachmentPointLength = Math.hypot(
    AttachmentPoint.attachmentPointVector,
    AttachmentPoint.attachmentPointVector,
  );

  static labelOffset = 7;
  static radius = 6;
  static labelSize = { x: 7, y: 5 };
  static colors = {
    fillUsed: '#FF7A00',
    fill: 'white',
    fillPotentially: '#167782',
    strokeUsed: '#FF7A00',
    stroke: '#167782',
    strokePotentially: '#167782',
  };

  private rootElement: D3SvgElementSelection<SVGGElement, void>;
  private attachmentPoint: D3SvgElementSelection<SVGGElement, void> | null;
  private monomer: BaseMonomer;
  private bodyWidth: number;
  private bodyHeight: number;
  private attachmentPointName: string;
  private canvasOffset: Coordinates;
  private centerOfMonomer: Coordinates;
  private element: Selection<SVGGElement, void, HTMLElement, never> | undefined;
  private hoverableArea:
    | Selection<SVGGElement, void, HTMLElement, never>
    | undefined;

  private initialAngle = 0;
  private isUsed: boolean;
  private fill: string;
  private stroke: string;
  private isSnake;
  private editorEvents: typeof editorEvents;

  constructor(constructorParams: AttachmentPointConstructorParams) {
    this.rootElement = constructorParams.rootElement;
    this.monomer = constructorParams.monomer;
    this.bodyWidth = constructorParams.bodyWidth;
    this.bodyHeight = constructorParams.bodyHeight;
    this.canvasOffset =
      constructorParams.canvas.node()?.getBoundingClientRect() ||
      new DOMRect(0, 0, 0, 0);
    this.attachmentPointName = constructorParams.attachmentPointName;
    this.centerOfMonomer =
      constructorParams.monomer.renderer?.center || new Vec2(0, 0, 0);
    this.isSnake = constructorParams.isSnake;
    this.isUsed = constructorParams.isUsed;
    this.initialAngle = constructorParams.angle;
    this.editorEvents = editorEvents;
    this.attachmentPoint = null;

    if (constructorParams.isPotentiallyUsed) {
      this.fill = AttachmentPoint.colors.fillPotentially;
      this.stroke = AttachmentPoint.colors.strokePotentially;
    } else if (constructorParams.isUsed) {
      this.fill = AttachmentPoint.colors.fillUsed;
      this.stroke = AttachmentPoint.colors.strokeUsed;
    } else {
      this.fill = AttachmentPoint.colors.fill;
      this.stroke = AttachmentPoint.colors.stroke;
    }

    this.appendAttachmentPoint();
  }

  public removeAttachmentPoint() {
    const remove = () => {
      this.element?.remove();
    };
    setTimeout(remove, 1);
  }

  private renderAttachmentPointByCoordinates(
    attachmentOnBorder: Coordinates,
    attachmentPointCoordinates: Coordinates,
    labelCoordinatesOnMonomer: Coordinates,
  ) {
    const fill = this.fill;
    const stroke = this.stroke;

    this.attachmentPoint = this.rootElement.insert('g', ':first-child');

    const attachmentPointElement = this.attachmentPoint.append('g');

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

    const labelGroup = this.attachmentPoint.append('text');

    labelGroup
      .text(this.attachmentPointName)
      .attr('x', labelCoordinatesOnMonomer.x)
      .attr('y', labelCoordinatesOnMonomer.y)
      .style('font-size', '12px')
      .style('fill', '#585858')
      .style('user-select', 'none');

    return this.attachmentPoint;
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
      { x: -AttachmentPoint.radius, y: AttachmentPoint.radius },
      { x: AttachmentPoint.radius, y: AttachmentPoint.radius },
      {
        x: halfWidth,
        y: -areaHeight + 10,
      },
      {
        x: -halfWidth,
        y: -areaHeight + 10,
      },
      { x: -AttachmentPoint.radius, y: AttachmentPoint.radius },
    ];

    const lineFunction = line<Coordinates>()
      .x(({ x }) => x)
      .y(({ y }) => y);

    const hoverableAreaElement = this.element.append('g');

    hoverableAreaElement
      .append('path')
      .attr('d', lineFunction(points) + 'z')
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('fill', '#0097A8')
      .style('opacity', '0')
      .attr(
        'transform',
        `translate(${attachmentPointCenter.x},${attachmentPointCenter.y})rotate(${rotation})`,
      );

    hoverableAreaElement
      .on('mouseover', (event) => {
        event.attachmentPointName = this.attachmentPointName;
        this.editorEvents.mouseOverAttachmentPoint.dispatch(event);
      })
      .on('mouseleave', (event) => {
        this.editorEvents.mouseLeaveAttachmentPoint.dispatch(event);
      })
      .on('mousedown', (event) => {
        event.attachmentPointName = this.attachmentPointName;
        this.editorEvents.mouseDownAttachmentPoint.dispatch(event);
      })
      .on('mouseup', (event) => {
        event.attachmentPointName = this.attachmentPointName;
        this.editorEvents.mouseUpAttachmentPoint.dispatch(event);
      });

    return hoverableAreaElement;
  }

  public appendAttachmentPoint() {
    let angleDegrees;
    let angleRadians: number;
    const flip =
      this.monomer.id ===
      this.monomer.attachmentPointsToBonds[this.attachmentPointName]
        ?.firstMonomer?.id;
    const isAttachmentpointR1 = this.attachmentPointName === 'R1';
    if (!this.isUsed) {
      angleDegrees = this.initialAngle;
    } else if (
      this.isSnake &&
      !this.monomer.attachmentPointsToBonds[
        this.attachmentPointName
      ]?.renderer.isMonomersOnSameHorizontalLine()
    ) {
      angleRadians = isAttachmentpointR1 ? 0 : Math.PI;
      angleDegrees = Vec2.radiansToDegrees(angleRadians);
    } else {
      angleRadians = this.rotateToAngle(
        this.monomer.attachmentPointsToBonds[this.attachmentPointName],
        flip,
      );

      angleDegrees = Vec2.radiansToDegrees(angleRadians);
    }

    const [
      attachmentToBorderCoordinates,
      attachmentPointCoordinates,
      labelCoordinates,
    ] = this.getCoordinates(angleDegrees);

    const attachmentToCenterCoordinates = canvasToMonomerCoordinates(
      this.centerOfMonomer,
      this.centerOfMonomer,
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

  private getCoordinates(angleDegrees) {
    const [pointOnBorder, pointOfAttachment, labelPoint] =
      this.catchThePoint(angleDegrees);

    const attachmentToBorderCoordinates = canvasToMonomerCoordinates(
      pointOnBorder,
      this.centerOfMonomer,
      this.bodyWidth,
      this.bodyHeight,
    );

    const attachmentPointCoordinates = canvasToMonomerCoordinates(
      pointOfAttachment,
      this.centerOfMonomer,
      this.bodyWidth,
      this.bodyHeight,
    );

    const labelCoordinates = canvasToMonomerCoordinates(
      labelPoint,
      this.centerOfMonomer,
      this.bodyWidth,
      this.bodyHeight,
    );

    return [
      attachmentToBorderCoordinates,
      attachmentPointCoordinates,
      labelCoordinates,
    ];
  }

  public updateCoords() {
    const flip =
      this.monomer.id ===
      this.monomer.attachmentPointsToBonds[this.attachmentPointName]
        ?.firstMonomer?.id;

    const angleRadians = this.rotateToAngle(
      this.monomer.attachmentPointsToBonds[this.attachmentPointName],
      flip,
    );
    const angleDegrees = Vec2.radiansToDegrees(angleRadians);

    const [
      attachmentToBorderCoordinates,
      attachmentPointCoordinates,
      labelCoordinates,
    ] = this.getCoordinates(angleDegrees);

    this.attachmentPoint
      ?.select('line')
      .attr('x1', attachmentToBorderCoordinates.x)
      .attr('y1', attachmentToBorderCoordinates.y)
      .attr('x2', attachmentPointCoordinates.x)
      .attr('y2', attachmentPointCoordinates.y);

    this.attachmentPoint
      ?.select('circle')
      .attr('cx', attachmentPointCoordinates.x)
      .attr('cy', attachmentPointCoordinates.y)
      .attr('stroke', 'white')
      .attr('fill', AttachmentPoint.colors.fillPotentially);

    this.attachmentPoint
      ?.select('text')
      .attr('x', labelCoordinates.x)
      .attr('y', labelCoordinates.y);
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
      AttachmentPoint.labelSize,
      this.isUsed,
    );
    return [pointOnBorder, pointOfAttachment, labelPoint];
  }

  public getElement() {
    return this.element;
  }

  public getAttachmentPointName() {
    return this.attachmentPointName;
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
