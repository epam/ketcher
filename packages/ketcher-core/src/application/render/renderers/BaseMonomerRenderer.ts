import { BaseRenderer } from './BaseRenderer';
import assert from 'assert';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { D3SvgElementSelection } from 'application/render/types';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { editorEvents } from 'application/editor/editorEvents';
import { Scale } from 'domain/helpers';
import { AttachmentPoint } from 'domain/AttachmentPoint';
import { AttachmentPointName } from 'domain/types';

export abstract class BaseMonomerRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionCircle?: D3SvgElementSelection<SVGCircleElement, void>;
  private selectionBorder?: D3SvgElementSelection<SVGUseElement, void>;
  private attachmentPointElements:
    | D3SvgElementSelection<SVGGElement, void>[]
    | [] = [];

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

  private isSnakeBondForAttachmentPoint(
    attachmentPointName: AttachmentPointName,
  ) {
    return (
      this.monomer.attachmentPointsToBonds[attachmentPointName]?.renderer
        ?.isSnake &&
      !this.monomer.attachmentPointsToBonds[
        attachmentPointName
      ]?.renderer?.isMonomersOnSameHorizontalLine()
    );
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

      for (let i = 0; i < this.monomer.listOfAttachmentPoints.length; i++) {
        const atPoint = this.appendAttachmentPoint(
          this.monomer.listOfAttachmentPoints[i],
          i,
        );
        this.attachmentPointElements.push(atPoint as never);
      }
    } else {
      this.removeAttachmentPoints();
    }
  }

  public appendAttachmentPoint(AttachmentPointName, number) {
    let rotation;
    let position;
    let x;
    let y;
    let length;
    let y2;
    let cx;
    let cy;

    switch (number) {
      case 0:
        rotation = 0;
        position = { x: 0, y: this.bodyHeight / 2 };
        x = -18;
        y = -10;
        break;
      case 1:
        rotation = 180;
        position = { x: this.bodyWidth, y: this.bodyHeight / 2 };
        x = 5;
        y = -10;
        break;
      case 2:
        rotation = 90;
        position = { x: this.bodyWidth / 2, y: 0 };
        x = -7;
        y = -22;
        break;
      case 3:
        rotation = 270;
        position = { x: this.bodyWidth / 2, y: this.bodyHeight };
        x = -5;
        y = 30;
        break;
      case 4:
        rotation = 60;
        position = { x: this.bodyWidth / 5, y: 5 };
        x = -10;
        y = -20;
        y2 = 5;
        cx = -20;
        cy = 5;
        break;
      default:
        rotation = 150;
        position = { x: (this.bodyWidth / 5) * 4, y: 5 };
        x = 20;
        y = -18;
        y2 = 5;
        cx = -20;
        cy = 5;
    }

    let atP;

    if (this.monomer.isAttachmentPointUsed(AttachmentPointName)) {
      const attPointInstance = new AttachmentPoint(
        this.rootElement as D3SvgElementSelection<SVGGElement, void>,
        this.monomer,
        this.bodyWidth,
        this.bodyHeight,
        this.canvas,
        AttachmentPointName,
        this.isSnakeBondForAttachmentPoint(AttachmentPointName),
      );
      atP = attPointInstance.getElement();
    } else {
      atP = AttachmentPoint.appendAttachmentPointUnused(
        this.rootElement as D3SvgElementSelection<SVGGElement, void>,
        position,
        rotation,
        this.monomer.isAttachmentPointPotentiallyUsed(AttachmentPointName),
        AttachmentPointName,
        x,
        y,
        length,
        y2,
        cx,
        cy,
      );
    }

    return atP;
  }

  public removeAttachmentPoints() {
    this.attachmentPointElements.forEach((item) => {
      item.remove();
    });
    this.attachmentPointElements = [];
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
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
    return Scale.protoToCanvas(this.monomer.position, this.editorSettings);
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
