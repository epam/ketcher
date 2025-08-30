import { editorEvents } from 'application/editor/editorEvents';
import { CoreEditor, SelectBase } from 'application/editor/internal';
import { Coordinates } from 'application/editor/shared/coordinates';
import { D3SvgElementSelection } from 'application/render/types';
import assert from 'assert';
import { AttachmentPoint } from 'domain/AttachmentPoint';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import {
  anglesToSector,
  attachmentPointNumberToAngle,
  checkFor0and360,
  sectorsList,
} from 'domain/helpers/attachmentPointCalculations';
import {
  AttachmentPointConstructorParams,
  AttachmentPointName,
} from 'domain/types';
import { BaseRenderer } from './BaseRenderer';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';

const labelPositions: { [key: string]: { x: number; y: number } | undefined } =
  {};
export const MONOMER_CSS_CLASS = 'monomer';
let monomerSize: { width: number; height: number } = { width: 0, height: 0 };

export abstract class BaseMonomerRenderer extends BaseRenderer {
  private readonly editorEvents: typeof editorEvents;
  private readonly editor: CoreEditor;
  private selectionCircle?: D3SvgElementSelection<SVGCircleElement, void>;
  private selectionBorder?: D3SvgElementSelection<SVGUseElement, void>;
  public declare bodyElement?: D3SvgElementSelection<SVGUseElement, this>;
  private freeSectorsList: number[] = sectorsList;

  private attachmentPoints: AttachmentPoint[] | [] = [];
  private hoveredAttachmentPoint: AttachmentPointName | null = null;

  private readonly monomerSymbolElement?: SVGUseElement | SVGRectElement;
  public readonly monomerSize: { width: number; height: number };

  private enumerationElement?: D3SvgElementSelection<SVGTextElement, void>;
  public enumeration: number | null = null;

  private terminalIndicatorElement?: D3SvgElementSelection<
    SVGTextElement,
    void
  >;

  public CHAIN_START_TERMINAL_INDICATOR_TEXT = '';
  public CHAIN_END_TERMINAL_INDICATOR_TEXT = '';

  static isSelectable() {
    return true;
  }

  static get selectionCircleRadius() {
    return 21;
  }

  protected constructor(
    public monomer: BaseMonomer,
    private readonly monomerHoveredElementId: string,
    public monomerSymbolElementId: string,
    public monomerAutochainPreviewElementId: string,
    private readonly scale?: number,
  ) {
    super(monomer as DrawingEntity);
    this.monomer.setRenderer(this);
    this.editorEvents = editorEvents;
    this.editor = CoreEditor?.provideEditorInstance();
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
    monomerSize = this.monomerSize;
  }

  // FIXME: `BaseMonomerRenderer` should not know about `isSnake`.
  private isSnakeBondForAttachmentPoint(
    attachmentPointName: AttachmentPointName,
  ): boolean {
    const renderer =
      this.monomer.attachmentPointsToBonds[attachmentPointName]?.renderer;
    if (!renderer) return false;
    if ('isSnake' in renderer) {
      return renderer.isSnake && !renderer.polymerBond.isHorizontal;
    }
    return false;
  }

