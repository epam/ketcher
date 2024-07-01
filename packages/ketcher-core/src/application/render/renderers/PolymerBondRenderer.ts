import { BaseRenderer } from './BaseRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import assert from 'assert';
import { D3SvgElementSelection } from 'application/render/types';
import { editorEvents } from 'application/editor/editorEvents';
import { Phosphate, Sugar, Vec2 } from 'domain/entities';
import { Peptide } from 'domain/entities/Peptide';
import { Chem } from 'domain/entities/Chem';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { SnakeMode } from 'application/editor/modes/';
import { Coordinates } from 'application/editor/shared/coordinates';
import { CoreEditor } from 'application/editor/internal';
import { SNAKE_LAYOUT_CELL_WIDTH } from 'domain/entities/DrawingEntitiesManager';
import { Connection } from 'domain/entities/canvas-matrix/Connection';

const LINE_FROM_MONOMER_LENGTH = 15;
const VERTICAL_LINE_LENGTH = 21;
const RNA_CHAIN_VERTICAL_LINE_LENGTH = 74;
const CORNER_LENGTH = 4;
const DOUBLE_CORNER_LENGTH = CORNER_LENGTH * 2;

const BOND_END_LENGTH = 15;
const CELL_HEIGHT = 40;
const SMOOTH_CORNER_SIZE = 5;
const SIDE_CONNECTION_BODY_ELEMENT_CLASS = 'polymer-bond-body';
enum LINE_DIRECTION {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

export class PolymerBondRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private selectionElement;
  private path = '';
  private previousStateOfIsMonomersOnSameHorisontalLine = false;
  private sideConnectionBondTurnPoint?: number;
  constructor(public polymerBond: PolymerBond) {
    super(polymerBond as DrawingEntity);
    this.polymerBond.setRenderer(this);
    this.editorEvents = editorEvents;
  }

  private isSnakeBondAvailableForMonomer(monomer?: BaseMonomer) {
    return (
      monomer instanceof Peptide ||
      monomer instanceof Chem ||
      monomer instanceof Sugar ||
      monomer instanceof Phosphate
    );
  }

