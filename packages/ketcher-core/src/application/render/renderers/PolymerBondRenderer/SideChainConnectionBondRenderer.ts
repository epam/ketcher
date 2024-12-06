import { BaseMonomerRenderer } from 'application/render';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer, PolymerBond, Vec2 } from 'domain/entities';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import {
  Connection,
  ConnectionDirectionInDegrees,
  ConnectionDirectionOfLastCell,
} from 'domain/entities/canvas-matrix/Connection';
import { SNAKE_LAYOUT_CELL_WIDTH } from 'domain/entities/DrawingEntitiesManager';

type RendererBodyElement<ThisType> = D3SvgElementSelection<
  SVGPathElement,
  ThisType
>;
type RendererRootElement<ThisType> = D3SvgElementSelection<
  SVGGElement,
  ThisType
>;

type AppendPathToElementFunction<ThisType> = (
  element: RendererRootElement<ThisType>,
  cssClassForPath: string,
) => RendererBodyElement<ThisType>;

interface AppendSideConnectionBondParameter {
  readonly cells: readonly Cell[];
  readonly polymerBond: PolymerBond;
  readonly scaledPosition: {
    readonly endPosition: Vec2;
    readonly startPosition: Vec2;
  };
  readonly sideConnectionBondTurnPoint?: number;
}

interface AppendSideConnectionBondResult<ThisType> {
  readonly appendPathToElement: AppendPathToElementFunction<ThisType>;
  readonly pathDAttributeValue: string;
  readonly sideConnectionBondTurnPointUpdated: number;
}

interface CalculateEndOfPathPartParameter {
  readonly horizontal: boolean;
  readonly monomerSize: BaseMonomerRenderer['monomerSize'];
  readonly scaledMonomerPosition: Vec2;
  readonly sideConnectionBondTurnPoint: number;
  readonly xOffset: number;
  readonly yOffset: number;
}

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

const BOND_END_LENGTH = 15;
const CELL_HEIGHT = 40;
const SMOOTH_CORNER_SIZE = 5;