  public static get monomerSize() {
    return monomerSize;
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
      ]?.regular || theme.monomer.color.X.regular
    );
  }

  protected getPeptideColor(theme) {
    const naturalAnalogCode =
      this.monomer.monomerItem.props.MonomerNaturalAnalogCode;
    const peptideColor = theme.peptide.color[naturalAnalogCode]?.regular;
    return peptideColor || this.getMonomerColor(theme);
  }

  public redrawAttachmentPoints(): void {
    this.hoveredAttachmentPoint = null;
    if (!this.rootElement) return;
    if (this.monomer.attachmentPointsVisible) {
      this.removeAttachmentPoints();
      this.drawAttachmentPoints();
    } else {
      this.removeAttachmentPoints();
    }
  }

  public updateAttachmentPoints(): void {
    this.hoveredAttachmentPoint = null;
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

  public drawAttachmentPoints(
    appendFn?: (
      apName: AttachmentPointName,
      customAngle?: number,
    ) => AttachmentPoint,
  ) {
    if (this.attachmentPoints.length) {
      return;
    }

    const appendFnToUse = appendFn || this.appendAttachmentPoint.bind(this);

    // draw used attachment points
    this.monomer.usedAttachmentPointsNamesList.forEach((item) => {
      const attachmentPoint = appendFnToUse(item);
      const angle: number = attachmentPoint.getAngle();

      this.attachmentPoints.push(attachmentPoint as never);

      // remove this sector from list of free sectors
      const newList = this.freeSectorsList.filter((item) => {
        return (
          anglesToSector[item].min > angle || anglesToSector[item].max <= angle
        );
      });
      this.freeSectorsList = checkFor0and360(newList);
    });

    const unrenderedAtPoints: AttachmentPointName[] = [];

    // draw free attachment points
    this.monomer.unUsedAttachmentPointsNamesList.forEach((item) => {
      const properAngleForFreeAttachmentPoint =
        attachmentPointNumberToAngle[item];

      // if this angle is free for unused att point, draw it
      if (this.freeSectorsList.includes(properAngleForFreeAttachmentPoint)) {
        const attachmentPoint = appendFnToUse(
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
      const attachmentPoint = appendFnToUse(item, customAngle);
      this.attachmentPoints.push(attachmentPoint as never);
    });
  }

  protected prepareAttachmentPointsParams(
    attachmentPointName: AttachmentPointName,
    customAngle?: number,
  ): AttachmentPointConstructorParams {
    let rotation;

    if (!this.monomer.isAttachmentPointUsed(attachmentPointName)) {
      rotation = attachmentPointNumberToAngle[attachmentPointName];
    }

    return {
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
        this.hoveredAttachmentPoint === attachmentPointName,
      angle: customAngle ?? rotation,
      applyZoomForPositionCalculation: true,
      // FIXME: `BaseMonomerRenderer` should not know about `isSnake`.
      isSnake: this.isSnakeBondForAttachmentPoint(attachmentPointName),
    };
  }

  public appendAttachmentPoint(
    attachmentPointName: AttachmentPointName,
    customAngle?: number,
  ) {
    const attachmentPointParams = this.prepareAttachmentPointsParams(
      attachmentPointName,
      customAngle,
    );

    return new AttachmentPoint(attachmentPointParams);
  }

  public removeAttachmentPoints() {
    this.attachmentPoints.forEach((item) => {
      item.removeAttachmentPoint();
    });
    this.attachmentPoints = [];
    this.freeSectorsList = sectorsList;
  }

  public hoverAttachmentPoint(attachmentPointName: AttachmentPointName): void {
    this.hoveredAttachmentPoint = attachmentPointName;
  }

  protected appendRootElement(
    canvas:
      | D3SvgElementSelection<SVGSVGElement, void>
      | D3SvgElementSelection<SVGGElement, void>,
  ) {
    const rootElement = canvas
      .append('g')
      .data([this])
      .attr('class', MONOMER_CSS_CLASS)
      .attr('transition', 'transform 0.2s')
      .attr('data-testid', 'monomer')
      .attr(
        'data-monomertype',
        this.monomer instanceof AmbiguousMonomer
          ? AmbiguousMonomer.getMonomerClass(this.monomer.monomers)
          : (this.monomer.monomerItem.props.isMicromoleculeFragment
              ? 'CHEM'
              : this.monomer.monomerItem.props.MonomerClass) || '',
      )
      .attr('data-monomeralias', this.monomer.label)
      .attr('data-monomerid', this.monomer.id)
      .attr(
        'data-number-of-attachment-points',
        this.monomer.listOfAttachmentPoints.length,
      )
      .attr(
        'data-hydrogen-connection-number',
        this.monomer.hydrogenBonds.length,
      )
      .attr(
        'transform',
        `translate(${this.scaledMonomerPosition.x}, ${
          this.scaledMonomerPosition.y
        }) scale(${this.scale || 1})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    this.monomer.listOfAttachmentPoints.forEach((attachmentPoint) => {
      rootElement.attr(
        `data-${attachmentPoint}`,
        !!this.monomer.attachmentPointsToBonds[attachmentPoint],
      );
    });
    return rootElement;
  }

  protected appendLabel(rootElement: D3SvgElementSelection<SVGGElement, void>) {
    const fontSize = 6;
    const textElement = rootElement
      .append('text')
      .text(this.monomer.label)
      .attr('fill', this.textColor)
      .attr('font-size', `${fontSize}px`)
      .attr('line-height', `${fontSize}px`)
      .attr('font-weight', '700')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .attr('pointer-events', 'none');

    // cache label position to reuse it form other monomers with same label
    // need to improve performance for large amount of monomers
    // getBBox triggers reflow
    const [, , monomerClass] = monomerFactory(
      this.monomer instanceof AmbiguousMonomer
        ? this.monomer.variantMonomerItem
        : this.monomer.monomerItem,
    );
    const monomerUniqueKey = this.monomer.label + monomerClass;

    if (!labelPositions[monomerUniqueKey]) {
      const textBBox = (textElement.node() as SVGTextElement).getBBox();
      labelPositions[monomerUniqueKey] = {
        x: this.width / 2 - textBBox.width / 2,
        y: this.height / 2,
      };
    }
    textElement
      .attr('x', labelPositions[monomerUniqueKey]?.x || 0)
      .attr('y', labelPositions[monomerUniqueKey]?.y || 0);

    if (this.scale && this.scale !== 1) {
      labelPositions[monomerUniqueKey] = undefined;
    }
  }

  public setLabelVisibility(isVisible: boolean) {
    this.rootElement?.select('text').style('opacity', isVisible ? 1 : 0);
  }

  public appendHover(
    hoverAreaElement: D3SvgElementSelection<SVGGElement, void>,
  ) {
    let cursor = 'default';

    if (this.hoverElement) this.hoverElement.remove();
    if (this.editor.selectedTool instanceof SelectBase) cursor = 'move';

    return hoverAreaElement
      .style('cursor', cursor)
      .append('use')
      .attr('href', this.monomerHoveredElementId)
      .attr('pointer-events', 'none')
      .attr('class', 'dynamic-element');
  }

  public removeHover() {
    if (!this.hoverElement) return;
    this.hoverElement.remove();
  }

  public static getScaledMonomerPosition(
    positionInAngstoms: Vec2,
    monomerSize: { width: number; height: number } = { width: 0, height: 0 },
  ) {
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
    const monomerPositionInPixels =
      Coordinates.modelToCanvas(positionInAngstoms);

    return new Vec2(
      monomerPositionInPixels.x - monomerSize.width / 2,
      monomerPositionInPixels.y - monomerSize.height / 2,
    );
  }

  public get scaledMonomerPosition() {
    return BaseMonomerRenderer.getScaledMonomerPosition(
      this.monomer.position,
      this.monomerSize,
    );
  }

  public appendSelection() {
    if (this.selectionCircle) {
      this.selectionCircle.attr('cx', this.center.x).attr('cy', this.center.y);
    } else {
      this.selectionCircle = this.canvas
        ?.insert('circle', ':first-child')
        .attr('r', `${BaseMonomerRenderer.selectionCircleRadius}px`)
        .attr('opacity', '0.7')
        .attr('cx', this.center.x)
        .attr('cy', this.center.y)
        .attr('fill', '#57FF8F')
        .attr('class', 'dynamic-element');
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
    theme?,
  );

  protected appendHoverAreaElement() {
    this.hoverAreaElement = this.rootElement;
  }

  private appendEvents() {
    if (!this.bodyElement) {
      return;
    }

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

  public abstract get enumerationElementPosition(): {
    x: number;
    y: number;
  } | void;

  public abstract get beginningElementPosition(): {
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
      .attr('font-size', '6px')
      .attr('line-height', '7px')
      .attr('font-weight', '500')
      .attr('text-align', 'right')
      .attr('style', 'user-select: none;')
      .attr('x', this.enumerationElementPosition.x)
      .attr('y', this.enumerationElementPosition.y)
      .text(this.enumeration);
  }

  public redrawEnumeration(needToDrawTerminalIndicator: boolean) {
    this.redrawChainTerminalIndicator(needToDrawTerminalIndicator);

    if (!this.enumerationElement) return;

    this.enumerationElement.text(this.enumeration);
  }

  public redrawChainTerminalIndicator(needToDraw: boolean) {
    if (
      !this.rootElement ||
      !this.CHAIN_START_TERMINAL_INDICATOR_TEXT ||
      !this.beginningElementPosition
    ) {
      return;
    }

    this.terminalIndicatorElement?.remove();

    if (!needToDraw) {
      return;
    }

    this.terminalIndicatorElement = this.rootElement
      .append('text')
      .attr('direction', 'rtl')
      .attr('fill', '#0097A8')
      .attr('font-size', '6px')
      .attr('line-height', '7px')
      .attr('font-weight', '700')
      .attr('text-align', 'right')
      .attr('style', 'user-select: none;')
      .attr('x', this.beginningElementPosition.x)
      .attr('y', this.beginningElementPosition.y)
      .text(
        this.monomer.monomerItem.isAntisense
          ? this.CHAIN_END_TERMINAL_INDICATOR_TEXT
          : this.CHAIN_START_TERMINAL_INDICATOR_TEXT,
      );
  }

  protected abstract get modificationConfig();

  protected drawModification() {
    const config = this.modificationConfig;
    const DARK_COLOR = '#333333';
    const LIGHT_COLOR = 'white';

    if (config && this.monomer.isModification) {
      let fillColor: string | undefined;

      if (config.requiresFill) {
        const isTextColorDark = this.textColor === DARK_COLOR;
        fillColor = isTextColorDark ? LIGHT_COLOR : DARK_COLOR;
      }

      const useElement = this.rootElement
        ?.append('use')
        .attr('xlink:href', config.backgroundId)
        .attr('pointer-events', 'none')
        .attr('class', 'modification-background');

      if (fillColor) {
        useElement?.attr('fill', fillColor);
      }
    }
  }

  public show(theme?) {
    this.rootElement =
      this.rootElement ||
      this.appendRootElement(this.scale ? this.canvasWrapper : this.canvas);
    this.bodyElement = this.appendBody(this.rootElement, theme);
    this.appendEvents();
    this.drawModification();

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
    if (this.monomer.hovered) {
      this.editorEvents.mouseLeaveMonomer.dispatch();
    }
  }
}
