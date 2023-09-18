import { BaseRenderer } from './BaseRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import assert from 'assert';
import { D3SvgElementSelection } from 'application/render/types';
import { editorEvents } from 'application/editor/editorEvents';
import { Vec2 } from 'dist';

const LENGTH_LINE_FROM_MONOMER = 16.5;
const CORNER_LENGTH = 8;
const DOUBLE_CORNER_LENGTH = CORNER_LENGTH * 2;
enum LINE_DIRECTION {
  Horizontal = 'horizontal',
  Vertical = 'Vertical',
}

export class PolymerBondRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionElement;
  private path = '';
  private isSnake = true;

  constructor(public polymerBond: PolymerBond) {
    super(polymerBond as DrawingEntity);
    this.polymerBond.setRenderer(this);
    this.editorEvents = editorEvents;
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

  public moveSelection() {
    assert(this.rootElement);
    this.moveStart();
    this.moveEnd();
  }

  public appendBond(rootElement) {
    if (this.isSnake) {
      this.appendSnakeBond(rootElement);
    } else {
      this.appendBondGraph(rootElement);
    }
    return this.bodyElement;
  }

  public appendSnakeBond(rootElement) {
    const startPosition = this.polymerBond.startPosition;
    const endPosition = this.polymerBond.endPosition;
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
    return this.polymerBond.firstMonomer.renderer?.bodyWidth ?? 0;
  }
  private getMonomerHeight() {
    return this.polymerBond.firstMonomer.renderer?.bodyHeight ?? 0;
  }

  private updateSnakeBondPath(startPosition, endPosition) {
    if (this.isSecondMonomerBottomRight(startPosition, endPosition)) {
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth() / 2,
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
          LENGTH_LINE_FROM_MONOMER -
          this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerTopRight(startPosition, endPosition)) {
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth() / 2,
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
          LENGTH_LINE_FROM_MONOMER -
          this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerBottomLeft(startPosition, endPosition)) {
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth() / 2,
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
          LENGTH_LINE_FROM_MONOMER * 2 +
          this.getMonomerWidth()
        ),
      );
      this.addLineFromRightToLeft();
      this.addLine(
        LINE_DIRECTION.Vertical,
        endPosition.y -
          startPosition.y -
          CORNER_LENGTH * 4 -
          this.getMonomerHeight(),
      );
      this.addLineFromTopToRight();
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerTopLeft(startPosition, endPosition)) {
      this.addLine(
        LINE_DIRECTION.Horizontal,
        LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth() / 2,
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
          LENGTH_LINE_FROM_MONOMER * 2 +
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
        LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth() / 2,
      );
    } else {
      this.addRandomLine(startPosition, endPosition);
    }
  }

  private isSecondMonomerTopRight(startPosition, endPosition): boolean {
    return (
      startPosition.y - endPosition.y > this.getMonomerHeight() &&
      endPosition.x - startPosition.x >
        DOUBLE_CORNER_LENGTH + LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth()
    );
  }

  private isSecondMonomerBottomRight(startPosition, endPosition): boolean {
    return (
      endPosition.y - startPosition.y > this.getMonomerHeight() &&
      endPosition.x - startPosition.x >
        DOUBLE_CORNER_LENGTH + LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth()
    );
  }

  private isSecondMonomerBottomLeft(startPosition, endPosition): boolean {
    return (
      endPosition.y - startPosition.y > this.getMonomerHeight() &&
      endPosition.x - startPosition.x <=
        DOUBLE_CORNER_LENGTH + LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth()
    );
  }

  private isSecondMonomerTopLeft(startPosition, endPosition): boolean {
    return (
      startPosition.y - endPosition.y > -2 * this.getMonomerHeight() &&
      endPosition.x - startPosition.x <=
        DOUBLE_CORNER_LENGTH + LENGTH_LINE_FROM_MONOMER + this.getMonomerWidth()
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

  private addLineFromRightToLeft() {
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
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y)
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y)
      .attr('pointer-events', 'stroke');

    return this.bodyElement;
  }

  private appendRootElement() {
    return this.canvas
      .insert('g', '#polymer-editor-canvas defs')
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
    this.appendHoverAreaElement();
    this.appendBond(this.rootElement);
    this.drawSelection();
  }

  public drawSelection() {
    if (this.polymerBond.selected) {
      this.selectionElement?.remove();
      this.selectionElement = this.rootElement
        ?.insert('line', ':first-child')
        .attr('stroke', '#57FF8F')
        .attr('x1', this.polymerBond.startPosition.x)
        .attr('y1', this.polymerBond.startPosition.y)
        .attr('x2', this.polymerBond.endPosition.x)
        .attr('y2', this.polymerBond.endPosition.y)
        .attr('stroke-width', '10');
    } else {
      this.selectionElement?.remove();
    }
  }

  public moveEnd() {
    if (this.isSnake) {
      this.moveSnakeBondEnd();
    } else {
      this.moveGraphBondEnd();
    }
  }

  private moveSnakeBondEnd() {
    const startPosition = this.polymerBond.startPosition;
    const endPosition = this.polymerBond.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('d', this.path);

    // fix
    // this.hoverAreaElement.attr('d', this.path);
    // this.selectionElement?.attr('d', this.path);
  }
  private moveGraphBondEnd() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y);

    this.hoverAreaElement
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y);

    this.selectionElement
      ?.attr('x2', this.polymerBond.endPosition.x)
      ?.attr('y2', this.polymerBond.endPosition.y);
  }

  public moveStart() {
    if (this.isSnake) {
      this.moveSnakeBondStart();
    } else {
      this.moveGraphBondStart();
    }
  }

  private moveSnakeBondStart() {
    const startPosition = this.polymerBond.startPosition;
    const endPosition = this.polymerBond.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('d', this.path);

    // fix
    // this.hoverAreaElement.attr('d', this.path);
    // this.selectionElement.attr('d', this.path);
  }

  private moveGraphBondStart() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y);

    this.hoverAreaElement
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y);

    this.selectionElement
      ?.attr('x1', this.polymerBond.startPosition.x)
      ?.attr('y1', this.polymerBond.startPosition.y);
  }

  protected appendHoverAreaElement() {
    (<D3SvgElementSelection<SVGLineElement, void> | undefined>(
      this.hoverAreaElement
    )) = this.rootElement
      ?.append('line')
      .attr('stroke', 'transparent')
      .attr('x1', this.polymerBond.startPosition.x)
      .attr('y1', this.polymerBond.startPosition.y)
      .attr('x2', this.polymerBond.endPosition.x)
      .attr('y2', this.polymerBond.endPosition.y)
      .attr('stroke-width', '10');
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
