import type {
  BaseMonomerRenderer,
  BaseSequenceItemRenderer,
} from 'application/render';
import { SVGPathDAttributeUtility } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtility';
import { SnakeLayoutCellWidth } from 'domain/constants';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { Vec2 } from 'domain/entities/vec2';
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
  public static readonly laneSpacing = 3;

  // Gives every row span a lane so that spans sharing rows never share a lane
  // (requirement #3532: vertical side connections should not overlap). Shorter
  // spans are placed first, so a span nested in another gets the inner lane and
  // their lines do not cross.
  public static assignLanes(
    spans: ReadonlyArray<{ readonly start: number; readonly end: number }>,
  ): number[] {
    const lanes: number[] = new Array(spans.length).fill(0);
    const placed: number[] = [];
    const getLength = (index: number) => spans[index].end - spans[index].start;
    const order = spans
      .map((_, index) => index)
      .sort(
        (first, second) =>
          getLength(first) - getLength(second) ||
          spans[first].start - spans[second].start,
      );

    order.forEach((index) => {
      const span = spans[index];
      const takenLanes = new Set(
        placed
          .filter(
            (placedIndex) =>
              spans[placedIndex].start <= span.end &&
              span.start <= spans[placedIndex].end,
          )
          .map((placedIndex) => lanes[placedIndex]),
      );
      let lane = 0;

      while (takenLanes.has(lane)) {
        lane++;
      }

      lanes[index] = lane;
      placed.push(index);
    });

    return lanes;
  }

  public static calculatePathPartAndTurnPoint({
    cell,
    connection,
    direction,
    horizontal: isHorizontal,
    turnPoint,
    turnPointIsUsed: isTurnPointUsed,
  }: CalculatePathPartAndTurnPointParameter): CalculatePathPartAndTurnPointResult {
    const sin = Math.sin((direction * Math.PI) / 180);
    const cos = Math.cos((direction * Math.PI) / 180);
    const xOffset = (SnakeLayoutCellWidth / 2) * cos;
    const yOffset = (this.cellHeight / 2) * sin;
    const maxXOffset = cell.connections.reduce(
      (max: number, connection: Connection): number => {
        return Math.max(max, connection.xOffset);
      },
      0,
    );
    const maxYOffset = cell.connections.reduce(
      (max: number, connection: Connection): number => {
        const connectionYOffset = connection.yOffset || 0;
        return Math.max(max, connectionYOffset);
      },
      0,
    );

    let endOfPathPart: number;
    if (isHorizontal && isTurnPointUsed) {
      endOfPathPart = turnPoint;
    } else {
      const { monomerSize, scaledMonomerPosition } = (
        cell.monomer as BaseMonomer
      ).renderer as BaseMonomerRenderer | BaseSequenceItemRenderer;
      endOfPathPart = isHorizontal
        ? scaledMonomerPosition.x + monomerSize.width / 2 + xOffset
        : scaledMonomerPosition.y + monomerSize.height / 2 + yOffset;
    }

    const turnPointInternal = endOfPathPart;

    if (isHorizontal) {
      endOfPathPart +=
        -(connection.yOffset || 0) * 3 +
        cos * -connection.xOffset * 3 +
        cos * (maxXOffset + 1) * 3 +
        (maxYOffset + 1) * 3;
    }
    let pathPart = '';
    if (isHorizontal) {
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

  // The connection runs to the left of both monomers: out of the left side of
  // the first one, vertically outside the cell column (and so outside the
  // backbone bonds wrapping chains to their next row), into the left side of
  // the second one.
  public static generateLeftSideConnectionPath(
    startPosition: Vec2,
    endPosition: Vec2,
    lane = 0,
  ): string {
    const verticalLineX =
      Math.min(startPosition.x, endPosition.x) -
      SnakeLayoutCellWidth / 2 -
      this.bondEndLength -
      lane * this.laneSpacing;
    const yDirection = endPosition.y < startPosition.y ? -1 : 1;

    return [
      SVGPathDAttributeUtility.generateMoveTo(startPosition.x, startPosition.y),
      SVGPathDAttributeUtility.generateHorizontalAbsoluteLine(
        verticalLineX + this.smoothCornerSize,
      ),
      this.generateBend(-1, 0, -1, yDirection),
      SVGPathDAttributeUtility.generateVerticalAbsoluteLine(
        endPosition.y - this.smoothCornerSize * yDirection,
      ),
      this.generateBend(0, yDirection, 1, yDirection),
      SVGPathDAttributeUtility.generateAbsoluteLine(
        endPosition.x,
        endPosition.y,
      ),
    ].join(' ');
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
