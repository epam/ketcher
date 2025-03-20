import {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import { PolymerBondRendererStartAndEndPositions } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRenderer.types';
import { SVGPathDAttributeUtil } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtil';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import {
  Connection,
  ConnectionDirectionInDegrees,
  ConnectionDirectionOfLastCell,
  ConnectionXDirectionInDegrees,
} from 'domain/entities/canvas-matrix/Connection';
import { CELL_WIDTH } from 'domain/entities/DrawingEntitiesManager';

interface DrawPartOfSideConnectionParameter {
  readonly cell: Cell;
  readonly connection: Connection;
  readonly direction: ConnectionDirectionInDegrees;
  readonly horizontal: boolean;
  readonly sideConnectionBondTurnPoint: number;
}

interface DrawPartOfSideConnectionResult {
  readonly pathPart: string;
  readonly sideConnectionBondTurnPoint: number;
}

interface DrawPartOfSideConnectionForOtherCellsParameter {
  readonly cell: Cell;
  readonly connection: Connection;
  readonly sideConnectionBondTurnPoint: number;
  readonly xDirection: ConnectionXDirectionInDegrees;
}

interface DrawPartOfSideConnectionForOtherCellsResult {
  readonly pathPart: string;
  readonly sideConnectionBondTurnPoint: number;
}

interface ExtractStartAndEndPositionsFromScaledPositionParameter {
  readonly firstCellMonomers: readonly BaseMonomer[];
  readonly firstMonomer: BaseMonomer;
  readonly scaledPosition: PolymerBondRendererStartAndEndPositions;
}

interface GeneratePathPartForCellsWhichAreOnSameRowParameter {
  readonly cellConnection: Connection;
  readonly connectionOfTwoNeighborRows: boolean;
  readonly cos: -1 | 1;
  readonly endPositionY: Vec2['y'];
  readonly firstCellConnectionIsVertical: boolean;
  readonly maxHorizontalOffset: number;
}

interface GeneratePathPartForLastCellIfConnectionIsNotStraightVerticalParameter {
  readonly cellConnection: Connection;
  readonly cellsAreOnSameRow: boolean;
  readonly connectionOfTwoNeighborRows: boolean;
  readonly endPosition: Vec2;
  readonly firstCellConnectionIsVertical: boolean;
  readonly maxHorizontalOffset: number;
  readonly sideConnectionBondTurnPoint: number;
  readonly xDirection: ConnectionXDirectionInDegrees;
}

const CELL_HEIGHT = 40;

export class SideChainConnectionBondRenderer {
  public static readonly smoothCornerSize = 5;

  public static calculateCosForXDirection(
    xDirection: ConnectionXDirectionInDegrees,
  ): -1 | 1 {
    return Math.cos((xDirection * Math.PI) / 180) as -1 | 1;
  }

  public static checkIfConnectionIsStraightVertical(
    cells: readonly Cell[],
    firstCellConnectionIsVertical: boolean,
  ): boolean {
    if (!firstCellConnectionIsVertical) return false;
    if (cells.length === 2) return true;
    const [firstCell] = cells;
    // TODO: Is it possible to finish the cycle not in the end?
    return cells.reduce(
      (isStraight: boolean, cell: Cell, index: number): boolean => {
        if (!isStraight || new Set([0, cells.length - 1]).has(index)) {
          return isStraight;
        }
        return cell.x === firstCell.x && !cell.monomer;
      },
      true,
    );
  }

  public static drawPartOfSideConnection({
    cell,
    connection,
    direction,
    horizontal,
    sideConnectionBondTurnPoint,
  }: DrawPartOfSideConnectionParameter): DrawPartOfSideConnectionResult {
    const sin = Math.sin((direction * Math.PI) / 180);
    const cos = Math.cos((direction * Math.PI) / 180);
    const xOffset = (CELL_WIDTH / 2) * cos;
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
    let pathPart = horizontal ? 'H ' : 'V ';
    pathPart += `${endOfPathPart - this.smoothCornerSize * cos} `;
    pathPart += this.generateBend(cos, sin, cos, 1) + ' ';

    return {
      pathPart,
      sideConnectionBondTurnPoint: sideConnectionBondTurnPointInternal,
    };
  }