// TODO: Can be:
//  - a class with static methods.
//  - a set of functions.
export class SideChainConnectionBondRenderer {
  public appendSideConnectionBond<ThisType>({
    cells,
    polymerBond,
    scaledPosition,
    sideConnectionBondTurnPoint,
  }: AppendSideConnectionBondParameter): AppendSideConnectionBondResult<ThisType> {
    let sideConnectionBondTurnPointUpdated = sideConnectionBondTurnPoint ?? 0;

    const firstCell = cells[0];
    const firstCellConnection = firstCell.connections.find((connection) => {
      return connection.polymerBond === polymerBond;
    }) as Connection;
    const isVerticalConnection = firstCellConnection.isVertical;
    const isStraightVerticalConnection =
      cells.length === 2 && isVerticalConnection;
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
    let pathDAttributeValue = `M ${startPosition.x},${startPosition.y} `;

    const cos = Math.cos((xDirection * Math.PI) / 180);

    let previousConnection: Connection;
    let previousCell: Cell;

    const horizontalPartIntersectionsOffset = firstCellConnection.xOffset;

    const areCellsOnSameRow = cells.every((cell) => {
      return cell.y === firstCell.y;
    });
    const isSecondCellEmpty = cells[1].node === null;

    if (areCellsOnSameRow) {
      pathDAttributeValue += `L ${startPosition.x},${
        startPosition.y -
        BOND_END_LENGTH -
        horizontalPartIntersectionsOffset * 3
      } `;
      pathDAttributeValue += generateBend(0, -1, cos, -1);
    } else {
      pathDAttributeValue += `L ${startPosition.x},${
        startPosition.y +
        BOND_END_LENGTH +
        horizontalPartIntersectionsOffset * 3
      } `;
      if (
        !isStraightVerticalConnection &&
        !isSecondCellEmpty &&
        !isTwoNeighborRowsConnection
      ) {
        pathDAttributeValue += generateBend(0, 1, cos, 1);
      }
    }

    if (isVerticalConnection && !isStraightVerticalConnection) {
      const direction =
        sideConnectionBondTurnPoint &&
        startPosition.x < sideConnectionBondTurnPoint
          ? 0
          : 180;
      const result = this.drawPartOfSideConnection({
        cell: firstCell,
        connection: firstCellConnection,
        direction,
        horizontal: true,
        sideConnectionBondTurnPoint: sideConnectionBondTurnPoint ?? 0,
      });
      pathDAttributeValue += result.pathPart;
      sideConnectionBondTurnPoint = result.sideConnectionBondTurnPoint;
      sideConnectionBondTurnPointUpdated = result.sideConnectionBondTurnPoint;
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
          pathDAttributeValue += `V ${
            endPosition.y -
            CELL_HEIGHT / 2 -
            SMOOTH_CORNER_SIZE -
            sin * (cellConnection.yOffset || 0) * 3 -
            (isTwoNeighborRowsConnection
              ? maxHorizontalOffset - cellConnection.xOffset
              : cellConnection.xOffset) *
              3
          } `;
          pathDAttributeValue += generateBend(0, sin, cos, 1);
        }
        pathDAttributeValue += `H ${endPosition.x - SMOOTH_CORNER_SIZE * cos} `;
        pathDAttributeValue += generateBend(cos, 0, cos, 1);
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
        // TODO?: Check. I am not sure about `as DirectionInDegrees`.
        const horizontal = new Set([0, 180]).has(
          previousConnection.direction as ConnectionDirectionInDegrees,
        );
        const direction = horizontal
          ? xDirection
          : // TODO?: Check. I am not sure about `as DirectionInDegrees`.
            (previousConnection.direction as ConnectionDirectionInDegrees);
        const result = this.drawPartOfSideConnection({
          cell: previousCell,
          connection: previousConnection,
          direction,
          horizontal,
          sideConnectionBondTurnPoint: sideConnectionBondTurnPoint ?? 0,
        });
        pathDAttributeValue += result.pathPart;
        sideConnectionBondTurnPoint = result.sideConnectionBondTurnPoint;
        sideConnectionBondTurnPointUpdated = result.sideConnectionBondTurnPoint;
      }
      previousCell = cell;
      previousConnection = cellConnection;
    });

    pathDAttributeValue += `L ${endPosition.x},${endPosition.y} `;

    const appendPathToElement: AppendPathToElementFunction<ThisType> = <
      ThisType,
    >(
      element: RendererRootElement<ThisType>,
      cssClassForPath: string,
    ): RendererBodyElement<ThisType> => {
      const pathElement: RendererBodyElement<ThisType> = element.append('path');
      return pathElement
        .attr('class', cssClassForPath)
        .attr('d', pathDAttributeValue)
        .attr('pointer-events', 'stroke')
        .attr('stroke', '#43b5c0')
        .attr('stroke-dasharray', '0')
        .attr('stroke-width', 1)
        .attr('fill', 'none');
    };

    return {
      appendPathToElement,
      pathDAttributeValue,
      sideConnectionBondTurnPointUpdated,
    };
  }

  private calculateEndOfPathPart({
    horizontal,
    monomerSize,
    scaledMonomerPosition,
    sideConnectionBondTurnPoint,
    xOffset,
    yOffset,
  }: CalculateEndOfPathPartParameter): number {
    if (horizontal && sideConnectionBondTurnPoint) {
      return sideConnectionBondTurnPoint;
    }
    return horizontal
      ? scaledMonomerPosition.x + monomerSize.width / 2 + xOffset
      : scaledMonomerPosition.y + monomerSize.height / 2 + yOffset;
  }

  private drawPartOfSideConnection({
    cell,
    connection,
    direction,
    horizontal,
    sideConnectionBondTurnPoint,
  }: DrawPartOfSideConnectionParameter): DrawPartOfSideConnectionResult {
    const sin = Math.sin((direction * Math.PI) / 180);
    const cos = Math.cos((direction * Math.PI) / 180);
    const xOffset = (SNAKE_LAYOUT_CELL_WIDTH / 2) * cos;
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

    const { monomerSize, scaledMonomerPosition } = (cell.monomer as BaseMonomer)
      .renderer as BaseMonomerRenderer;
    let endOfPathPart = this.calculateEndOfPathPart({
      horizontal,
      monomerSize,
      scaledMonomerPosition,
      sideConnectionBondTurnPoint,
      xOffset,
      yOffset,
    });

    const sideConnectionBondTurnPointInternal = endOfPathPart;

    if (horizontal) {
      endOfPathPart +=
        -(connection.yOffset || 0) * 3 +
        cos * -connection.xOffset * 3 +
        cos * (maxXOffset + 1) * 3 +
        (maxYOffset + 1) * 3;
    }
    let pathPart = horizontal ? 'H ' : 'V ';
    pathPart += `${endOfPathPart - SMOOTH_CORNER_SIZE * cos} `;
    pathPart += generateBend(cos, sin, cos, 1);

    return {
      pathPart,
      sideConnectionBondTurnPoint: sideConnectionBondTurnPointInternal,
    };
  }
}

function generateBend(
  dx1: number,
  dy1: number,
  dx: number,
  dy: number,
): string {
  const controlPoint = `${SMOOTH_CORNER_SIZE * dx1},${
    SMOOTH_CORNER_SIZE * dy1
  }`;
  const endPoint = `${SMOOTH_CORNER_SIZE * dx},${SMOOTH_CORNER_SIZE * dy}`;
  return `q ${controlPoint} ${endPoint} `;
}
