import { BaseRenderer } from './BaseRenderer';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { D3SvgElementSelection } from 'application/render/types';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { editorEvents } from 'application/editor/editorEvents';
import assert from 'assert';
import {
  attachmentPointNumberToAngle,
  anglesToSector,
  sectorsList,
  checkFor0and360,
} from 'domain/helpers/attachmentPointCalculations';
import { AttachmentPoint } from 'domain/AttachmentPoint';
import Coordinates from 'application/editor/shared/coordinates';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';

export abstract class BaseMonomerRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionCircle?: D3SvgElementSelection<SVGCircleElement, void>;
  private selectionBorder?: D3SvgElementSelection<SVGUseElement, void>;

  private freeSectorsList: number[] = sectorsList;

  private attachmentPointElements:
    | D3SvgElementSelection<SVGGElement, void>[]
    | [] = [];

  private monomerSymbolElement?: SVGUseElement | SVGRectElement;

  static isSelectable() {
    return true;
  }

  protected constructor(
    public monomer: BaseMonomer,
    private monomerSelectedElementId: string,
    private monomerHoveredElementId: string,
    monomerSymbolElementId: string,
    private scale?: number,
  ) {
    super(monomer as DrawingEntity);
    this.monomer.setRenderer(this);
    this.editorEvents = editorEvents;
    this.monomerSymbolElement = document.querySelector(
      `${monomerSymbolElementId} .monomer-body`,
    ) as SVGUseElement | SVGRectElement;
  }

  public get monomerSymbolBoundingClientRect() {
    assert(this.monomerSymbolElement);
    return this.monomerSymbolElement.getBoundingClientRect();
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
    return new Vec2(
      this.scaledMonomerPosition.x + this.bodyWidth / 2,
      this.scaledMonomerPosition.y + this.bodyHeight / 2,
    );
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
      this.drawAttachmentPoints();
    } else {
      this.removeAttachmentPoints();
    }
  }

  public drawAttachmentPoints() {
    // draw used attachment points

    this.monomer.usedAttachmentPointsNamesList.forEach((item) => {
      const [attachmentPointElement, angle] = this.appendAttachmentPoint(item);
      this.attachmentPointElements.push(attachmentPointElement as never);

      if (typeof angle === 'number') {
        // remove this sector from list of free sectors
        const newList = this.freeSectorsList.filter((item) => {
          return (
            anglesToSector[item].min > angle ||
            anglesToSector[item].max <= angle
          );
        });
        this.freeSectorsList = checkFor0and360(newList);
      }
    });

    const unrenderedAtPoints: string[] = [];

    // draw free attachment points
    this.monomer.unUsedAttachmentPointsNamesList.forEach((item) => {
      const properAngleForFreeAttachmentPoint =
        attachmentPointNumberToAngle[item];

      // if this angle is free for unused att point, draw it
      if (this.freeSectorsList.includes(properAngleForFreeAttachmentPoint)) {
        const [attachmentPointElement, _] = this.appendAttachmentPoint(
          item,
          properAngleForFreeAttachmentPoint,
        );
        this.attachmentPointElements.push(attachmentPointElement as never);

        // remove this sector from list
        const newList = this.freeSectorsList.filter((item) => {
          return item !== properAngleForFreeAttachmentPoint;
        });
        this.freeSectorsList = checkFor0and360(newList);
      } else {
        // if this sector is already taken - add name to unrendered list
        unrenderedAtPoints.push(item);
      }
    });

    unrenderedAtPoints.forEach((item) => {
      const customAngle = this.freeSectorsList.shift();
      const [attachmentPointElement, _] = this.appendAttachmentPoint(
        item,
        customAngle,
      );
      this.attachmentPointElements.push(attachmentPointElement as never);
    });
  }

  public appendAttachmentPoint(AttachmentPointName, customAngle?: number) {
    let rotation;

    if (!this.monomer.isAttachmentPointUsed(AttachmentPointName)) {
      rotation = attachmentPointNumberToAngle[AttachmentPointName];
    }

    const attPointInstance = new AttachmentPoint(
      this.rootElement as D3SvgElementSelection<SVGGElement, void>,
      this.monomer,
      this.bodyWidth,
      this.bodyHeight,
      this.canvasWrapper,
      AttachmentPointName,
      this.monomer.isAttachmentPointUsed(AttachmentPointName),
      this.monomer.isAttachmentPointPotentiallyUsed(AttachmentPointName),
      customAngle || rotation,
      this.isSnakeBondForAttachmentPoint(AttachmentPointName),
    );
    const attachmentPointElement = attPointInstance.getElement();
    const angle = attPointInstance.getAngle();

    return [attachmentPointElement, angle];
  }

  public removeAttachmentPoints() {
    this.attachmentPointElements.forEach((item) => {
      item.remove();
    });
    this.attachmentPointElements = [];
    this.freeSectorsList = sectorsList;
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
    const monomerSymbolBoundingClientRect =
      this.monomerSymbolBoundingClientRect;
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
    const monomerPositionInPixels = Coordinates.modelToCanvas(
      this.monomer.position,
    );

    return new Vec2(
      monomerPositionInPixels.x - monomerSymbolBoundingClientRect.width / 2,
      monomerPositionInPixels.y - monomerSymbolBoundingClientRect.height / 2,
    );
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
      .attr('cx', this.center.x)
      .attr('cy', this.center.y)
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
      .on('mousemove', (event) => {
        this.editorEvents.mouseOnMoveMonomer.dispatch(event);
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
    this.rootElement =
      this.rootElement ||
      this.appendRootElement(this.scale ? this.canvasWrapper : this.canvas);
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
    this.editorEvents.mouseLeaveMonomer.dispatch();
  }
}
