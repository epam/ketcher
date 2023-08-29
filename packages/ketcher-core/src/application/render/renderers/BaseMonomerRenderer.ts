import { BaseRenderer } from './BaseRenderer';
import { Selection } from 'd3';
import assert from 'assert';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { IBaseMonomerRenderer } from './types';

export abstract class BaseMonomerRenderer
  extends BaseRenderer
  implements IBaseMonomerRenderer
{
  protected rootElement;

  private selectionElement;
  private bodyElement;
  private r1AttachmentPoint;
  private r2AttachmentPoint;
  static isSelectable() {
    return true;
  }

  constructor(
    public monomer: BaseMonomer,
    private monomerSelectedElementId: string,
    private scale?: number,
  ) {
    super();
    this.monomer.setRenderer(this);
  }

  public get rootBBox() {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get width() {
    return this.rootBBox?.width || 0;
  }

  public get height() {
    return this.rootBBox?.height || 0;
  }

  public get bodyBBox() {
    const rootNode = this.bodyElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get bodyWidth() {
    return this.bodyBBox?.width || 0;
  }

  public get bodyHeight() {
    return this.bodyBBox?.height || 0;
  }

  public get center() {
    return {
      x: this.monomer.position.x + this.bodyWidth / 2,
      y: this.monomer.position.y + this.bodyHeight / 2,
    };
  }

  public get textColor() {
    const WHITE = 'white';
    const colorsMap = {
      D: WHITE,
      F: WHITE,
      K: WHITE,
      Q: WHITE,
      R: WHITE,
      W: WHITE,
      Y: WHITE,
    };
    return (
      colorsMap[this.monomer.monomerItem.props.MonomerNaturalAnalogCode] ||
      'black'
    );
  }

  public redrawAttachmentPoints() {
    assert(this.rootElement);
    this.removeAttachmentPoints();
    this.r1AttachmentPoint = this.appendR1AttachmentPoint(this.rootElement);
    this.r2AttachmentPoint = this.appendR2AttachmentPoint(this.rootElement);
  }

  public appendAttachmentPoint(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    position,
    rotation,
    isAttachmentPointPotentiallyUsed,
    isAttachmentPointUsed,
  ) {
    let fill = 'white';
    let stroke = '#167782';

    if (isAttachmentPointPotentiallyUsed) {
      fill = '#167782';
      stroke = '#167782';
    } else if (isAttachmentPointUsed) {
      fill = '#FF7A00';
      stroke = '#FF7A00';
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
      .attr('x2', -6)
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

    return attachmentPointElement;
  }

  public appendR1AttachmentPoint(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ) {
    const attachmentPoint = this.appendAttachmentPoint(
      rootElement,
      { x: 0, y: this.bodyHeight / 2 },
      0,
      this.monomer.isAttachmentPointPotentiallyUsed('R1'),
      this.monomer.isAttachmentPointUsed('R1'),
    );
    this.appendAttachmentPointLabel(attachmentPoint, 'R1', -18, -10);

    return attachmentPoint;
  }

  public appendR2AttachmentPoint(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ) {
    const attachmentPoint = this.appendAttachmentPoint(
      rootElement,
      { x: this.bodyWidth, y: this.bodyHeight / 2 },
      180,
      this.monomer.isAttachmentPointPotentiallyUsed('R2'),
      this.monomer.isAttachmentPointUsed('R2'),
    );
    this.appendAttachmentPointLabel(attachmentPoint, 'R2', 5, -10);

    return attachmentPoint;
  }

  private appendAttachmentPointLabel(
    attachmentPointElement: Selection<SVGGElement, this, HTMLElement, never>,
    label: string,
    x,
    y,
  ) {
    return attachmentPointElement
      .append('text')
      .text(label)
      .attr('x', x)
      .attr('y', y)
      .style('font-size', '12px')
      .style('fill', '#585858')
      .style('user-select', 'none');
  }

  public removeAttachmentPoints() {
    this.r1AttachmentPoint?.remove();
    this.r2AttachmentPoint?.remove();
  }

  private appendRootElement(
    canvas: Selection<SVGElement, unknown, HTMLElement, never>,
  ) {
    return canvas
      .append('g')
      .data([this])
      .attr('transition', 'transform 0.2s')
      .attr(
        'transform',
        `translate(${this.monomer.position.x}, ${
          this.monomer.position.y
        }) scale(${this.scale || 1})`,
      );
  }

  private appendLabel(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ) {
    const textElement = rootElement
      .append('text')
      .text(this.monomer.label)
      .attr('fill', this.textColor)
      .attr('font-size', '12px')
      .attr('line-height', '12px')
      .attr('font-weight', '700')
      .style('cursor', 'pointer')
      .style('user-select', 'none');

    const textBBox = (textElement.node() as SVGTextElement).getBBox();

    textElement
      .attr('x', this.width / 2 - textBBox.width / 2)
      .attr('y', this.height / 2);
  }

  public appendSelection(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ) {
    if (this.selectionElement) this.selectionElement.remove();
    return rootElement
      ?.append('use')
      .attr('href', this.monomerSelectedElementId);
  }

  public removeSelection(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ) {
    if (!this.selectionElement) return;
    rootElement?.select(`[href="${this.monomerSelectedElementId}"]`).remove();
  }

  protected abstract appendBody(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    theme,
  );

  public show(theme) {
    this.rootElement = this.rootElement || this.appendRootElement(this.canvas);
    this.bodyElement = this.appendBody(this.rootElement, theme);
    this.appendLabel(this.rootElement);
    if (this.monomer.selected) {
      this.drawSelection();
      this.redrawAttachmentPoints();
    }
  }

  public drawSelection() {
    assert(this.rootElement);
    if (this.monomer.selected) {
      this.selectionElement = this.appendSelection(this.rootElement);
    } else {
      this.removeSelection(this.rootElement);
      this.selectionElement = null;
    }
  }

  public move() {
    this.rootElement?.attr(
      'transform',
      `translate(${this.monomer.position.x}, ${
        this.monomer.position.y
      }) scale(${this.scale || 1})`,
    );
  }

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }
}
