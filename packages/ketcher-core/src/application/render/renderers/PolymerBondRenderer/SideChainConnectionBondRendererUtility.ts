import type {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import { SVGPathDAttributeUtility } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtility';
import { SnakeLayoutCellWidth } from 'domain/constants';
import type { BaseMonomer } from 'domain/entities';
import type { Cell } from 'domain/entities/canvas-matrix/Cell';
import type {
  Connection,
  ConnectionDirectionInDegrees,
} from 'domain/entities/canvas-matrix/Connection';

interface CalculatePathPartAndTurnPointParameter {
  readonly cell: Cell;
  readonly connection: Connection;
  readonly direction: ConnectionDirectionInDegrees;
  readonly horizontal: boolean;
  readonly turnPoint: number;
  readonly turnPointIsUsed: boolean;
}

interface CalculatePathPartAndTurnPointResult {
  readonly pathPart: string;
  readonly turnPoint: number;
}

export class SideChainConnectionBondRendererUtility {
  public static readonly bondEndLength = 15;
  public static readonly cellHeight = 40;
  public static readonly smoothCornerSize = 5;

  public static calculatePathPartAndTurnPoint({
    cell,
    connection,
    direction,
    horizontal,
    turnPoint,
    turnPointIsUsed,
  }: CalculatePathPartAndTurnPointParameter): CalculatePathPartAndTurnPointResult {
    const sin = Math.sin((direction * Math.PI) / 180);
    const cos = Math.cos((direction * Math.PI) / 180);
    const xOffset = (SnakeLayoutCellWidth / 2) * cos;
    const yOffset = (this.cellHeight / 2) * sin;
    const maxXOffset = cell.connections.reduce(
      (max: number, connection: Connection): number => {
        return max > connection.xOffset ? max : connection.xOffset;
      },
      0,
    );
    const maxYOffset = cell.connections.reduce(
      (max: number, connection: Connection): number => {
        const connectionYOffset = connection.yOffset ?? 0;
        return max > connectionYOffset ? max : connectionYOffset;
      },
      0,
    );

    let endOfPathPart: number;
    if (horizontal && turnPointIsUsed) {
      endOfPathPart = turnPoint;
    } else {
      const { monomerSize, scaledMonomerPosition } = (
        cell.monomer as BaseMonomer
      ).renderer as BaseMonomerRenderer | BaseSequenceItemRenderer;
      endOfPathPart = horizontal
        ? scaledMonomerPosition.x + monomerSize.width / 2 + xOffset
        : scaledMonomerPosition.y + monomerSize.height / 2 + yOffset;
    }

    const turnPointInternal = endOfPathPart;

    if (horizontal) {
      endOfPathPart +=
        -(connection.yOffset ?? 0) * 3 +
        cos * -connection.xOffset * 3 +
        cos * (maxXOffset + 1) * 3 +
        (maxYOffset + 1) * 3;
    }
    let pathPart = '';
    if (horizontal) {
      const absoluteLineX = endOfPathPart - this.smoothCornerSize * cos;
      pathPart +=
        SVGPathDAttributeUtility.generateHorizontalAbsoluteLine(absoluteLineX) +
        ' ';
    } else {
      const absoluteLineY = endOfPathPart - this.smoothCornerSize * cos;
      pathPart +=
        SVGPathDAttributeUtility.generateVerticalAbsoluteLine(absoluteLineY) +
        ' ';
    }
    pathPart += this.generateBend(cos, sin, cos, 1) + ' ';

    return {
      pathPart,
      turnPoint: turnPointInternal,
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
    return SVGPathDAttributeUtility.generateQuadraticRelativeCurve(
      size * dx1,
      size * dy1,
      size * dx,
      size * dy,
    );
  }
}
