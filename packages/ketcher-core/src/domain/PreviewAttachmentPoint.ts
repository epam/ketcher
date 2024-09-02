import { AttachmentPoint } from './AttachmentPoint';
import { Coordinates } from 'domain/helpers/attachmentPointCalculations';
import { PreviewAttachmentPointConstructorParams } from 'domain/types';
import { UsageInMacromolecule } from 'application/render';
import util from 'application/render/util';
import { Vec2 } from 'domain/entities';

export class PreviewAttachmentPoint extends AttachmentPoint {
  private connected: boolean;
  private selected: boolean;
  private usage: UsageInMacromolecule;

  constructor(constructorParams: PreviewAttachmentPointConstructorParams) {
    super(constructorParams, true);

    this.connected = constructorParams.connected;
    this.selected = constructorParams.selected;
    this.usage = constructorParams.usage;

    this.appendAttachmentPoint();
  }

  protected renderAttachmentPointByCoordinates(
    attachmentOnBorder: Coordinates,
    attachmentPointCoordinates: Coordinates,
  ) {
    this.attachmentPoint = this.rootElement
      .insert('g', ':first-child')
      .data([this])
      .style('pointer-events', 'none')
      .style('cursor', 'pointer')
      .attr('class', 'dynamic-element');

    const attachmentPointElement = this.attachmentPoint.append('g');

    attachmentPointElement
      .append('line')
      .attr('x1', attachmentOnBorder.x)
      .attr('y1', attachmentOnBorder.y)
      .attr('x2', attachmentPointCoordinates.x)
      .attr('y2', attachmentPointCoordinates.y)
      .attr('stroke', this.stroke)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', '1px');

    const { color, stroke, fill } = util.useLabelStyles(
      this.selected,
      this.connected,
      this.usage,
    );

    const labelGroup = this.attachmentPoint?.append('g');

    const angleInRadians = Vec2.degrees_to_radians(this.initialAngle);
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);

    const centerX = attachmentPointCoordinates.x - 10;
    const centerY = attachmentPointCoordinates.y - 8;
    const rectX = centerX - 10 * cos;
    const rectY = centerY - 10 * sin;
    const labelX = attachmentPointCoordinates.x - 10 * cos;
    const labelY = attachmentPointCoordinates.y - 10 * sin;

    labelGroup
      .append('rect')
      .attr('x', rectX)
      .attr('y', rectY)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', 20)
      .attr('height', 16)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', '1px');

    labelGroup
      .append('text')
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('fill', color)
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text(this.attachmentPointName);

    return this.attachmentPoint;
  }

  public appendAttachmentPoint() {
    const [attachmentToBorderCoordinates, attachmentPointCoordinates] =
      this.getCoordinates(this.initialAngle);

    const attachmentPoint = this.renderAttachmentPointByCoordinates(
      attachmentToBorderCoordinates,
      attachmentPointCoordinates,
    );

    this.element = attachmentPoint;

    return attachmentPoint;
  }
}
