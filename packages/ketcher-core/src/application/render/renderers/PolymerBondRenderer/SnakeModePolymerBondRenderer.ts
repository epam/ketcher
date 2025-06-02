import { SnakeMode } from 'application/editor';
import { editorEvents } from 'application/editor/editorEvents';
import { CoreEditor } from 'application/editor/internal';
import { Coordinates } from 'application/editor/shared/coordinates';
import {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import type { PolymerBondRendererStartAndEndPositions } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRenderer.types';
import { SVGPathDAttributeUtil } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtil';
import { D3SvgElementSelection } from 'application/render/types';
import assert from 'assert';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import {
  Connection,
  ConnectionDirectionInDegrees,
  ConnectionDirectionOfLastCell,
} from 'domain/entities/canvas-matrix/Connection';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { isNumber } from 'lodash';
import { BaseRenderer } from '../BaseRenderer';
import {
  CORNER_LENGTH,
  DOUBLE_CORNER_LENGTH,
  generateBend,
  generateCornerFromBottomToRight,
  generateCornerFromLeftToBottom,
  generateCornerFromLeftToTop,
  generateCornerFromRightToBottom,
  generateCornerFromRightToTop,
  generateCornerFromTopToLeft,
  generateCornerFromTopToRight,
  SMOOTH_CORNER_SIZE,
} from './helpers';
import { SnakeLayoutCellWidth } from 'domain/constants';

enum LineDirection {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

const LINE_FROM_MONOMER_LENGTH = 15;
const VERTICAL_LINE_LENGTH = 21;
const RNA_CHAIN_VERTICAL_LINE_LENGTH = 74;
const RNA_ANTISENSE_CHAIN_VERTICAL_LINE_LENGTH = 20;
const RNA_SENSE_CHAIN_VERTICAL_LINE_LENGTH = 210;

const BOND_END_LENGTH = 15;
const CELL_HEIGHT = 40;
const SIDE_CONNECTION_BODY_ELEMENT_CLASS = 'polymer-bond-body';

// TODO: Need to split the class by three:
//  - `SnakeModeBackboneBondRenderer` (black “snake” line)
//  - `SnakeModeSideChainBondRenderer` (blue “snake” line)
//  - `SnakeModeRNABaseAndSugarBondRenderer` (black straight line)
export class SnakeModePolymerBondRenderer extends BaseRenderer {
  private editorEvents: typeof editorEvents;
  private isSnakeBond = false; // `SnakeModeBackboneBondRenderer` or `SnakeModeRNABaseAndSugarBondRenderer`.
  // TODO: Specify the types.
  private selectionElement;
  private path = '';
  private previousStateOfIsMonomersOnSameHorizontalLine = false;
  private sideConnectionBondTurnPoint?: number;
  public declare bodyElement?: D3SvgElementSelection<SVGLineElement, this>;

  constructor(public readonly polymerBond: PolymerBond) {
    super(polymerBond as DrawingEntity);
    this.polymerBond.setRenderer(this);
    this.editorEvents = editorEvents;
    this.calculateIsSnakeBond();
  }

  // TODO: Delete.
  public get isSnake(): true {
    return true;
  }

  private get isHydrogenBond() {
    return this.polymerBond instanceof HydrogenBond;
  }

  public get rootBBox(): DOMRect | undefined {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get width(): number {
    return this.rootBBox?.width || 0;
  }

  public get height(): number {
    return this.rootBBox?.height || 0;
  }

  private get scaledPosition(): PolymerBondRendererStartAndEndPositions {
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

  public getSideConnectionEndpointAngle(monomer: BaseMonomer): number {
    const editor = CoreEditor.provideEditorInstance();
    const matrix = editor.drawingEntitiesManager.canvasMatrix;
    const cells = matrix?.polymerBondToCells.get(this.polymerBond);
    const startCellDirection = cells?.[0].connections?.find(
      (connection) => connection.polymerBond === this.polymerBond,
    )?.direction;
    const endCellDirection = cells?.[cells.length - 1].connections?.find(
      (connection) => connection.polymerBond === this.polymerBond,
    )?.direction;
    const startCellMonomer = cells?.[0].monomer;
    const endpointDirection =
      monomer === startCellMonomer ? startCellDirection : endCellDirection;
    const startCellNormalizedDirection = isNumber(startCellDirection)
      ? startCellDirection
      : startCellDirection?.y;
    const endCellNormalizedDirection = isNumber(endCellDirection)
      ? endCellDirection
      : endCellDirection?.y;
    const normalizedDirection = isNumber(endpointDirection)
      ? endpointDirection
      : endpointDirection?.y;
    const endpointAngle =
      normalizedDirection === 0 ? -Math.PI / 2 : Math.PI / 2;

    return startCellDirection === 90 && endCellDirection === 90 // vertical bond. need to check is it right that angles 90 and 90
      ? monomer === startCellMonomer
        ? -Math.PI / 2
        : Math.PI / 2
      : startCellNormalizedDirection === 0 && endCellNormalizedDirection === 270 // horizontal bond.
      ? Math.PI / 2
      : endpointAngle;
  }

  public moveSelection(): void {
    if (
      this.previousStateOfIsMonomersOnSameHorizontalLine !==
      this.polymerBond.isHorizontal
    ) {
      this.remove();
      this.show();
    } else {
      assert(this.rootElement);
      this.moveStart();
      this.moveEnd();
    }
    this.previousStateOfIsMonomersOnSameHorizontalLine =
      this.polymerBond.isHorizontal;
  }

  // TODO: Specify the types.
  public appendBond(rootElement) {
    const editor = CoreEditor.provideEditorInstance();
    const matrix = editor.drawingEntitiesManager.canvasMatrix;
    const cells = matrix?.polymerBondToCells.get(this.polymerBond);

    if (
      (this.polymerBond.isSideChainConnection ||
        this.isSideChainLikeBackbone) &&
      (!this.isHydrogenBond || editor.mode instanceof SnakeMode) &&
      cells
    ) {
      this.appendSideConnectionBond(rootElement, cells);
    } else if (
      this.isSnakeBond &&
      this.polymerBond.finished &&
      !this.polymerBond.isHorizontal
    ) {
      this.appendSnakeBond(rootElement);
    } else {
      this.appendBondGraph(rootElement);
    }

    return this.bodyElement;
  }

  // TODO: Specify the types.
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
      .attr('pointer-events', 'stroke')
      .attr('data-testid', 'bond')
      .attr('data-bondtype', 'covalent')
      .attr('data-bondid', this.polymerBond.id)
      .attr('data-frommonomerid', this.polymerBond.firstMonomer.id)
      .attr('data-tomonomerid', this.polymerBond.secondMonomer?.id)
      .attr(
        'data-fromconnectionpoint',
        this.polymerBond.firstMonomer.getAttachmentPointByBond(
          this.polymerBond,
        ),
      )
      .attr(
        'data-toconnectionpoint',
        this.polymerBond.secondMonomer?.getAttachmentPointByBond(
          this.polymerBond,
        ),
      );
    return this.bodyElement;
  }

  // TODO: Specify the types.
  private drawPartOfSideConnection({
    cell,
    connection,
    direction,
    horizontal,
    sideConnectionBondTurnPoint,
  }: {
    readonly cell: Cell;
    readonly connection: Connection;
    readonly direction: ConnectionDirectionInDegrees;
    readonly horizontal: boolean;
    readonly sideConnectionBondTurnPoint: number;
  }): {
    readonly pathPart: string;
    readonly sideConnectionBondTurnPoint: number;
  } {
    const sin = Math.sin((direction * Math.PI) / 180);
    const cos = Math.cos((direction * Math.PI) / 180);
    const xOffset = (SnakeLayoutCellWidth / 2) * cos;
    const yOffset = (CELL_HEIGHT / 2) * sin;
    const maxXOffset = cell.connections.reduce(
      (max: number, connection: Connection): number => {
        return max > connection.xOffset ? max : connection.xOffset;
      },
      0,
    );
    const maxYOffset = cell.connections.reduce(
      (max: number, connection: Connection): number => {
        const connectionYOffset = connection.yOffset || 0;
        return max > connectionYOffset ? max : connectionYOffset;
      },
      0,
    );

    let endOfPathPart: number;
    if (horizontal && sideConnectionBondTurnPoint) {
      endOfPathPart = sideConnectionBondTurnPoint;
    } else {
      const { monomerSize, scaledMonomerPosition } = (
        cell.monomer as BaseMonomer
      ).renderer as BaseMonomerRenderer | BaseSequenceItemRenderer;
      endOfPathPart = horizontal
        ? scaledMonomerPosition.x + monomerSize.width / 2 + xOffset
        : scaledMonomerPosition.y + monomerSize.height / 2 + yOffset;
    }

    const sideConnectionBondTurnPointInternal = endOfPathPart;

    if (horizontal) {
      endOfPathPart +=
        -(connection.yOffset || 0) * 3 +
        cos * -connection.xOffset * 3 +
        cos * (maxXOffset + 1) * 3 +
        (maxYOffset + 1) * 3;
    }
    let pathPart = '';
    if (horizontal) {
      const absoluteLineX = endOfPathPart - SMOOTH_CORNER_SIZE * cos;
      pathPart +=
        SVGPathDAttributeUtil.generateHorizontalAbsoluteLine(absoluteLineX) +
        ' ';
    } else {
      const absoluteLineY = endOfPathPart - SMOOTH_CORNER_SIZE * cos;
      pathPart +=
        SVGPathDAttributeUtil.generateVerticalAbsoluteLine(absoluteLineY) + ' ';
    }
    pathPart += generateBend(cos, sin, cos, 1) + ' ';

    return {
      pathPart,
      sideConnectionBondTurnPoint: sideConnectionBondTurnPointInternal,
    };
  }

  // TODO: Specify the types.
  private appendSideConnectionBond(rootElement, cells: Cell[]) {
    const firstCell = cells[0];
    const firstCellConnection = firstCell.connections.find(
      (connection: Connection): boolean => {
        return connection.polymerBond === this.polymerBond;
      },
    ) as Connection;
    const isVerticalConnection = firstCellConnection.isVertical;
    const isStraightVerticalConnection =
      (cells.length === 2 ||
        cells.reduce(
          (isStraight: boolean, cell: Cell, index: number): boolean => {
            if (!isStraight || index === 0 || index === cells.length - 1) {
              return isStraight;
            }
            return cell.x === firstCell.x && !cell.monomer;
          },
          true,
        )) &&
      isVerticalConnection;
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
    let pathDAttributeValue =
      SVGPathDAttributeUtil.generateMoveTo(startPosition.x, startPosition.y) +
      ' ';

    const cos = Math.cos((xDirection * Math.PI) / 180);

    let previousConnection: Connection;
    let previousCell: Cell;

    const horizontalPartIntersectionsOffset = firstCellConnection.xOffset;

    const areCellsOnSameRow = cells.every((cell) => {
      return cell.y === firstCell.y;
    });
    const isSecondCellEmpty = cells[1].node === null;

    if (areCellsOnSameRow) {
      {
        const absoluteLineY =
          startPosition.y -
          BOND_END_LENGTH -
          horizontalPartIntersectionsOffset * 3;
        pathDAttributeValue +=
          SVGPathDAttributeUtil.generateAbsoluteLine(
            startPosition.x,
            absoluteLineY,
          ) + ' ';
      }
      pathDAttributeValue += generateBend(0, -1, cos, -1) + ' ';
    } else {
      {
        const absoluteLineY =
          startPosition.y +
          BOND_END_LENGTH +
          horizontalPartIntersectionsOffset * 3;
        pathDAttributeValue +=
          SVGPathDAttributeUtil.generateAbsoluteLine(
            startPosition.x,
            absoluteLineY,
          ) + ' ';
      }
      if (
        !isStraightVerticalConnection &&
        !isSecondCellEmpty &&
        !isTwoNeighborRowsConnection
      ) {
        pathDAttributeValue += generateBend(0, 1, cos, 1) + ' ';
      }
    }

    if (isVerticalConnection && !isStraightVerticalConnection) {
      const direction =
        this.sideConnectionBondTurnPoint &&
        startPosition.x < this.sideConnectionBondTurnPoint
          ? 0
          : 180;
      const result = this.drawPartOfSideConnection({
        cell: firstCell,
        connection: firstCellConnection,
        direction,
        horizontal: true,
        sideConnectionBondTurnPoint: this.sideConnectionBondTurnPoint ?? 0,
      });
      pathDAttributeValue += result.pathPart;
      this.sideConnectionBondTurnPoint = result.sideConnectionBondTurnPoint;
    }

    let maxHorizontalOffset = 0;

    cells.forEach((cell: Cell, cellIndex: number): void => {
      const cellConnection = cell.connections.find(
        (connection: Connection): boolean => {
          return connection.polymerBond === this.polymerBond;
        },
      ) as Connection;
      const isLastCell = cellIndex === cells.length - 1;
      const _xDirection = this.sideConnectionBondTurnPoint
        ? endPosition.x < this.sideConnectionBondTurnPoint
          ? 180
          : 0
        : xDirection;
      const maxXOffset = cell.connections.reduce(
        (max: number, connection: Connection): number => {
          return connection.isVertical || max > connection.xOffset
            ? max
            : connection.xOffset;
        },
        0,
      );

      maxHorizontalOffset =
        maxHorizontalOffset > maxXOffset ? maxHorizontalOffset : maxXOffset;

      if (isLastCell) {
        if (isStraightVerticalConnection) {
          return;
        }

        const directionObject =
          cellConnection.direction as ConnectionDirectionOfLastCell;
        const yDirection = isVerticalConnection ? 90 : directionObject.y;
        const sin = Math.sin((yDirection * Math.PI) / 180);
        const cos = Math.cos((_xDirection * Math.PI) / 180);

        if (!areCellsOnSameRow) {
          {
            const absoluteLineY =
              endPosition.y -
              CELL_HEIGHT / 2 -
              SMOOTH_CORNER_SIZE -
              sin * (cellConnection.yOffset || 0) * 3 -
              (isTwoNeighborRowsConnection
                ? maxHorizontalOffset - cellConnection.xOffset
                : cellConnection.xOffset) *
                3;
            pathDAttributeValue +=
              SVGPathDAttributeUtil.generateVerticalAbsoluteLine(
                absoluteLineY,
              ) + ' ';
          }
          pathDAttributeValue += generateBend(0, sin, cos, 1) + ' ';
        }
        pathDAttributeValue += `H ${endPosition.x - SMOOTH_CORNER_SIZE * cos} `;
        pathDAttributeValue += generateBend(cos, 0, cos, 1) + ' ';
        return;
      }

      // Empty cells.
      if (cell.node === null) {
        return;
      }

      // Other cells.
      if (
        previousConnection &&
        previousConnection.direction !== cellConnection.direction
      ) {
        // TODO?: Check. I am not sure about `as ConnectionDirectionInDegrees`.
        const horizontal = new Set([0, 180]).has(
          previousConnection.direction as ConnectionDirectionInDegrees,
        );
        const direction = horizontal
          ? xDirection
          : // TODO?: Check. I am not sure about `as ConnectionDirectionInDegrees`.
            (previousConnection.direction as ConnectionDirectionInDegrees);
        const result = this.drawPartOfSideConnection({
          cell: previousCell,
          connection: previousConnection,
          direction,
          horizontal,
          sideConnectionBondTurnPoint: this.sideConnectionBondTurnPoint ?? 0,
        });
        pathDAttributeValue += result.pathPart;
        this.sideConnectionBondTurnPoint = result.sideConnectionBondTurnPoint;
      }
      previousCell = cell;
      previousConnection = cellConnection;
    });

    pathDAttributeValue +=
      SVGPathDAttributeUtil.generateAbsoluteLine(endPosition.x, endPosition.y) +
      ' ';

    this.bodyElement = rootElement
      .append('path')
      .attr('class', `${SIDE_CONNECTION_BODY_ELEMENT_CLASS}`)
      .attr(
        'stroke',
        this.isHydrogenBond || this.isSideChainLikeBackbone
          ? '#333333'
          : '#43B5C0',
      )
      .attr('stroke-width', 1)
      .attr('d', pathDAttributeValue)
      .attr('fill', 'none')
      .attr('stroke-dasharray', this.isHydrogenBond ? '2' : '0')
      .attr('pointer-events', 'all')
      .attr('data-testid', 'bond')
      .attr('data-bondtype', this.isHydrogenBond ? 'hydrogen' : 'covalent')
      .attr('data-bondid', this.polymerBond.id)
      .attr('data-frommonomerid', this.polymerBond.firstMonomer.id)
      .attr('data-tomonomerid', this.polymerBond.secondMonomer?.id);

    if (!this.isHydrogenBond && this.bodyElement) {
      this.bodyElement
        .attr(
          'data-fromconnectionpoint',
          this.polymerBond.firstMonomer.getAttachmentPointByBond(
            this.polymerBond,
          ) || '',
        )
        .attr(
          'data-toconnectionpoint',
          this.polymerBond.secondMonomer?.getAttachmentPointByBond(
            this.polymerBond,
          ) || '',
        );
    }

    this.path = pathDAttributeValue;

    return this.bodyElement;
  }

  private getMonomerWidth(): number {
    return this.polymerBond.firstMonomer.renderer?.monomerSize.width ?? 0;
  }

  private getMonomerHeight(): number {
    return this.polymerBond.firstMonomer.renderer?.monomerSize.height ?? 0;
  }

  private get isSideChainLikeBackbone() {
    return (
      !this.polymerBond.isSideChainConnection &&
      this.polymerBond.isOverlappedByMonomer
    );
  }

  private updateSnakeBondPath(
    _startPosition: Vec2,
    _endPosition: Vec2,
    reCheckAttachmentPoint = true,
  ): void {
    const isR1TheCurrentAttachmentPointOfFirstMonomer =
      this.polymerBond.firstMonomer.getAttachmentPointByBond(
        this.polymerBond,
      ) === 'R1' ||
      this.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(
        this.polymerBond,
      ) === 'R1';
    const isAntisense = this.polymerBond.firstMonomer.monomerItem.isAntisense;
    const startPosition = isAntisense ? _endPosition : _startPosition;
    const endPosition = isAntisense ? _startPosition : _endPosition;

    // check if there is nucleotide in current row
    const isBondConnectedWithNucleotide =
      this.polymerBond.firstMonomer.isMonomerInRnaChainRow;
    const verticalLineLength = isAntisense
      ? RNA_ANTISENSE_CHAIN_VERTICAL_LINE_LENGTH
      : this.polymerBond.firstMonomer.monomerItem.isSense &&
        this.polymerBond.hasAntisenseInRow
      ? RNA_SENSE_CHAIN_VERTICAL_LINE_LENGTH
      : isBondConnectedWithNucleotide
      ? RNA_CHAIN_VERTICAL_LINE_LENGTH
      : VERTICAL_LINE_LENGTH + 5;

    if (this.isSecondMonomerBottomRight(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentPointOfFirstMonomer &&
        reCheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path = this.path.concat(generateCornerFromLeftToBottom());
      this.addLine(
        LineDirection.Vertical,
        endPosition.y - startPosition.y - DOUBLE_CORNER_LENGTH,
      );
      this.path = this.path.concat(generateCornerFromTopToRight());
      this.addLine(
        LineDirection.Horizontal,
        endPosition.x -
          startPosition.x -
          DOUBLE_CORNER_LENGTH -
          LINE_FROM_MONOMER_LENGTH -
          this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerTopRight(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentPointOfFirstMonomer &&
        reCheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path = this.path.concat(generateCornerFromLeftToTop());
      this.addLine(
        LineDirection.Vertical,
        endPosition.y -
          startPosition.y -
          DOUBLE_CORNER_LENGTH +
          this.getMonomerHeight() / 2,
      );
      this.path = this.path.concat(generateCornerFromBottomToRight());
      this.addLine(
        LineDirection.Horizontal,
        endPosition.x -
          startPosition.x -
          DOUBLE_CORNER_LENGTH -
          LINE_FROM_MONOMER_LENGTH -
          this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerBottomLeft(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentPointOfFirstMonomer &&
        reCheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH -
          (this.polymerBond.firstMonomer.monomerItem.isAntisense ? 10 : 0) +
          this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path = this.path.concat(generateCornerFromLeftToBottom());

      this.addLine(LineDirection.Vertical, verticalLineLength);
      this.path = this.path.concat(generateCornerFromTopToLeft());
      this.addLine(
        LineDirection.Horizontal,
        -(
          startPosition.x -
          (this.polymerBond.nextRowPositionX || endPosition.x) +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );
      this.path = this.path.concat(generateCornerFromRightToBottom());
      this.addLine(
        LineDirection.Vertical,
        endPosition.y -
          startPosition.y -
          CORNER_LENGTH * 4 -
          verticalLineLength,
      );
      this.path = this.path.concat(generateCornerFromTopToRight());
      this.addLine(
        LineDirection.Horizontal,
        this.polymerBond.nextRowPositionX
          ? endPosition.x -
              this.polymerBond.nextRowPositionX +
              this.getMonomerWidth()
          : LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerTopLeft(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentPointOfFirstMonomer &&
        reCheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path = this.path.concat(generateCornerFromLeftToBottom());
      this.addLine(LineDirection.Vertical, this.getMonomerHeight());
      this.path = this.path.concat(generateCornerFromTopToLeft());
      this.addLine(
        LineDirection.Horizontal,
        -(
          startPosition.x -
          endPosition.x +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );

      this.path = this.path.concat(generateCornerFromRightToTop());
      this.addLine(
        LineDirection.Vertical,
        endPosition.y - startPosition.y - this.getMonomerHeight(),
      );
      this.path = this.path.concat(generateCornerFromBottomToRight());
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerLeft(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentPointOfFirstMonomer &&
        reCheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path = this.path.concat(generateCornerFromLeftToBottom());
      this.addLine(
        LineDirection.Vertical,
        endPosition.y - startPosition.y + this.getMonomerHeight(),
      );
      this.path = this.path.concat(generateCornerFromTopToLeft());
      this.addLine(
        LineDirection.Horizontal,
        -(
          startPosition.x -
          endPosition.x +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );

      this.path = this.path.concat(generateCornerFromRightToTop());
      this.addLine(LineDirection.Vertical, -this.getMonomerHeight());
      this.path = this.path.concat(generateCornerFromBottomToRight());
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
      );
    } else {
      this.addRandomLine(startPosition, endPosition);
    }
  }

  private isSecondMonomerTopRight(
    startPosition: Vec2,
    endPosition: Vec2,
  ): boolean {
    return (
      startPosition.y - endPosition.y > DOUBLE_CORNER_LENGTH &&
      endPosition.x - startPosition.x >
        DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth()
    );
  }

  private isSecondMonomerBottomRight(
    startPosition: Vec2,
    endPosition: Vec2,
  ): boolean {
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

  private isSecondMonomerTopLeft(
    startPosition: Vec2,
    endPosition: Vec2,
  ): boolean {
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

  private addLine(
    lineDirection: LineDirection,
    length: number,
    startPosition?: Vec2,
  ): void {
    const start = startPosition
      ? SVGPathDAttributeUtil.generateMoveTo(
          Math.round(startPosition.x),
          Math.round(startPosition.y),
        )
      : this.path;
    const line =
      lineDirection === LineDirection.Horizontal
        ? `l${length}, 0`
        : `l 0, ${length}`;
    this.path = `${start} ${line}`;
  }

  private addRandomLine(startPosition: Vec2, endPosition: Vec2): void {
    const start = SVGPathDAttributeUtil.generateMoveTo(
      Math.round(startPosition.x),
      Math.round(startPosition.y),
    );
    const line = SVGPathDAttributeUtil.generateAbsoluteLine(
      Math.round(endPosition.x),
      Math.round(endPosition.y),
    );
    this.path = `${start} ${line}`;
  }

  // TODO: Specify the types.
  public appendBondGraph(rootElement) {
    this.bodyElement = rootElement
      .append('line')
      .attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', this.isHydrogenBond ? '2' : '0')
      .attr('class', 'selection-area')
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y)
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y)
      .attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none')
      .attr('data-testid', 'bond')
      .attr('data-bondtype', this.isHydrogenBond ? 'hydrogen' : 'covalent')
      .attr('data-bondid', this.polymerBond.id)
      .attr('data-frommonomerid', this.polymerBond.firstMonomer.id)
      .attr('data-tomonomerid', this.polymerBond.secondMonomer?.id);

    if (!this.isHydrogenBond && this.bodyElement) {
      this.bodyElement
        .attr(
          'data-fromconnectionpoint',
          this.polymerBond.firstMonomer.getAttachmentPointByBond(
            this.polymerBond,
          ) || '',
        )
        .attr(
          'data-toconnectionpoint',
          this.polymerBond.secondMonomer?.getAttachmentPointByBond(
            this.polymerBond,
          ) || '',
        );
    }

    return this.bodyElement;
  }

  // TODO: Specify the types.
  private appendRootElement() {
    return this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .on('mouseover', (event) => {
        this.editorEvents.mouseOverPolymerBond.dispatch(event);
        this.editorEvents.mouseOverDrawingEntity.dispatch(event);
      })
      .on('mousemove', (event) => {
        this.editorEvents.mouseOnMovePolymerBond.dispatch(event);
      })
      .on('mouseout', (event) => {
        this.editorEvents.mouseLeavePolymerBond.dispatch(event);
        this.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
      })
      .attr(
        'pointer-events',
        this.polymerBond.finished ? 'stroke' : 'none',
      ) as never as D3SvgElementSelection<SVGGElement, void>;
  }

  public show(_theme?: unknown, force = false): void {
    if (force) {
      this.sideConnectionBondTurnPoint = undefined;
    }
    this.rootElement = this.rootElement || this.appendRootElement();
    this.appendBond(this.rootElement);
    this.appendHoverAreaElement();
    this.drawSelection();
  }

  private get isSideConnectionBondDrawn() {
    return (
      (this.polymerBond.isSideChainConnection ||
        this.isSideChainLikeBackbone) &&
      this.path
    );
  }

  public drawSelection(): void {
    if (this.polymerBond.selected) {
      this.selectionElement?.remove();
      if (
        (this.isSnakeBond && !this.polymerBond.isHorizontal) ||
        this.isSideConnectionBondDrawn
      ) {
        this.selectionElement = this.rootElement
          ?.insert('path', ':first-child')
          .attr('stroke', '#57FF8F')
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0)
          .attr('d', this.path)
          .attr('class', 'dynamic-element');
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

  public moveEnd(): void {
    if (
      this.isSnakeBond &&
      !this.polymerBond.isHorizontal &&
      this.polymerBond.finished
    ) {
      this.moveSnakeBondEnd();
    } else {
      this.moveGraphBondEnd();
    }
  }

  private moveSnakeBondEnd(): void {
    const startPosition = this.scaledPosition.startPosition;
    const endPosition = this.scaledPosition.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('d', this.path);

    this.hoverAreaElement.attr('d', this.path);
    this.selectionElement?.attr('d', this.path);
  }

  private moveGraphBondEnd(): void {
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

  public moveStart(): void {
    if (this.isSnakeBond && !this.polymerBond.isHorizontal) {
      this.moveSnakeBondStart();
    } else {
      this.moveGraphBondStart();
    }
  }

  private moveSnakeBondStart(): void {
    const startPosition = this.scaledPosition.startPosition;
    const endPosition = this.scaledPosition.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('d', this.path);

    this.hoverAreaElement.attr('d', this.path);
    this.selectionElement?.attr('d', this.path);
  }

  private moveGraphBondStart(): void {
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

  protected appendHoverAreaElement(): void {
    if (
      (this.isSnakeBond && !this.polymerBond.isHorizontal) ||
      this.isSideConnectionBondDrawn
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
        .attr('pointer-events', 'none')
        .attr('stroke-width', '10')
        .attr('cx', this.scaledPosition.endPosition.x)
        .attr('cy', this.scaledPosition.endPosition.y);
    }
  }

  public appendHover(): void {
    assert(this.bodyElement);

    const editor = CoreEditor.provideEditorInstance();

    if (this.polymerBond.isSideChainConnection) {
      const allSideConnectionBondsBodyElements = editor.canvas.querySelectorAll(
        `.${SIDE_CONNECTION_BODY_ELEMENT_CLASS}`,
      );

      Array.from(allSideConnectionBondsBodyElements).forEach(
        (bondBodyElement) => {
          bondBodyElement.setAttribute(
            'stroke',
            this.isHydrogenBond ? 'lightgrey' : '#C0E2E6',
          );
        },
      );
    }

    this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');

    if (this.polymerBond.selected && this.selectionElement) {
      this.selectionElement.attr('stroke', '#CCFFDD');
    }
  }

  // TODO: Specify the types.
  public removeHover() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);

    const editor = CoreEditor.provideEditorInstance();

    if (this.polymerBond.isSideChainConnection) {
      const allSideConnectionBondsBodyElements = editor.canvas.querySelectorAll(
        `.${SIDE_CONNECTION_BODY_ELEMENT_CLASS}`,
      );

      Array.from(allSideConnectionBondsBodyElements).forEach(
        (bondBodyElement) => {
          const renderer =
            bondBodyElement.__data__ as SnakeModePolymerBondRenderer;

          bondBodyElement.setAttribute(
            'stroke',
            renderer.polymerBond.isSideChainConnection && !this.isHydrogenBond
              ? '#43B5C0'
              : '#333333',
          );
        },
      );
    }

    this.bodyElement
      .attr(
        'stroke',
        this.polymerBond.isSideChainConnection && !this.isHydrogenBond
          ? '#43B5C0'
          : '#333333',
      )
      .attr('pointer-events', 'stroke');

    if (this.polymerBond.selected && this.selectionElement) {
      this.selectionElement.attr('stroke', '#57FF8F');
    }

    return this.hoverAreaElement.attr('stroke', 'transparent');
  }

  private calculateIsSnakeBond(): void {
    if (this.polymerBond.isSideChainConnection) {
      this.isSnakeBond = false;
      return;
    }

    if (
      getSugarFromRnaBase(this.polymerBond.firstMonomer) ||
      getSugarFromRnaBase(this.polymerBond.secondMonomer)
    ) {
      this.isSnakeBond = false;
      return;
    }

    this.isSnakeBond = true;
  }

  public remove(): void {
    super.remove();
    if (this.polymerBond.hovered) {
      this.editorEvents.mouseLeaveMonomer.dispatch();
    }
  }
}
