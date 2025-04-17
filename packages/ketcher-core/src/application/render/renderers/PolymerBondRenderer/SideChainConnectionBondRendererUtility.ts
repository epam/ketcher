import type {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import type { PolymerBondRendererStartAndEndPositions } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRenderer.types';
import { SVGPathDAttributeUtil as SVGPathDAttributeUtility } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtil';
import type { BaseMonomer, PolymerBond } from 'domain/entities';
import type { Cell } from 'domain/entities/canvas-matrix/Cell';
import type {
  Connection,
  ConnectionDirectionInDegrees,
  ConnectionDirectionOfLastCell,
} from 'domain/entities/canvas-matrix/Connection';
import { CELL_WIDTH } from 'domain/entities/DrawingEntitiesManager';

interface CalculateBondSettingsParameter {
  readonly cells: readonly Cell[];
  readonly polymerBond: PolymerBond;
  readonly scaledPosition: PolymerBondRendererStartAndEndPositions;
  readonly sideConnectionBondTurnPoint: number;
  readonly sideConnectionBondTurnPointUpdateCallback: (value: number) => void;
}

interface CalculateBondSettingsResult {
  readonly pathDAttributeValue: string;
}

interface CalculatePartOfBondSettingsParameter {
  readonly cell: Cell;
  readonly connection: Connection;
  readonly direction: ConnectionDirectionInDegrees;
  readonly horizontal: boolean;
  readonly sideConnectionBondTurnPoint: number;
}

interface CalculatePartOfBondSettingsResult {
  readonly pathPart: string;
  readonly sideConnectionBondTurnPoint: number;
}

export class SideChainConnectionBondRendererUtility {
  static readonly #bondEndLength = 15;
  static readonly #cellHeight = 40;
  static readonly #cellWidth = CELL_WIDTH;
  static readonly #smoothCornerSize = 5;

  public static calculateBondSettings({
    cells,
    polymerBond,
    scaledPosition,
    sideConnectionBondTurnPoint,
    sideConnectionBondTurnPointUpdateCallback,
  }: CalculateBondSettingsParameter): CalculateBondSettingsResult {
    const firstCell = cells[0];
    const firstCellConnection = firstCell.connections.find(
      (connection: Connection): boolean => {
        return connection.polymerBond === polymerBond;
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
      polymerBond.firstMonomer,
    );
    const isTwoNeighborRowsConnection = cells.every(
      (cell) => cell.y === firstCell.y || cell.y === firstCell.y + 1,
    );
    const startPosition = isFirstMonomerOfBondInFirstCell
      ? scaledPosition.startPosition
      : scaledPosition.endPosition;
    const endPosition = isFirstMonomerOfBondInFirstCell
      ? scaledPosition.endPosition
      : scaledPosition.startPosition;
    const xDirection =
      startPosition.x >= (sideConnectionBondTurnPoint || endPosition.x)
        ? 180
        : 0;
    let pathDAttributeValue =
      SVGPathDAttributeUtility.generateMoveTo(
        startPosition.x,
        startPosition.y,
      ) + ' ';

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
          this.#bondEndLength -
          horizontalPartIntersectionsOffset * 3;
        pathDAttributeValue +=
          SVGPathDAttributeUtility.generateAbsoluteLine(
            startPosition.x,
            absoluteLineY,
          ) + ' ';
      }
      pathDAttributeValue += this.#generateBend(0, -1, cos, -1) + ' ';
    } else {
      {
        const absoluteLineY =
          startPosition.y +
          this.#bondEndLength +
          horizontalPartIntersectionsOffset * 3;
        pathDAttributeValue +=
          SVGPathDAttributeUtility.generateAbsoluteLine(
            startPosition.x,
            absoluteLineY,
          ) + ' ';
      }
      if (
        !isStraightVerticalConnection &&
        !isSecondCellEmpty &&
        !isTwoNeighborRowsConnection
      ) {
        pathDAttributeValue += this.#generateBend(0, 1, cos, 1) + ' ';
      }
    }

    if (isVerticalConnection && !isStraightVerticalConnection) {
      const direction =
        sideConnectionBondTurnPoint &&
        startPosition.x < sideConnectionBondTurnPoint
          ? 0
          : 180;
      const result = this.#calculatePartOfBondSettings({
        cell: firstCell,
        connection: firstCellConnection,
        direction,
        horizontal: true,
        sideConnectionBondTurnPoint: sideConnectionBondTurnPoint ?? 0,
      });
      pathDAttributeValue += result.pathPart;
      sideConnectionBondTurnPointUpdateCallback(
        result.sideConnectionBondTurnPoint,
      );
    }

    let maxHorizontalOffset = 0;

    cells.forEach((cell: Cell, cellIndex: number): void => {
      const cellConnection = cell.connections.find(
        (connection: Connection): boolean => {
          return connection.polymerBond === polymerBond;
        },
      ) as Connection;
      const isLastCell = cellIndex === cells.length - 1;
      const _xDirection = sideConnectionBondTurnPoint
        ? endPosition.x < sideConnectionBondTurnPoint
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
              this.#cellHeight / 2 -
              this.#smoothCornerSize -
              sin * (cellConnection.yOffset || 0) * 3 -
              (isTwoNeighborRowsConnection
                ? maxHorizontalOffset - cellConnection.xOffset
                : cellConnection.xOffset) *
                3;
            pathDAttributeValue +=
              SVGPathDAttributeUtility.generateVerticalAbsoluteLine(
                absoluteLineY,
              ) + ' ';
          }
          pathDAttributeValue += this.#generateBend(0, sin, cos, 1) + ' ';
        }
        pathDAttributeValue += `H ${
          endPosition.x - this.#smoothCornerSize * cos
        } `;
        pathDAttributeValue += this.#generateBend(cos, 0, cos, 1) + ' ';
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
        const result = this.#calculatePartOfBondSettings({
          cell: previousCell,
          connection: previousConnection,
          direction,
          horizontal,
          sideConnectionBondTurnPoint: sideConnectionBondTurnPoint ?? 0,
        });
        pathDAttributeValue += result.pathPart;
        sideConnectionBondTurnPointUpdateCallback(
          result.sideConnectionBondTurnPoint,
        );
      }
      previousCell = cell;
      previousConnection = cellConnection;
    });

    pathDAttributeValue +=
      SVGPathDAttributeUtility.generateAbsoluteLine(
        endPosition.x,
        endPosition.y,
      ) + ' ';

    return {
      pathDAttributeValue,
    };
  }

  static #calculatePartOfBondSettings({
    cell,
    connection,
    direction,
    horizontal,
    sideConnectionBondTurnPoint,
  }: CalculatePartOfBondSettingsParameter): CalculatePartOfBondSettingsResult {
    const sin = Math.sin((direction * Math.PI) / 180);
    const cos = Math.cos((direction * Math.PI) / 180);
    const xOffset = (this.#cellWidth / 2) * cos;
    const yOffset = (this.#cellHeight / 2) * sin;
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
      const absoluteLineX = endOfPathPart - this.#smoothCornerSize * cos;
      pathPart +=
        SVGPathDAttributeUtility.generateHorizontalAbsoluteLine(absoluteLineX) +
        ' ';
    } else {
      const absoluteLineY = endOfPathPart - this.#smoothCornerSize * cos;
      pathPart +=
        SVGPathDAttributeUtility.generateVerticalAbsoluteLine(absoluteLineY) +
        ' ';
    }
    pathPart += this.#generateBend(cos, sin, cos, 1) + ' ';

    return {
      pathPart,
      sideConnectionBondTurnPoint: sideConnectionBondTurnPointInternal,
    };
  }

  // TODO: Can we use `-1 | 0 | 1` instead of `number`?
  static #generateBend(
    dx1: number,
    dy1: number,
    dx: number,
    dy: -1 | 1,
  ): string {
    const size = this.#smoothCornerSize;
    return SVGPathDAttributeUtility.generateQuadraticRelativeCurve(
      size * dx1,
      size * dy1,
      size * dx,
      size * dy,
    );
  }
}
