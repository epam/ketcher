import {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import {
  generateBend,
  SMOOTH_CORNER_SIZE,
} from 'application/render/renderers/PolymerBondRenderer/helpers';
import { BaseMonomer } from 'domain/entities';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import {
  Connection,
  ConnectionDirectionInDegrees,
  ConnectionDirectionXInDegrees,
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
  readonly xDirection: ConnectionDirectionXInDegrees;
}

interface DrawPartOfSideConnectionForOtherCellsResult {
  readonly pathPart: string;
  readonly sideConnectionBondTurnPoint: number;
}

const CELL_HEIGHT = 40;

export class SideChainConnectionBondRenderer {
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
    pathPart += `${endOfPathPart - SMOOTH_CORNER_SIZE * cos} `;
    pathPart += generateBend(cos, sin, cos, 1);

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
}