  // TODO: Specify the types.
  public static drawPartOfSideConnectionForOtherCells({
    cell,
    connection,
    sideConnectionBondTurnPoint,
    xDirection,
  }: DrawPartOfSideConnectionForOtherCellsParameter): DrawPartOfSideConnectionForOtherCellsResult {
    // TODO?: Check. I am not sure about `as ConnectionDirectionInDegrees`.
    const horizontal = new Set([0, 180]).has(
      connection.direction as ConnectionDirectionInDegrees,
    );
    const direction = horizontal
      ? xDirection
      : // TODO?: Check. I am not sure about `as ConnectionDirectionInDegrees`.
        (connection.direction as ConnectionDirectionInDegrees);
    return this.drawPartOfSideConnection({
      cell,
      connection,
      direction,
      horizontal,
      sideConnectionBondTurnPoint,
    });
  }

  public static extractStartAndEndPositionsFromScaledPosition({
    firstCellMonomers,
    firstMonomer,
    scaledPosition,
  }: ExtractStartAndEndPositionsFromScaledPositionParameter): PolymerBondRendererStartAndEndPositions {
    const isFirstMonomerOfBondInFirstCell =
      firstCellMonomers.includes(firstMonomer);
    const endPosition = isFirstMonomerOfBondInFirstCell
      ? scaledPosition.endPosition
      : scaledPosition.startPosition;
    const startPosition = isFirstMonomerOfBondInFirstCell
      ? scaledPosition.startPosition
      : scaledPosition.endPosition;
    return {
      endPosition,
      startPosition,
    };
  }

  // TODO: Can we use `-1 | 0 | 1` instead of `number`?
  public static generateBend(
    dx1: number,
    dy1: number,
    dx: number,
    dy: -1 | 1,
  ): string {
    const size = this.smoothCornerSize;
    const controlPoint = `${size * dx1},${size * dy1}`;
    const endPoint = `${size * dx},${size * dy}`;
    return `q ${controlPoint} ${endPoint}`;
  }

  public static generatePathPartForLastCellIfConnectionIsNotStraightVertical({
    cellConnection,
    cellsAreOnSameRow,
    connectionOfTwoNeighborRows,
    endPosition,
    firstCellConnectionIsVertical,
    maxHorizontalOffset,
    sideConnectionBondTurnPoint,
    xDirection,
  }: GeneratePathPartForLastCellIfConnectionIsNotStraightVerticalParameter): string {
    const _xDirection: ConnectionXDirectionInDegrees =
      sideConnectionBondTurnPoint
        ? endPosition.x < sideConnectionBondTurnPoint
          ? 180
          : 0
        : xDirection;
    const cos = this.calculateCosForXDirection(_xDirection);

    let pathPart = '';
    if (!cellsAreOnSameRow) {
      pathPart +=
        this.#generatePathPartForCellsWhichAreOnSameRow({
          cellConnection,
          connectionOfTwoNeighborRows,
          cos,
          endPositionY: endPosition.y,
          firstCellConnectionIsVertical,
          maxHorizontalOffset,
        }) + ' ';
    }
    const horizontalLineX = endPosition.x - this.smoothCornerSize * cos;
    pathPart +=
      SVGPathDAttributeUtil.generateHorizontalAbsoluteLine(horizontalLineX) +
      ' ';
    pathPart += this.generateBend(cos, 0, cos, 1);
    return pathPart;
  }

  static #calculateSinForYDirection(
    // TODO: Can we use `yDirection: 90 | 270`?
    yDirection: number,
  ): number {
    return Math.sin((yDirection * Math.PI) / 180);
  }

  static #generatePathPartForCellsWhichAreOnSameRow({
    cellConnection: { direction, xOffset, yOffset },
    connectionOfTwoNeighborRows,
    cos,
    endPositionY,
    firstCellConnectionIsVertical,
    maxHorizontalOffset,
  }: GeneratePathPartForCellsWhichAreOnSameRowParameter): string {
    const yDirection = firstCellConnectionIsVertical
      ? 90
      : (direction as ConnectionDirectionOfLastCell).y;
    const sin = this.#calculateSinForYDirection(yDirection);
    const verticalLineY =
      endPositionY -
      CELL_HEIGHT / 2 -
      this.smoothCornerSize -
      sin * (yOffset || 0) * 3 -
      (connectionOfTwoNeighborRows ? maxHorizontalOffset - xOffset : xOffset) *
        3;
    const line =
      SVGPathDAttributeUtil.generateVerticalAbsoluteLine(verticalLineY);
    const bend = this.generateBend(0, sin, cos, 1);
    return `${line} ${bend}`;
  }
}
