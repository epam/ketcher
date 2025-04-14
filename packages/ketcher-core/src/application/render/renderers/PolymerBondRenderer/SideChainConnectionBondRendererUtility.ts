import {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import { SVGPathDAttributeUtil } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtil';
import { BaseMonomer } from 'domain/entities';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import {
  Connection,
  ConnectionDirectionInDegrees,
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

const CELL_HEIGHT = 40;

export class SideChainConnectionBondRendererUtility {
  public static readonly smoothCornerSize = 5;

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
    let pathPart = '';
    if (horizontal) {
      const absoluteLineX = endOfPathPart - this.smoothCornerSize * cos;
      pathPart +=
        SVGPathDAttributeUtil.generateHorizontalAbsoluteLine(absoluteLineX) +
        ' ';
    } else {
      const absoluteLineY = endOfPathPart - this.smoothCornerSize * cos;
      pathPart +=
        SVGPathDAttributeUtil.generateVerticalAbsoluteLine(absoluteLineY) + ' ';
    }
    pathPart += this.generateBend(cos, sin, cos, 1) + ' ';

    return {
      pathPart,
      sideConnectionBondTurnPoint: sideConnectionBondTurnPointInternal,
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
    return SVGPathDAttributeUtil.generateQuadraticRelativeCurve(
      size * dx1,
      size * dy1,
      size * dx,
      size * dy,
    );
  }
}