  get isSnake() {
    if (this.polymerBond.isSideChainConnection) {
      return false;
    }

    if (
      !this.isSnakeBondAvailableForMonomer(this.polymerBond.firstMonomer) ||
      (this.polymerBond.secondMonomer &&
        !this.isSnakeBondAvailableForMonomer(this.polymerBond.secondMonomer)) ||
      (this.polymerBond.secondMonomer &&
        this.polymerBond.firstMonomer.isMonomerTypeDifferentForChaining(
          this.polymerBond.secondMonomer,
        ))
    ) {
      return false;
    }

    const editor = CoreEditor.provideEditorInstance();
    return editor?.mode instanceof SnakeMode;
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
    const editor = CoreEditor.provideEditorInstance();

    if (
      editor?.mode instanceof SnakeMode &&
      this.polymerBond.isSideChainConnection
    ) {
      this.appendSideConnectionBond(rootElement);
    } else if (
      this.isSnake &&
      this.polymerBond.finished &&
      !this.isMonomersOnSameHorizontalLine()
    ) {
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
      .attr('stroke-width', 1)
      .attr('class', 'selection-area')
      .attr('d', this.path)
      .attr('fill-opacity', 0)
      .attr('pointer-events', 'stroke');
    return this.bodyElement;
  }

  private drawPartOfSideConnection(isHorizontal, connection, cell, direction) {
    const sin = Math.sin((direction * Math.PI) / 180);
    const cos = Math.cos((direction * Math.PI) / 180);
    const xOffset = (SNAKE_LAYOUT_CELL_WIDTH / 2) * cos;
    const yOffset = (CELL_HEIGHT / 2) * sin;
    const maxXOffset = cell.connections.reduce((max, connection) => {
      return max > connection.offset ? max : connection.offset;
    }, 0);
    const maxYOffset = cell.connections.reduce((max, connection) => {
      const connectionYOffset = connection.yOffset || 0;
      return max > connectionYOffset ? max : connectionYOffset;
    }, 0);

    let endOfPathPart = isHorizontal
      ? this.sideConnectionBondTurnPoint ||
        cell.node.monomer.renderer?.scaledMonomerPosition.x +
          cell.node.monomer.renderer?.monomerSize.width / 2 +
          xOffset
      : cell.node.monomer.renderer?.scaledMonomerPosition.y +
        cell.node.monomer.renderer?.monomerSize.height / 2 +
        yOffset;

    this.sideConnectionBondTurnPoint = endOfPathPart;

    if (isHorizontal) {
      endOfPathPart +=
        -(connection.yOffset || 0) * 3 +
        cos * -connection.offset * 3 +
        cos * (maxXOffset + 1) * 3 +
        (maxYOffset + 1) * 3;
    }
    let pathPart = isHorizontal ? 'H ' : 'V ';
    pathPart += `${endOfPathPart - SMOOTH_CORNER_SIZE * cos} `;
    pathPart += `q ${SMOOTH_CORNER_SIZE * cos},${SMOOTH_CORNER_SIZE * sin} ${
      SMOOTH_CORNER_SIZE * cos
    },${SMOOTH_CORNER_SIZE} `;

    return pathPart;
  }

  private appendSideConnectionBond(rootElement) {
    const editor = CoreEditor.provideEditorInstance();
    const matrix = editor.drawingEntitiesManager.canvasMatrix;
    const cells = matrix?.polymerBondToCells.get(this.polymerBond);

    if (!cells) {
      return;
    }

    const firstCell = cells[0];
    const firstCellConnection = firstCell.connections.find((connection) => {
      return connection.polymerBond === this.polymerBond;
    }) as Connection;
    const isVerticalConnection = firstCellConnection.isVertical;
    const isStraightVerticalConnection =
      cells.length === 2 && isVerticalConnection;
    const isFirstMonomerOfBondInFirstCell = firstCell.node?.monomers.includes(
      this.polymerBond.firstMonomer,
    );
    const isTwoNeighborRowsConnection = cells.every(
      (cell) => cell.y === firstCell.y || cell.y === firstCell.y + 1,
    );
    const startPosition = isFirstMonomerOfBondInFirstCell
      ? this.scaledPosition.startPosition
      : this.scaledPosition.endPosition;
    const endPosition = isFirstMonomerOfBondInFirstCell
      ? this.scaledPosition.endPosition
      : this.scaledPosition.startPosition;
    const xDirection =
      startPosition.x >= (this.sideConnectionBondTurnPoint || endPosition.x)
        ? 180
        : 0;
    let dAttributeForPath = `M ${startPosition.x},${startPosition.y} `;

    const cos = Math.cos((xDirection * Math.PI) / 180);

    let previousConnection;
    let previousCell;

    const horizontalPartIntersectionsOffset = firstCellConnection.offset;

    const areCellsOnSameRow = cells.every((cell) => {
      return cell.y === firstCell.y;
    });
    const isSecondCellEmpty = cells[1].node === null;

    if (areCellsOnSameRow) {
      dAttributeForPath += `L ${startPosition.x},${
        startPosition.y -
        BOND_END_LENGTH -
        horizontalPartIntersectionsOffset * 3
      } `;
      dAttributeForPath += `q 0,-${SMOOTH_CORNER_SIZE}, ${
        SMOOTH_CORNER_SIZE * cos
      },-${SMOOTH_CORNER_SIZE} `;
    } else {
      dAttributeForPath += `L ${startPosition.x},${
        startPosition.y +
        BOND_END_LENGTH +
        horizontalPartIntersectionsOffset * 3
      } `;
      if (
        !isStraightVerticalConnection &&
        !isSecondCellEmpty &&
        !isTwoNeighborRowsConnection
      ) {
        dAttributeForPath += `q 0,${SMOOTH_CORNER_SIZE} ${
          SMOOTH_CORNER_SIZE * cos
        },${SMOOTH_CORNER_SIZE} `;
      }
    }

    if (isVerticalConnection && !isStraightVerticalConnection) {
      dAttributeForPath += this.drawPartOfSideConnection(
        true,
        firstCellConnection,
        firstCell,
        this.sideConnectionBondTurnPoint &&
          startPosition.x < this.sideConnectionBondTurnPoint
          ? 0
          : 180,
      );
    }

    cells.forEach((cell, cellIndex) => {
      const cellConnection = cell.connections.find((connection) => {
        return connection.polymerBond === this.polymerBond;
      }) as Connection;
      const isLastCell = cellIndex === cells.length - 1;
      const _xDirection = this.sideConnectionBondTurnPoint
        ? endPosition.x < this.sideConnectionBondTurnPoint
          ? 180
          : 0
        : xDirection;
      if (isLastCell) {
        if (isStraightVerticalConnection) {
          return;
        }

        const directionObject = cellConnection.direction as {
          x: number;
          y: number;
        };
        const yDirection = isVerticalConnection ? 90 : directionObject.y;
        const sin = Math.sin((yDirection * Math.PI) / 180);
        const cos = Math.cos((_xDirection * Math.PI) / 180);

        if (!areCellsOnSameRow) {
          dAttributeForPath += `V ${
            endPosition.y - CELL_HEIGHT / 2 - SMOOTH_CORNER_SIZE
          } `;
          dAttributeForPath += `q 0,${SMOOTH_CORNER_SIZE * sin} ${
            SMOOTH_CORNER_SIZE * cos
          },${SMOOTH_CORNER_SIZE} `;
        }
        dAttributeForPath += `H ${endPosition.x - SMOOTH_CORNER_SIZE * cos} `;
        dAttributeForPath += `q ${SMOOTH_CORNER_SIZE * cos},0 ${
          SMOOTH_CORNER_SIZE * cos
        },${SMOOTH_CORNER_SIZE} `;
        return;
      }
      // empty cells
      if (cell.node === null) {
        return;
      }

      // other cells
      if (
        previousConnection &&
        previousConnection.direction !== cellConnection.direction
      ) {
        const isHorizontal =
          previousConnection.direction === 0 ||
          previousConnection.direction === 180;

        dAttributeForPath += this.drawPartOfSideConnection(
          isHorizontal,
          previousConnection,
          previousCell,
          isHorizontal ? xDirection : previousConnection.direction,
        );
      }
      previousCell = cell;
      previousConnection = cellConnection;
    });

    dAttributeForPath += `L ${endPosition.x},${endPosition.y} `;

    this.bodyElement = rootElement
      .append('path')
      .attr('class', `${SIDE_CONNECTION_BODY_ELEMENT_CLASS}`)
      .attr('stroke', '#43B5C0')
      .attr('stroke-width', 1)
      .attr('d', dAttributeForPath)
      .attr('fill', 'none')
      .attr('pointer-events', 'stroke');

    this.path = dAttributeForPath;

    return this.bodyElement;
  }

  private getMonomerWidth() {
    return this.polymerBond.firstMonomer.renderer?.monomerSize.width ?? 0;
  }

  private getMonomerHeight() {
    return this.polymerBond.firstMonomer.renderer?.monomerSize.height ?? 0;
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

    // check if there is nucleotide in current row
    const isBondConnectedWithNucleotide =
      this.polymerBond.firstMonomer.isMonomerInRnaChainRow;

    const verticalLineLength = isBondConnectedWithNucleotide
      ? RNA_CHAIN_VERTICAL_LINE_LENGTH
      : VERTICAL_LINE_LENGTH + 5;

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
      this.addLine(LINE_DIRECTION.Vertical, verticalLineLength);
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
          verticalLineLength,
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

  private isSecondMonomerBottomLeft(
    startPosition: Vec2,
    endPosition: Vec2,
  ): boolean {
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

  private isSecondMonomerLeft(startPosition: Vec2, endPosition: Vec2): boolean {
    return (
      startPosition.y - endPosition.y < 0 &&
      startPosition.y - endPosition.y >
        -2 * (VERTICAL_LINE_LENGTH + DOUBLE_CORNER_LENGTH) &&
      endPosition.x - startPosition.x <=
        DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth()
    );
  }

  private addLineFromTopToRight() {
    this.path = `${this.path} c 0,4.418 3.582,${CORNER_LENGTH} ${CORNER_LENGTH},${CORNER_LENGTH}`;
  }

  private addLineFromLeftToTop() {
    this.path = `${this.path} c 4.418,0 ${CORNER_LENGTH},-3.582 ${CORNER_LENGTH},-${CORNER_LENGTH}`;
  }

  private addLineFromBottomToRight() {
    this.path = `${this.path} c 0,-4.418 3.582,-${CORNER_LENGTH} ${CORNER_LENGTH},-${CORNER_LENGTH}`;
  }

  private addLineFromLeftToBottom() {
    this.path = `${this.path} c 4.418,0 ${CORNER_LENGTH},3.582 ${CORNER_LENGTH},${CORNER_LENGTH}`;
  }

  private addLineFromTopToLeft() {
    this.path = `${this.path} c 0,4.418 -3.582,${CORNER_LENGTH} -${CORNER_LENGTH},${CORNER_LENGTH}`;
  }

  private addLineFromRightToUp() {
    this.path = `${this.path} c -4.418,0 -${CORNER_LENGTH},-3.582 -${CORNER_LENGTH},-${CORNER_LENGTH}`;
  }

  private addLineFromRightToBottom() {
    this.path = `${this.path} c -4.418,0 -${CORNER_LENGTH},3.582 -${CORNER_LENGTH},${CORNER_LENGTH}`;
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
      .attr('stroke-width', 1)
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

  public show(_theme?, force = false) {
    if (force) {
      this.sideConnectionBondTurnPoint = undefined;
    }
    this.rootElement = this.rootElement || this.appendRootElement();
    this.appendBond(this.rootElement);
    this.appendHoverAreaElement();
    this.drawSelection();
  }

  public drawSelection() {
    if (this.polymerBond.selected) {
      const editor = CoreEditor.provideEditorInstance();

      this.selectionElement?.remove();
      if (
        (this.isSnake && !this.isMonomersOnSameHorizontalLine()) ||
        (editor.mode instanceof SnakeMode &&
          this.polymerBond.isSideChainConnection)
      ) {
        this.selectionElement = this.rootElement
          ?.insert('path', ':first-child')
          .attr('stroke', '#57FF8F')
          .attr('stroke-width', 2)
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
          .attr('stroke-width', '5')
          .attr('class', 'dynamic-element');
      }
    } else {
      this.selectionElement?.remove();
    }
  }

  public moveEnd() {
    if (
      this.isSnake &&
      !this.isMonomersOnSameHorizontalLine() &&
      this.polymerBond.finished
    ) {
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

    this.hoverCircleAreaElement
      ?.attr('cx', this.scaledPosition.endPosition.x)
      .attr('cy', this.scaledPosition.endPosition.y);

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
    const editor = CoreEditor.provideEditorInstance();

    if (
      (this.isSnake && !this.isMonomersOnSameHorizontalLine()) ||
      (editor?.mode instanceof SnakeMode &&
        this.polymerBond.isSideChainConnection)
    ) {
      (<D3SvgElementSelection<SVGPathElement, void> | undefined>(
        this.hoverAreaElement
      )) = this.rootElement
        ?.append('path')
        .attr('stroke', 'transparent')
        .attr('d', this.path)
        .attr('fill-opacity', 0)
        .attr('stroke-width', '5');
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

      (<D3SvgElementSelection<SVGCircleElement, void> | undefined>(
        this.hoverCircleAreaElement
      )) = this.rootElement
        ?.append('circle')
        .attr('cursor', 'pointer')
        .attr('r', '1')
        .attr('fill', 'transparent')
        .attr('stroke-width', '10')
        .attr('cx', this.scaledPosition.endPosition.x)
        .attr('cy', this.scaledPosition.endPosition.y);
    }
  }

  public appendHover() {
    assert(this.bodyElement);

    const editor = CoreEditor.provideEditorInstance();

    if (
      editor.mode instanceof SnakeMode &&
      this.polymerBond.isSideChainConnection
    ) {
      const allSideConnectionBondsBodyElements = editor.canvas.querySelectorAll(
        `.${SIDE_CONNECTION_BODY_ELEMENT_CLASS}`,
      );

      Array.from(allSideConnectionBondsBodyElements).forEach(
        (bondBodyElement) => {
          bondBodyElement.setAttribute('stroke', '#C0E2E6');
        },
      );
    }

    this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');

    if (this.polymerBond.selected && this.selectionElement) {
      this.selectionElement.attr('stroke', '#CCFFDD');
    }
  }

  public removeHover() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);

    const editor = CoreEditor.provideEditorInstance();

    if (
      editor.mode instanceof SnakeMode &&
      this.polymerBond.isSideChainConnection
    ) {
      const allSideConnectionBondsBodyElements = editor.canvas.querySelectorAll(
        `.${SIDE_CONNECTION_BODY_ELEMENT_CLASS}`,
      );

      Array.from(allSideConnectionBondsBodyElements).forEach(
        (bondBodyElement) => {
          const renderer = bondBodyElement.__data__ as PolymerBondRenderer;

          bondBodyElement.setAttribute(
            'stroke',
            renderer.polymerBond.isSideChainConnection ? '#43B5C0' : '#333333',
          );
        },
      );
    }

    this.bodyElement
      .attr(
        'stroke',
        this.polymerBond.isSideChainConnection ? '#43B5C0' : '#333333',
      )
      .attr('pointer-events', 'stroke');

    if (this.polymerBond.selected && this.selectionElement) {
      this.selectionElement.attr('stroke', '#57FF8F');
    }

    return this.hoverAreaElement.attr('stroke', 'transparent');
  }
}
