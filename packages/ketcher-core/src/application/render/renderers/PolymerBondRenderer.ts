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
import { isNumber, isObject } from 'lodash';
import { CanvasMatrix } from 'domain/entities/canvas-matrix/CanvasMatrix';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { Connection } from 'domain/entities/canvas-matrix/Connection';

const LINE_FROM_MONOMER_LENGTH = 15;
const VERTICAL_LINE_LENGTH = 21;
const RNA_CHAIN_VERTICAL_LINE_LENGTH = 74;
const CORNER_LENGTH = 4;
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

  private isSnakeBondAvailableForMonomer(monomer?: BaseMonomer) {
    return (
      monomer instanceof Peptide ||
      monomer instanceof Chem ||
      monomer instanceof Sugar ||
      monomer instanceof Phosphate
    );
  }

  get isSnake() {
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
    if (
      !this.isSnake ||
      (this.isMonomersOnSameHorizontalLine() &&
        !this.polymerBond.isSideChainConnection) ||
      !this.polymerBond.finished
    ) {
      this.appendBondGraph(rootElement);
    } else if (this.polymerBond.isBackBoneChainConnection) {
      this.appendSnakeBond(rootElement);
    } else {
      this.appendSideConnectionBond(rootElement);
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

  private getBondPartIntersections(
    matrix: CanvasMatrix,
    connectionCells: Cell[],
    polymerBond: PolymerBond,
    directionsToCheck: number[] = [0, 180],
    handledConnections: Set<PolymerBond> = new Set(),
  ) {
    return connectionCells.reduce((offset, cell) => {
      const connectionsStartedOnHorizontalPart = cell.connections.reduce(
        (intersectionsAmount, connection) => {
          let newIntersectionsAmount = intersectionsAmount;
          const connectionCells = matrix?.polymerBondToCells.get(
            connection.polymerBond,
          );
          if (
            connection.polymerBond !== polymerBond &&
            directionsToCheck.includes(connection.direction) &&
            connectionCells[0] === cell &&
            !handledConnections.has(connection.polymerBond)
          ) {
            handledConnections.add(connection.polymerBond);
            newIntersectionsAmount++;
            newIntersectionsAmount += this.getBondPartIntersections(
              matrix,
              connectionCells,
              connection.polymerBond,
              directionsToCheck,
              handledConnections,
            );
          }
          return newIntersectionsAmount;
        },
        0,
      );

      return offset + connectionsStartedOnHorizontalPart;
    }, 0);
  }

  public appendSideConnectionBond(rootElement) {
    const editor = CoreEditor.provideEditorInstance();
    const matrix = editor.drawingEntitiesManager.canvasMatrix;
    const cells = matrix?.polymerBondToCells.get(this.polymerBond);

    if (!cells) {
      return;
    }

    const BOND_END_LENGTH = 15;
    const CELL_WIDTH = 60;
    const CELL_HEIGHT = 40;
    const SMOOTH_CORNER_SIZE = 5;
    const firstCell = cells[0];
    const firstCellConnection = firstCell.connections.find((connection) => {
      return connection.polymerBond === this.polymerBond;
    });
    const isFirstMonomerOfBondInFirstCell = firstCell.node.monomers.includes(
      this.polymerBond.firstMonomer,
    );
    const startPosition = isFirstMonomerOfBondInFirstCell
      ? this.scaledPosition.startPosition
      : this.scaledPosition.endPosition;
    const endPosition = isFirstMonomerOfBondInFirstCell
      ? this.scaledPosition.endPosition
      : this.scaledPosition.startPosition;
    let dAttributeForPath = `M ${startPosition.x},${startPosition.y} `;

    const cos = Math.cos((firstCellConnection.direction * Math.PI) / 180);

    let previousConnection;
    let previousCell;

    const horizontalPartIntersectionsOffset = firstCellConnection.offset;

    const areCellsOnSameRow = cells.every((cell) => {
      return cell.y === firstCell.y;
    });
    const isSecondCellEmpty = cells[1].node === null;
    const isStraightVerticalConnection =
      cells.every((cell) => {
        return cell.x === firstCell.x;
      }) &&
      (cells.length === 2 || (cells.length === 3 && isSecondCellEmpty));

    if (areCellsOnSameRow) {
      dAttributeForPath += `L ${startPosition.x},${
        startPosition.y -
        BOND_END_LENGTH -
        horizontalPartIntersectionsOffset * 3
      } `;
      dAttributeForPath += `q 0,-${SMOOTH_CORNER_SIZE}, ${SMOOTH_CORNER_SIZE},-${SMOOTH_CORNER_SIZE} `;
    } else {
      dAttributeForPath += `L ${startPosition.x},${
        startPosition.y +
        BOND_END_LENGTH +
        horizontalPartIntersectionsOffset * 3
      } `;
      if (!isStraightVerticalConnection && !isSecondCellEmpty) {
        dAttributeForPath += `q 0,${SMOOTH_CORNER_SIZE} ${
          SMOOTH_CORNER_SIZE * cos
        },${SMOOTH_CORNER_SIZE} `;
      }
    }

    cells.forEach((cell) => {
      const cellConnection = cell.connections.find((connection) => {
        return connection.polymerBond === this.polymerBond;
      });
      // last cell
      if (isObject(cellConnection.direction)) {
        const sin = Math.sin((cellConnection.direction.y * Math.PI) / 180);
        const cos = Math.cos((cellConnection.direction.x * Math.PI) / 180);
        if (isStraightVerticalConnection) {
          return;
        }

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
        const sin = Math.sin((previousConnection.direction * Math.PI) / 180);
        const cos = Math.cos((previousConnection.direction * Math.PI) / 180);
        const xOffset = (CELL_WIDTH / 2 - SMOOTH_CORNER_SIZE) * cos;
        const yOffset = (CELL_HEIGHT / 2) * sin;
        const isHorizontal =
          previousConnection.direction === 0 ||
          previousConnection.direction === 180;
        const endOfPathPart = isHorizontal
          ? cell.node.monomer.renderer?.scaledMonomerPosition.x +
            cell.node.monomer.renderer?.monomerSize.width / 2 +
            xOffset +
            (horizontalPartIntersectionsOffset / 2) * 3
          : cell.node.monomer.renderer?.scaledMonomerPosition.y +
            cell.node.monomer.renderer?.monomerSize.height / 2 +
            yOffset;

        let pathPart = isHorizontal ? 'H ' : 'V ';
        pathPart += `${endOfPathPart} `;
        pathPart += `q ${SMOOTH_CORNER_SIZE * cos},${
          SMOOTH_CORNER_SIZE * sin
        } ${SMOOTH_CORNER_SIZE * cos},${SMOOTH_CORNER_SIZE} `;

        dAttributeForPath += pathPart;
      }
      previousCell = cell;
      previousConnection = cellConnection;
    });

    dAttributeForPath += `L ${endPosition.x},${endPosition.y} `;

    this.bodyElement = rootElement
      .append('path')
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
      .attr('d', dAttributeForPath)
      .attr('fill', 'none')
      .attr('pointer-events', 'stroke');

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
    this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');

    if (this.polymerBond.selected) {
      assert(this.hoverAreaElement);
      this.hoverAreaElement.attr('stroke', '#CCFFDD');
    }
  }

  public removeHover() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement
      .attr(
        'stroke',
        this.polymerBond.isSideChainConnection ? 'red' : '#333333',
      )
      .attr('pointer-events', 'stroke');

    return this.hoverAreaElement.attr('stroke', 'transparent');
  }
}
