import { BaseRenderer } from './BaseRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import assert from 'assert';
import { D3SvgElementSelection } from 'application/render/types';
import { editorEvents } from 'application/editor/editorEvents';
import { Vec2 } from 'domain/entities';
import { Peptide } from 'domain/entities/Peptide';
import { Chem } from 'domain/entities/Chem';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { SnakeMode } from 'application/editor/modes/internal';
import { Coordinates } from 'application/editor/shared/coordinates';

const LINE_FROM_MONOMER_LENGTH = 15;
const VERTICAL_LINE_LENGTH = 42;
const CORNER_LENGTH = 8;
const DOUBLE_CORNER_LENGTH = CORNER_LENGTH * 2;
enum LINE_DIRECTION {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

export class PolymerBondRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionElement;
  private path = '';
  private previousStateOfIsMonomersOnSameHorisontalLine = false;
  constructor(public polymerBond: PolymerBond) {
    super(polymerBond as DrawingEntity);
    this.polymerBond.setRenderer(this);
    this.editorEvents = editorEvents;
  }

  get attachmentPointsForSnakeBond() {
    return ['R1', 'R2'];
  }

  private isSnakeBondAvailableForMonomer(monomer?: BaseMonomer) {
    return monomer instanceof Peptide || monomer instanceof Chem;
  }

