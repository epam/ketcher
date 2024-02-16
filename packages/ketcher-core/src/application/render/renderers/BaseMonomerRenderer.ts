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
import { Vec2 } from 'domain/entities';
import {
  AttachmentPointConstructorParams,
  AttachmentPointName,
} from 'domain/types';
import { Coordinates } from 'application/editor/shared/coordinates';

export abstract class BaseMonomerRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionCircle?: D3SvgElementSelection<SVGCircleElement, void>;
  private selectionBorder?: D3SvgElementSelection<SVGUseElement, void>;

  private freeSectorsList: number[] = sectorsList;

  private attachmentPoints: AttachmentPoint[] | [] = [];
  private hoveredAttachmenPoint: AttachmentPointName | null = null;

  private monomerSymbolElement?: SVGUseElement | SVGRectElement;
  public monomerSize: { width: number; height: number };

  private enumerationElement?: D3SvgElementSelection<SVGTextElement, void>;
  public enumeration: number | null = null;

  private beginningElement?: D3SvgElementSelection<SVGTextElement, void>;
  public beginning: string | null = null;

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
    // Cross-browser width and height detection via getAttribute()
    // as getBoundingClientRect() and getBBox() return 0 values in Firefox
    // in this case (<path> inside <symbol>, <defs>)
    this.monomerSize = {
      width: +(
        this.monomerSymbolElement?.getAttribute('data-actual-width') || 0
      ),
      height: +(
        this.monomerSymbolElement?.getAttribute('data-actual-height') || 0
      ),
    };
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
      this.scaledMonomerPosition.x + this.monomerSize.width / 2,
      this.scaledMonomerPosition.y + this.monomerSize.height / 2,
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

  protected getMonomerColor(theme) {
    return (
      theme.monomer.color[
        this.monomer.monomerItem.props.MonomerNaturalAnalogCode
      ]?.regular || theme.monomer.color.default.regular
    );
  }

  public redrawAttachmentPoints() {
    this.hoveredAttachmenPoint = null;
    if (!this.rootElement) return;
    if (this.monomer.attachmentPointsVisible) {
      this.removeAttachmentPoints();
      this.drawAttachmentPoints();
    } else {
      this.removeAttachmentPoints();
    }
  }

  public updateAttachmentPoints() {
    this.hoveredAttachmenPoint = null;
    if (!this.rootElement) return;
    if (this.attachmentPoints.length > 0) {
      this.attachmentPoints.forEach((point) => {
        point.updateAttachmentPointStyleForHover();
      });
    } else {
      this.drawAttachmentPoints();
    }
  }

  public redrawAttachmentPointsCoordinates() {
    const chosenAttachmentPointName =
      this.monomer.chosenFirstAttachmentPointForBond;
    const chosenAttachmentPoint = this.attachmentPoints.find(
      (item) => item.getAttachmentPointName() === chosenAttachmentPointName,
    );
    const angle = chosenAttachmentPoint?.getAngle();
    const allAngles = this.attachmentPoints.map((item) => {
      return item.getAngle();
    });
    const isSectorOccupied = allAngles.some((item) => {
      if (angle !== item && typeof angle === 'number') {
        return Math.abs(angle - item) < 20 || Math.abs(angle - item) > 340;
      }
      return false;
    });

    if (isSectorOccupied) {
      this.redrawAttachmentPoints();
      return;
    }

    const attachmentPoint = this.attachmentPoints.find(
      (item) => item.getAttachmentPointName() === chosenAttachmentPointName,
    );

    assert(attachmentPoint);
    attachmentPoint.updateCoords();
  }

  public drawAttachmentPoints() {
    if (this.attachmentPoints.length) {
      return;
    }

    // draw used attachment points
    this.monomer.usedAttachmentPointsNamesList.forEach((item) => {
      const attachmentPoint = this.appendAttachmentPoint(item);
      const angle = attachmentPoint.getAngle();

      this.attachmentPoints.push(attachmentPoint as never);

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

    const unrenderedAtPoints: AttachmentPointName[] = [];

    // draw free attachment points
    this.monomer.unUsedAttachmentPointsNamesList.forEach((item) => {
      const properAngleForFreeAttachmentPoint =
        attachmentPointNumberToAngle[item];

      // if this angle is free for unused att point, draw it
      if (this.freeSectorsList.includes(properAngleForFreeAttachmentPoint)) {
        const attachmentPoint = this.appendAttachmentPoint(
          item,
          properAngleForFreeAttachmentPoint,
        );
        this.attachmentPoints.push(attachmentPoint as never);

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
      const attachmentPoint = this.appendAttachmentPoint(item, customAngle);
      this.attachmentPoints.push(attachmentPoint as never);
    });
  }

  public appendAttachmentPoint(
    attachmentPointName: AttachmentPointName,
    customAngle?: number,
  ) {
    let rotation;

    if (!this.monomer.isAttachmentPointUsed(attachmentPointName)) {
      rotation = attachmentPointNumberToAngle[attachmentPointName];
    }
    const attachmentPointParams: AttachmentPointConstructorParams = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rootElement: this.rootElement!,
      monomer: this.monomer,
      bodyWidth: this.monomerSize.width,
      bodyHeight: this.monomerSize.height,
      canvas: this.canvasWrapper,
      attachmentPointName,
      isUsed: this.monomer.isAttachmentPointUsed(attachmentPointName),
      isPotentiallyUsed:
        this.monomer.isAttachmentPointPotentiallyUsed(attachmentPointName) ||
        this.hoveredAttachmenPoint === attachmentPointName,
      angle: customAngle || rotation,
      isSnake: !!this.isSnakeBondForAttachmentPoint(attachmentPointName),
    };

    const attPointInstance = new AttachmentPoint(attachmentPointParams);
    return attPointInstance;
  }

  public removeAttachmentPoints() {
    this.attachmentPoints.forEach((item) => {
      item.removeAttachmentPoint();
    });
    this.attachmentPoints = [];
    this.freeSectorsList = sectorsList;
  }

  public hoverAttachmenPoint(attachmentPointName: AttachmentPointName) {
    this.hoveredAttachmenPoint = attachmentPointName;
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

  public get scaledMonomerPosition() {
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
    const monomerPositionInPixels = Coordinates.modelToCanvas(
      this.monomer.position,
    );

    return new Vec2(
      monomerPositionInPixels.x - this.monomerSize.width / 2,
      monomerPositionInPixels.y - this.monomerSize.height / 2,
    );
  }

  public appendSelection() {
    if (this.selectionCircle) {
      this.selectionCircle.attr('cx', this.center.x).attr('cy', this.center.y);
    } else {
      this.selectionBorder = this.rootElement
        ?.append('use')
        .attr('href', this.monomerSelectedElementId)
        .attr('stroke', '#57FF8F')
        .attr('pointer-events', 'none');

      this.selectionCircle = this.canvas
        ?.insert('circle', ':first-child')
        .attr('r', '42px')
        .attr('opacity', '0.7')
        .attr('cx', this.center.x)
        .attr('cy', this.center.y)
        .attr('fill', '#57FF8F');
    }
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

  protected abstract get enumerationElementPosition(): {
    x: number;
    y: number;
  } | void;

  protected abstract get beginningElementPosition(): {
    x: number;
    y: number;
  } | void;

  public setEnumeration(enumeration: number | null) {
    this.enumeration = enumeration;
  }

  protected appendEnumeration() {
    assert(this.rootElement);
    assert(this.enumerationElementPosition);
    this.enumerationElement = this.rootElement
      .append('text')
      .attr('direction', 'rtl')
      .attr('fill', '#7C7C7F')
      .attr('font-size', '12px')
      .attr('line-height', '14px')
      .attr('font-weight', '500')
      .attr('text-align', 'right')
      .attr('x', this.enumerationElementPosition.x)
      .attr('y', this.enumerationElementPosition.y)
      .text(this.enumeration);
  }

  public redrawEnumeration() {
    assert(this.enumerationElement);
    this.enumerationElement.text(this.enumeration);
  }

  public setBeginning(beginning: string | null) {
    this.beginning = beginning;
  }

  protected appendChainBeginning() {
    assert(this.rootElement);
    assert(this.beginningElementPosition);
    this.beginningElement = this.rootElement
      .append('text')
      .attr('direction', 'rtl')
      .attr('fill', '#0097A8')
      .attr('font-size', '12px')
      .attr('line-height', '14px')
      .attr('font-weight', '700')
      .attr('text-align', 'right')
      .attr('x', this.beginningElementPosition.x)
      .attr('y', this.beginningElementPosition.y)
      .text(this.beginning);
  }

  public reDrawChainBeginning() {
    assert(this.beginningElement);
    assert(this.beginningElementPosition);
    this.beginningElement
      .attr('x', this.beginningElementPosition.x)
      .attr('y', this.beginningElementPosition.y)
      .text(this.beginning);
  }

  public show(theme) {
    this.rootElement =
      this.rootElement ||
      this.appendRootElement(this.scale ? this.canvasWrapper : this.canvas);
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
    if (!this.rootElement) {
      return;
    }
    if (this.monomer.selected) {
      this.appendSelection();
      this.raiseElement();
    } else {
      this.removeSelection();
    }
  }

  private raiseElement() {
    this.selectionCircle?.raise();
    this.rootElement?.raise();
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
