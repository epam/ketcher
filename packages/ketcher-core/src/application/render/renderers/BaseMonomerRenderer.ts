import { BaseRenderer } from './BaseRenderer';
import assert from 'assert';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { D3SvgElementSelection } from 'application/render/types';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { editorEvents } from 'application/editor/editorEvents';
import { Scale } from 'domain/helpers';

export abstract class BaseMonomerRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionCircle?: D3SvgElementSelection<SVGCircleElement, void>;
  private selectionBorder?: D3SvgElementSelection<SVGUseElement, void>;
  private r1AttachmentPoint?: D3SvgElementSelection<SVGGElement, void>;
  private r2AttachmentPoint?: D3SvgElementSelection<SVGGElement, void>;
  static isSelectable() {
    return true;
  }

  protected constructor(
    public monomer: BaseMonomer,
    private monomerSelectedElementId: string,
    private monomerHoveredElementId: string,
    private scale?: number,
  ) {
    super(monomer as DrawingEntity);
    this.monomer.setRenderer(this);
    this.editorEvents = editorEvents;
  }

  public get center() {
    return {
      x: this.scaledMonomerPosition.x + this.bodyWidth / 2,
      y: this.scaledMonomerPosition.y + this.bodyHeight / 2,
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
    if (!this.rootElement) return;
    if (this.monomer.attachmentPointsVisible) {
      this.removeAttachmentPoints();
      this.r1AttachmentPoint = this.appendR1AttachmentPoint(this.rootElement);
      this.r2AttachmentPoint = this.appendR2AttachmentPoint(this.rootElement);
    } else {
      this.removeAttachmentPoints();
    }
  }

  public appendAttachmentPoint(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
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
    rootElement: D3SvgElementSelection<SVGGElement, void>,
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
    rootElement: D3SvgElementSelection<SVGGElement, void>,
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
    attachmentPointElement: D3SvgElementSelection<SVGGElement, void>,
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
    canvas: D3SvgElementSelection<SVGSVGElement, void>,
  ) {
    return canvas
      .append('g')
      .data([this])
      .attr('transition', 'transform 0.2s')
      .attr(
        'transform',
        `translate(${this.scaledMonomerPosition.x}, ${
          this.scaledMonomerPosition.y
        }) scale(${this.scale || 1})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;
  }

  private appendLabel(rootElement: D3SvgElementSelection<SVGGElement, void>) {
    const textElement = rootElement
      .append('text')
      .text(this.monomer.label)
      .attr('fill', this.textColor)
      .attr('font-size', '12px')
      .attr('line-height', '12px')
      .attr('font-weight', '700')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .attr('pointer-events', 'none');

    const textBBox = (textElement.node() as SVGTextElement).getBBox();

    textElement
      .attr('x', this.width / 2 - textBBox.width / 2)
      .attr('y', this.height / 2);
  }

  public appendHover(
    hoverAreaElement: D3SvgElementSelection<SVGGElement, void>,
  ) {
    if (this.hoverElement) this.hoverElement.remove();
    return hoverAreaElement
      .append('use')
      .attr('href', this.monomerHoveredElementId)
      .attr('pointer-events', 'none');
  }

  public removeHover() {
    if (!this.hoverElement) return;
    this.hoverElement.remove();
  }

  private get scaledMonomerPosition() {
    return Scale.obj2scaled(this.monomer.position, this.editorSettings);
  }

  public appendSelection() {
    this.removeSelection();

    this.selectionBorder = this.rootElement
      ?.append('use')
      .attr('href', this.monomerSelectedElementId)
      .attr('stroke', '#57FF8F')
      .attr('pointer-events', 'none');

    this.selectionCircle = this.canvas
      ?.insert('circle', ':first-child')
      .attr('r', '42px')
      .attr('cx', this.scaledMonomerPosition.x + this.bodyWidth / 2)
      .attr('cy', this.scaledMonomerPosition.y + this.bodyHeight / 2)
      .attr('fill', '#57FF8F');
  }

  public removeSelection() {
    this.selectionCircle?.remove();
    this.selectionBorder?.remove();
    this.selectionCircle = undefined;
    this.selectionBorder = undefined;
  }

  protected abstract appendBody(
    rootElement: D3SvgElementSelection<SVGGElement, void>,
    theme,
  );

  protected appendHoverAreaElement() {
    this.hoverAreaElement = this.rootElement;
  }

  private appendEvents() {
    assert(this.bodyElement);
    this.bodyElement
      .on('mouseover', (event) => {
        this.editorEvents.mouseOverDrawingEntity.dispatch(event);
        this.editorEvents.mouseOverMonomer.dispatch(event);
      })
      .on('mouseleave', (event) => {
        this.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
        this.editorEvents.mouseLeaveMonomer.dispatch(event);
      })
      .on('mouseup', (event) => {
        this.editorEvents.mouseUpMonomer.dispatch(event);
      });
  }

  public show(theme) {
    this.rootElement = this.rootElement || this.appendRootElement(this.canvas);
    this.bodyElement = this.appendBody(this.rootElement, theme);
    this.appendEvents();
    this.appendLabel(this.rootElement);
    this.appendHoverAreaElement();
    if (this.monomer.selected) {
      this.drawSelection();
    }
    this.redrawAttachmentPoints();
  }

  public drawSelection() {
    assert(this.rootElement);
    if (this.monomer.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
    }
  }

  public moveSelection() {
    assert(this.rootElement);
    this.appendSelection();
    this.move();
  }

  public move() {
    this.rootElement?.attr(
      'transform',
      `translate(${this.scaledMonomerPosition.x}, ${
        this.scaledMonomerPosition.y
      }) scale(${this.scale || 1})`,
    );
  }

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
    this.removeSelection();
  }
}