  get isSnake() {
    if (
      !this.isSnakeBondAvailableForMonomer(this.polymerBond.firstMonomer) ||
      (this.polymerBond.secondMonomer &&
        !this.isSnakeBondAvailableForMonomer(this.polymerBond.secondMonomer))
    ) {
      return false;
    }
    const firstMonomerAttachmentPoint =
      this.polymerBond.firstMonomer.getAttachmentPointByBond(this.polymerBond);
    const secondMonomerAttachmentPoint =
      this.polymerBond.secondMonomer?.getAttachmentPointByBond(
        this.polymerBond,
      );
    const firstMonomerPotentialAttachmentPoint =
      this.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(
        this.polymerBond,
      );
    return (
      SnakeMode.isEnabled &&
      ((this.attachmentPointsForSnakeBond.includes(
        firstMonomerAttachmentPoint as string,
      ) &&
        this.attachmentPointsForSnakeBond.includes(
          secondMonomerAttachmentPoint as string,
        )) ||
        this.attachmentPointsForSnakeBond.includes(
          firstMonomerPotentialAttachmentPoint as string,
        ))
    );
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

  private get scaledPosition() {
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
    const startPositionInPixels = Coordinates.modelToCanvas(
      this.polymerBond.startPosition,
    );

    const endPositionInPixels = Coordinates.modelToCanvas(
      this.polymerBond.endPosition,
    );

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  public moveSelection() {
    if (
      this.previousStateOfIsMonomersOnSameHorisontalLine !==
      this.isMonomersOnSameHorizontalLine()
    ) {
      this.remove();
      this.show();
    } else {
      assert(this.rootElement);
      this.moveStart();
      this.moveEnd();
    }
    this.previousStateOfIsMonomersOnSameHorisontalLine =
      this.isMonomersOnSameHorizontalLine();
  }

  public appendBond(rootElement) {
    if (this.isSnake && !this.isMonomersOnSameHorizontalLine()) {
      this.appendSnakeBond(rootElement);
    } else {
      this.appendBondGraph(rootElement);
    }
    return this.bodyElement;
  }

  public appendSnakeBond(rootElement) {
    const startPosition = this.scaledPosition.startPosition;
    const endPosition = this.scaledPosition.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    this.bodyElement = rootElement
      .append('path')
      .attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8')
      .attr('stroke-width', 2)
      .attr('class', 'selection-area')
      .attr('d', this.path)
      .attr('fill-opacity', 0)
      .attr('pointer-events', 'stroke');
    return this.bodyElement;
  }

  private getMonomerWidth() {
    return this.polymerBond.firstMonomer.renderer?.monomerSize.width ?? 0;
  }

  private getMonomerHeight() {
    return this.polymerBond.firstMonomer.renderer?.monomerSize.width ?? 0;
  }

  public isMonomersOnSameHorizontalLine() {
    return Boolean(
      this.polymerBond.secondMonomer &&
        this.polymerBond.firstMonomer.position.y -
          this.polymerBond.secondMonomer.position.y <
          0.5 &&
        this.polymerBond.firstMonomer.position.y -
          this.polymerBond.secondMonomer.position.y >
          -0.5,
    );
  }

  private updateSnakeBondPath(
    startPosition: Vec2,
    endPosition: Vec2,
    reCheckAttachmentpoint = true,
  ) {
    const isR1TheCurrentAttachmentpointOfFirstMonomer =
      this.polymerBond.firstMonomer.getAttachmentPointByBond(
        this.polymerBond,
      ) === 'R1' ||
      this.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(
        this.polymerBond,
      ) === 'R1';
    if (this.isSecondMonomerBottomRight(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentpointOfFirstMonomer &&
        reCheckAttachmentpoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.addLineFromLeftToBottom();
      this.addLine(
        LINE_DIRECTION.Vertical,
        endPosition.y - startPosition.y - CORNER_LENGTH * 2,
      );
      this.addLineFromTopToRight();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        endPosition.x -
          startPosition.x -
          CORNER_LENGTH * 2 -
          LINE_FROM_MONOMER_LENGTH -
          this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerTopRight(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentpointOfFirstMonomer &&
        reCheckAttachmentpoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.addLineFromLeftToTop();
      this.addLine(
        LINE_DIRECTION.Vertical,
        endPosition.y -
          startPosition.y -
          CORNER_LENGTH * 2 +
          this.getMonomerHeight() / 2,
      );
      this.addLineFromBottomToRight();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        endPosition.x -
          startPosition.x -
          CORNER_LENGTH * 2 -
          LINE_FROM_MONOMER_LENGTH -
          this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerBottomLeft(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentpointOfFirstMonomer &&
        reCheckAttachmentpoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.addLineFromLeftToBottom();
      this.addLine(LINE_DIRECTION.Vertical, VERTICAL_LINE_LENGTH);
      this.addLineFromTopToLeft();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        -(
          startPosition.x -
          endPosition.x +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );
      this.addLineFromRightToBottom();
      this.addLine(
        LINE_DIRECTION.Vertical,
        endPosition.y -
          startPosition.y -
          CORNER_LENGTH * 4 -
          VERTICAL_LINE_LENGTH,
      );
      this.addLineFromTopToRight();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerTopLeft(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentpointOfFirstMonomer &&
        reCheckAttachmentpoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.addLineFromLeftToBottom();
      this.addLine(LINE_DIRECTION.Vertical, this.getMonomerHeight());
      this.addLineFromTopToLeft();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        -(
          startPosition.x -
          endPosition.x +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );

      this.addLineFromRightToUp();
      this.addLine(
        LINE_DIRECTION.Vertical,
        endPosition.y - startPosition.y - this.getMonomerHeight(),
      );
      this.addLineFromBottomToRight();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerLeft(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentpointOfFirstMonomer &&
        reCheckAttachmentpoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.addLineFromLeftToBottom();
      this.addLine(
        LINE_DIRECTION.Vertical,
        endPosition.y - startPosition.y + this.getMonomerHeight(),
      );
      this.addLineFromTopToLeft();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        -(
          startPosition.x -
          endPosition.x +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );

      this.addLineFromRightToUp();
      this.addLine(LINE_DIRECTION.Vertical, -this.getMonomerHeight());
      this.addLineFromBottomToRight();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
      );
    } else {
      this.addRandomLine(startPosition, endPosition);
    }
  }

  private isSecondMonomerTopRight(startPosition, endPosition): boolean {
    return (
      startPosition.y - endPosition.y > DOUBLE_CORNER_LENGTH &&
      endPosition.x - startPosition.x >
        DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth()
    );
  }

  private isSecondMonomerBottomRight(startPosition, endPosition): boolean {
    return (
      endPosition.y - startPosition.y > DOUBLE_CORNER_LENGTH &&
      endPosition.x - startPosition.x >
        DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth()
    );
  }

  private isSecondMonomerBottomLeft(startPosition, endPosition): boolean {
    return (
      endPosition.y - startPosition.y >=
        2 * (VERTICAL_LINE_LENGTH + DOUBLE_CORNER_LENGTH) &&
      endPosition.x - startPosition.x <=
        DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth()
    );
  }

  private isSecondMonomerTopLeft(startPosition, endPosition): boolean {
    return (
      startPosition.y - endPosition.y > 0 &&
      endPosition.x - startPosition.x <=
        DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth()
    );
  }

  private isSecondMonomerLeft(startPosition, endPosition): boolean {
    return (
      startPosition.y - endPosition.y < 0 &&
      startPosition.y - endPosition.y >
        -2 * (VERTICAL_LINE_LENGTH + DOUBLE_CORNER_LENGTH) &&
      endPosition.x - startPosition.x <=
        DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth()
    );
  }

  private addLineFromTopToRight() {
    this.path = `${this.path} c 0,4.418 3.582,8 8,8`;
  }

  private addLineFromLeftToTop() {
    this.path = `${this.path} c 4.418,0 8,-3.582 8,-8`;
  }

  private addLineFromBottomToRight() {
    this.path = `${this.path} c 0,-4.418 3.582,-8 8,-8`;
  }

  private addLineFromLeftToBottom() {
    this.path = `${this.path} c 4.418,0 8,3.582 8,8`;
  }

  private addLineFromTopToLeft() {
    this.path = `${this.path} c 0,4.418 -3.582,8 -8,8`;
  }

  private addLineFromRightToUp() {
    this.path = `${this.path} c -4.418,0 -8,-3.582 -8,-8`;
  }

  private addLineFromRightToBottom() {
    this.path = `${this.path} c -4.418,0 -8,3.582 -8,8`;
  }

  private addLine(
    isHorisontal: LINE_DIRECTION,
    length: number,
    startPosition?: Vec2,
  ) {
    const start = startPosition
      ? `M ${Math.round(startPosition.x)},${Math.round(startPosition.y)}`
      : this.path;
    const line =
      isHorisontal === LINE_DIRECTION.Horizontal
        ? `l${length}, 0`
        : `l 0, ${length}`;
    this.path = `${start} ${line}`;
  }

  private addRandomLine(startPosition: Vec2, endPosition: Vec2) {
    const start = `M ${Math.round(startPosition.x)},${Math.round(
      startPosition.y,
    )}`;
    const line = `L ${Math.round(endPosition.x)},${Math.round(endPosition.y)}`;
    this.path = `${start} ${line}`;
  }

  public appendBondGraph(rootElement) {
    this.bodyElement = rootElement
      .append('line')
      .attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8')
      .attr('stroke-width', 2)
      .attr('class', 'selection-area')
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y)
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y)
      .attr('pointer-events', 'stroke');

    return this.bodyElement;
  }

  private appendRootElement() {
    return this.canvas
      .insert('g', `:first-child`)
      .data([this])
      .on('mouseover', (event) => {
        this.editorEvents.mouseOverPolymerBond.dispatch(event);
        this.editorEvents.mouseOverDrawingEntity.dispatch(event);
      })
      .on('mouseout', (event) => {
        this.editorEvents.mouseLeavePolymerBond.dispatch(event);
        this.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
      })
      .attr('pointer-events', 'stroke') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }

  public show() {
    this.rootElement = this.rootElement || this.appendRootElement();
    this.appendBond(this.rootElement);
    this.appendHoverAreaElement();
    this.drawSelection();
  }

  public drawSelection() {
    if (this.polymerBond.selected) {
      this.selectionElement?.remove();
      if (this.isSnake && !this.isMonomersOnSameHorizontalLine()) {
        this.selectionElement = this.rootElement
          ?.insert('path', ':first-child')
          .attr('stroke', '#57FF8F')
          .attr('stroke-width', 10)
          .attr('fill-opacity', 0)
          .attr('d', this.path);
      } else {
        this.selectionElement = this.rootElement
          ?.insert('line', ':first-child')
          .attr('stroke', '#57FF8F')
          .attr('x1', this.scaledPosition.startPosition.x)
          .attr('y1', this.scaledPosition.startPosition.y)
          .attr('x2', this.scaledPosition.endPosition.x)
          .attr('y2', this.scaledPosition.endPosition.y)
          .attr('stroke-width', '10');
      }
    } else {
      this.selectionElement?.remove();
    }
  }

  public moveEnd() {
    if (this.isSnake && !this.isMonomersOnSameHorizontalLine()) {
      this.moveSnakeBondEnd();
    } else {
      this.moveGraphBondEnd();
    }
  }

  private moveSnakeBondEnd() {
    const startPosition = this.scaledPosition.startPosition;
    const endPosition = this.scaledPosition.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('d', this.path);

    this.hoverAreaElement.attr('d', this.path);
    this.selectionElement?.attr('d', this.path);
  }

  private moveGraphBondEnd() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y);

    this.hoverAreaElement
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y);

    this.selectionElement
      ?.attr('x2', this.scaledPosition.endPosition.x)
      ?.attr('y2', this.scaledPosition.endPosition.y);
  }

  public moveStart() {
    if (this.isSnake && !this.isMonomersOnSameHorizontalLine()) {
      this.moveSnakeBondStart();
    } else {
      this.moveGraphBondStart();
    }
  }

  private moveSnakeBondStart() {
    const startPosition = this.scaledPosition.startPosition;
    const endPosition = this.scaledPosition.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('d', this.path);

    this.hoverAreaElement.attr('d', this.path);
    this.selectionElement?.attr('d', this.path);
  }

  private moveGraphBondStart() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y);

    this.hoverAreaElement
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y);

    this.selectionElement
      ?.attr('x1', this.scaledPosition.startPosition.x)
      ?.attr('y1', this.scaledPosition.startPosition.y);
  }

  protected appendHoverAreaElement() {
    if (this.isSnake && !this.isMonomersOnSameHorizontalLine()) {
      (<D3SvgElementSelection<SVGPathElement, void> | undefined>(
        this.hoverAreaElement
      )) = this.rootElement
        ?.append('path')
        .attr('stroke', 'transparent')
        .attr('d', this.path)
        .attr('fill-opacity', 0)
        .attr('stroke-width', '10');
    } else {
      (<D3SvgElementSelection<SVGLineElement, void> | undefined>(
        this.hoverAreaElement
      )) = this.rootElement
        ?.append('line')
        .attr('stroke', 'transparent')
        .attr('x1', this.scaledPosition.startPosition.x)
        .attr('y1', this.scaledPosition.startPosition.y)
        .attr('x2', this.scaledPosition.endPosition.x)
        .attr('y2', this.scaledPosition.endPosition.y)
        .attr('stroke-width', '10');
    }
  }

  public appendHover() {
    assert(this.bodyElement);
    this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');

    if (this.polymerBond.selected) {
      assert(this.hoverAreaElement);
      this.hoverAreaElement.attr('stroke', '#CCFFDD');
    }
  }

  public removeHover() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('stroke', '#333333').attr('pointer-events', 'stroke');

    return this.hoverAreaElement.attr('stroke', 'transparent');
  }
}
