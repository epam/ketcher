import { SnakeMode } from 'application/editor/modes/SnakeMode';
import { editorEvents } from 'application/editor/editorEvents';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { Coordinates } from 'application/editor/shared/coordinates';
import type { PolymerBondRendererStartAndEndPositions } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRenderer.types';
import { SideChainConnectionBondRendererUtility } from 'application/render/renderers/PolymerBondRenderer/SideChainConnectionBondRendererUtility';
import { SVGPathDAttributeUtility } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtility';
import type { D3SvgElementSelection } from 'application/render/types';
import { assert } from 'utilities';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import type { Cell } from 'domain/entities/canvas-matrix/Cell';
import {
  type Connection,
  type ConnectionDirectionInDegrees,
  type ConnectionDirectionOfLastCell,
} from 'domain/entities/canvas-matrix/Connection';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import type { CanvasMatrix } from 'domain/entities/canvas-matrix/CanvasMatrix';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { isNumber } from 'lodash';
import { BaseRenderer } from '../BaseRenderer';
import {
  SELECTION_COLOR,
  SELECTION_HOVERED_COLOR,
} from 'application/render/renderers/constants';
import {
  CORNER_LENGTH,
  DOUBLE_CORNER_LENGTH,
  generateCornerFromBottomToRight,
  generateCornerFromLeftToBottom,
  generateCornerFromLeftToTop,
  generateCornerFromRightToBottom,
  generateCornerFromRightToTop,
  generateCornerFromTopToLeft,
  generateCornerFromTopToRight,
} from './helpers';
import { SnakeLayoutCellWidth } from 'domain/constants';

enum LineDirection {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

const LINE_FROM_MONOMER_LENGTH = 15;
const VERTICAL_LINE_LENGTH = 21;
const RNA_ANTISENSE_CHAIN_VERTICAL_LINE_LENGTH = 20;
const RNA_SENSE_CHAIN_VERTICAL_LINE_LENGTH = 210;
const OUTER_BACKBONE_LINE_MARGIN = LINE_FROM_MONOMER_LENGTH + CORNER_LENGTH;
const OUTER_CONNECTION_CLEARANCE = 12;
const OUTER_CONNECTION_LANE_SPACING = 8;

type OuterConnectionSide = -1 | 1;

const outerConnectionLanes = new WeakMap<CanvasMatrix, Map<number, number>>();

// TODO?: Can it be moved to `SideChainConnectionBondRendererUtility`?
const SIDE_CONNECTION_BODY_ELEMENT_CLASS = 'polymer-bond-body';

// TODO: Need to split the class by three:
//  - `SnakeModeBackboneBondRenderer` (black “snake” line)
//  - `SnakeModeSideChainBondRenderer` (blue “snake” line)
//  - `SnakeModeRNABaseAndSugarBondRenderer` (black straight line)
export class SnakeModePolymerBondRenderer extends BaseRenderer {
  private readonly editorEvents: typeof editorEvents;
  private isSnakeBond = false; // `SnakeModeBackboneBondRenderer` or `SnakeModeRNABaseAndSugarBondRenderer`.
  // TODO: Specify the types.
  private selectionElement;
  private path = '';
  private previousStateOfIsMonomersOnSameHorizontalLine = false;
  private sideConnectionBondTurnPoint?: number;
  private hoverLineAreaElement?: D3SvgElementSelection<SVGLineElement, void>;
  declare public bodyElement?: D3SvgElementSelection<SVGLineElement, this>;

  constructor(public readonly polymerBond: PolymerBond) {
    super(polymerBond);
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
    if (!rootNode) return undefined;

    return rootNode.getBBox();
  }

  public get width(): number {
    return this.rootBBox?.width ?? 0;
  }

  public get height(): number {
    return this.rootBBox?.height ?? 0;
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
    const editor = provideEditorInstance();
    const matrix = editor.drawingEntitiesManager.canvasMatrix;
    const cells = matrix?.polymerBondToCells.get(this.polymerBond);
    const startCellConnection = cells?.[0].connections?.find(
      (connection) => connection.polymerBond === this.polymerBond,
    );
    const outerSide =
      cells &&
      cells[0].y !== cells[cells.length - 1].y &&
      this.polymerBond.secondMonomer
        ? this.getOuterConnectionSide(
            this.polymerBond.firstMonomer,
            this.polymerBond.secondMonomer,
          )
        : undefined;

    if (outerSide !== undefined) {
      return outerSide === -1 ? 0 : Math.PI;
    }

    if (cells && this.getLeftDetourStartMonomer(cells) === monomer) {
      return 0;
    }

    const startCellDirection = startCellConnection?.direction;
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

    if (startCellDirection === 90 && endCellDirection === 90) {
      // Vertical bond. need to check is it right that angles 90 and 90
      return monomer === startCellMonomer ? -Math.PI / 2 : Math.PI / 2;
    }

    if (
      startCellNormalizedDirection === 0 &&
      endCellNormalizedDirection === 270
    ) {
      // Horizontal bond.
      return Math.PI / 2;
    }

    return endpointAngle;
  }

  public moveSelection(): void {
    if (
      this.previousStateOfIsMonomersOnSameHorizontalLine ===
      this.polymerBond.isHorizontal
    ) {
      assert(this.rootElement);
      this.moveStart();
      this.moveEnd();
    } else {
      this.remove();
      this.show();
    }
    this.previousStateOfIsMonomersOnSameHorizontalLine =
      this.polymerBond.isHorizontal;
  }

  // TODO: Specify the types.
  public appendBond(rootElement) {
    const editor = provideEditorInstance();
    const matrix = editor.drawingEntitiesManager.canvasMatrix;
    const cells = matrix?.polymerBondToCells.get(this.polymerBond);

    if (
      matrix &&
      cells &&
      (this.polymerBond.isSideChainConnection ||
        this.isSideChainLikeBackbone) &&
      (!this.isHydrogenBond || editor.mode instanceof SnakeMode)
    ) {
      this.appendSideConnectionBond(rootElement, cells, matrix);
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
        'data-fromattachmentpoint',
        this.polymerBond.firstMonomer.getAttachmentPointByBond(
          this.polymerBond,
        ),
      )
      .attr(
        'data-toattachmentpoint',
        this.polymerBond.secondMonomer?.getAttachmentPointByBond(
          this.polymerBond,
        ),
      );
    return this.bodyElement;
  }

  // TODO: Specify the types.
  private appendSideConnectionBond(
    rootElement,
    cells: Cell[],
    matrix: CanvasMatrix,
  ) {
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
    const startMonomer = isFirstMonomerOfBondInFirstCell
      ? this.polymerBond.firstMonomer
      : this.polymerBond.secondMonomer;
    const endMonomer = isFirstMonomerOfBondInFirstCell
      ? this.polymerBond.secondMonomer
      : this.polymerBond.firstMonomer;

    const outerSide =
      startMonomer && endMonomer && firstCell.y !== cells[cells.length - 1].y
        ? this.getOuterConnectionSide(startMonomer, endMonomer)
        : undefined;

    if (startMonomer && endMonomer && outerSide !== undefined) {
      const pathDAttributeValue = this.buildOuterConnectionPath(
        startMonomer,
        endMonomer,
        startPosition,
        endPosition,
        outerSide,
        this.getOuterConnectionLane(matrix),
      );

      return this.appendSideConnectionPath(rootElement, pathDAttributeValue);
    }

    const leftDetourStart = this.getLeftDetourStartMonomer(cells);
    const startAnchor = leftDetourStart
      ? this.getSideAnchor(leftDetourStart, startPosition, -1)
      : startPosition;
    const xDirection =
      startPosition.x >= (this.sideConnectionBondTurnPoint ?? endPosition.x)
        ? 180
        : 0;
    let pathDAttributeValue =
      SVGPathDAttributeUtility.generateMoveTo(startAnchor.x, startAnchor.y) +
      ' ';

    const cos = Math.cos((xDirection * Math.PI) / 180);

    let previousConnection: Connection;
    let previousCell: Cell;

    const horizontalPartIntersectionsOffset = firstCellConnection.xOffset;

    const isEveryCellOnSameRow = cells.every((cell) => {
      return cell.y === firstCell.y;
    });
    const isSecondCellEmpty = cells[1].node === null;

    if (isEveryCellOnSameRow) {
      {
        const absoluteLineY =
          startPosition.y -
          SideChainConnectionBondRendererUtility.bondEndLength -
          horizontalPartIntersectionsOffset * 3;
        pathDAttributeValue +=
          SVGPathDAttributeUtility.generateAbsoluteLine(
            startPosition.x,
            absoluteLineY,
          ) + ' ';
      }
      pathDAttributeValue +=
        SideChainConnectionBondRendererUtility.generateBend(0, -1, cos, -1) +
        ' ';
    } else if (!leftDetourStart) {
      {
        const absoluteLineY =
          startPosition.y +
          SideChainConnectionBondRendererUtility.bondEndLength +
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
        pathDAttributeValue +=
          SideChainConnectionBondRendererUtility.generateBend(0, 1, cos, 1) +
          ' ';
      }
    }

    if (isVerticalConnection && !isStraightVerticalConnection) {
      const direction =
        !leftDetourStart &&
        this.sideConnectionBondTurnPoint &&
        startPosition.x < this.sideConnectionBondTurnPoint
          ? 0
          : 180;
      const result =
        SideChainConnectionBondRendererUtility.calculatePathPartAndTurnPoint({
          cell: firstCell,
          connection: firstCellConnection,
          direction,
          horizontal: true,
          turnPoint: this.sideConnectionBondTurnPoint ?? 0,
          turnPointIsUsed: this.sideConnectionBondTurnPoint !== undefined,
        });
      pathDAttributeValue += result.pathPart;
      this.sideConnectionBondTurnPoint = result.turnPoint;
    }

    let maxHorizontalOffset = 0;

    cells.forEach((cell: Cell, cellIndex: number): void => {
      const cellConnection = cell.connections.find(
        (connection: Connection): boolean => {
          return connection.polymerBond === this.polymerBond;
        },
      ) as Connection;
      const isLastCell = cellIndex === cells.length - 1;
      let _xDirection = xDirection;
      if (this.sideConnectionBondTurnPoint) {
        _xDirection =
          endPosition.x < this.sideConnectionBondTurnPoint ? 180 : 0;
      }
      const maxXOffset = cell.connections.reduce(
        (max: number, connection: Connection): number => {
          return connection.isVertical || max > connection.xOffset
            ? max
            : connection.xOffset;
        },
        0,
      );

      maxHorizontalOffset = Math.max(maxHorizontalOffset, maxXOffset);

      if (isLastCell) {
        if (isStraightVerticalConnection) {
          return;
        }

        const directionObject =
          cellConnection.direction as ConnectionDirectionOfLastCell;
        const yDirection = isVerticalConnection ? 90 : directionObject.y;
        const sin = Math.sin((yDirection * Math.PI) / 180);
        const cos = Math.cos((_xDirection * Math.PI) / 180);

        if (!isEveryCellOnSameRow) {
          {
            const absoluteLineY =
              endPosition.y -
              SideChainConnectionBondRendererUtility.cellHeight / 2 -
              SideChainConnectionBondRendererUtility.smoothCornerSize -
              sin * (cellConnection.yOffset ?? 0) * 3 -
              (isTwoNeighborRowsConnection
                ? maxHorizontalOffset - cellConnection.xOffset
                : cellConnection.xOffset) *
                3;
            pathDAttributeValue +=
              SVGPathDAttributeUtility.generateVerticalAbsoluteLine(
                absoluteLineY,
              ) + ' ';
          }
          pathDAttributeValue +=
            SideChainConnectionBondRendererUtility.generateBend(
              0,
              sin,
              cos,
              1,
            ) + ' ';
        }
        pathDAttributeValue +=
          SVGPathDAttributeUtility.generateHorizontalAbsoluteLine(
            endPosition.x -
              SideChainConnectionBondRendererUtility.smoothCornerSize * cos,
          ) + ' ';
        pathDAttributeValue +=
          SideChainConnectionBondRendererUtility.generateBend(cos, 0, cos, 1) +
          ' ';
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
        const isHorizontal = new Set([0, 180]).has(
          previousConnection.direction as ConnectionDirectionInDegrees,
        );
        const direction = isHorizontal
          ? xDirection
          : // TODO?: Check. I am not sure about `as ConnectionDirectionInDegrees`.
            (previousConnection.direction as ConnectionDirectionInDegrees);
        const result =
          SideChainConnectionBondRendererUtility.calculatePathPartAndTurnPoint({
            cell: previousCell,
            connection: previousConnection,
            direction,
            horizontal: isHorizontal,
            turnPoint: this.sideConnectionBondTurnPoint ?? 0,
            turnPointIsUsed: this.sideConnectionBondTurnPoint !== undefined,
          });
        pathDAttributeValue += result.pathPart;
        this.sideConnectionBondTurnPoint = result.turnPoint;
      }
      previousCell = cell;
      previousConnection = cellConnection;
    });

    pathDAttributeValue +=
      SVGPathDAttributeUtility.generateAbsoluteLine(
        endPosition.x,
        endPosition.y,
      ) + ' ';

    return this.appendSideConnectionPath(rootElement, pathDAttributeValue);
  }

  private getOuterConnectionSide(
    startMonomer: BaseMonomer,
    endMonomer: BaseMonomer,
    polymerBond: PolymerBond | HydrogenBond = this.polymerBond,
  ): OuterConnectionSide | undefined {
    const editor = provideEditorInstance();
    if (!(editor.mode instanceof SnakeMode)) {
      return undefined;
    }

    const monomerToChain =
      editor.drawingEntitiesManager.canvasMatrix?.chainsCollection
        .monomerToChain;
    const startChain = monomerToChain?.get(startMonomer);
    const endChain = monomerToChain?.get(endMonomer);

    if (!startChain || !endChain || startChain === endChain) {
      return undefined;
    }

    const startAttachmentPoint =
      startMonomer.getAttachmentPointByBond(polymerBond) ??
      startMonomer.getPotentialAttachmentPointByBond(polymerBond);
    const endAttachmentPoint =
      endMonomer.getAttachmentPointByBond(polymerBond) ??
      endMonomer.getPotentialAttachmentPointByBond(polymerBond);

    const isHydrogenBond = polymerBond instanceof HydrogenBond;
    const isR2ToR2 =
      startAttachmentPoint === 'R2' && endAttachmentPoint === 'R2';
    const isR2ToR3 =
      (startAttachmentPoint === 'R2' && endAttachmentPoint === 'R3') ||
      (startAttachmentPoint === 'R3' && endAttachmentPoint === 'R2');
    const hasBackboneChains = startChain.length > 1 && endChain.length > 1;

    if (
      ((isR2ToR2 && startChain.length === 1 && endChain.length === 1) ||
        (hasBackboneChains && (isR2ToR2 || isR2ToR3 || isHydrogenBond))) &&
      startChain.lastNode?.monomers.includes(startMonomer) &&
      endChain.lastNode?.monomers.includes(endMonomer)
    ) {
      return 1;
    }

    if (
      !isHydrogenBond &&
      hasBackboneChains &&
      startAttachmentPoint &&
      startAttachmentPoint === endAttachmentPoint &&
      startChain.firstNode?.monomers.includes(startMonomer) &&
      endChain.firstNode?.monomers.includes(endMonomer)
    ) {
      return -1;
    }

    return undefined;
  }

  private getLeftDetourStartMonomer(cells: Cell[]): BaseMonomer | undefined {
    const [firstCell] = cells;
    const lastCell = cells[cells.length - 1];
    const { firstMonomer, secondMonomer } = this.polymerBond;

    if (
      this.isHydrogenBond ||
      !secondMonomer ||
      cells.length < 3 ||
      firstCell.x !== lastCell.x ||
      firstCell.y === lastCell.y ||
      !firstCell.connections.some(
        (connection) =>
          connection.polymerBond === this.polymerBond && connection.isVertical,
      ) ||
      !cells.slice(1, -1).some((cell) => cell.x !== firstCell.x || cell.monomer)
    ) {
      return undefined;
    }

    const monomerToChain =
      provideEditorInstance().drawingEntitiesManager.canvasMatrix
        ?.chainsCollection.monomerToChain;
    const chain = monomerToChain?.get(firstMonomer);
    const startMonomer = firstCell.node?.monomers.includes(firstMonomer)
      ? firstMonomer
      : secondMonomer;

    if (
      chain === monomerToChain?.get(secondMonomer) &&
      chain?.firstNode?.monomers.includes(startMonomer)
    ) {
      return startMonomer;
    }

    return undefined;
  }

  private getOuterConnectionLane(matrix: CanvasMatrix): number {
    let lanes = outerConnectionLanes.get(matrix);

    if (!lanes) {
      const routes: Array<{
        id: number;
        side: OuterConnectionSide;
        start: number;
        end: number;
      }> = [];

      matrix.polymerBondToCells.forEach((cells, polymerBond) => {
        const firstCell = cells[0];
        const lastCell = cells[cells.length - 1];
        const endMonomer = polymerBond.secondMonomer;

        if (
          !firstCell ||
          !lastCell ||
          firstCell.y === lastCell.y ||
          !endMonomer ||
          (!polymerBond.isSideChainConnection &&
            !polymerBond.isOverlappedByMonomer)
        ) {
          return;
        }

        const side = this.getOuterConnectionSide(
          polymerBond.firstMonomer,
          endMonomer,
          polymerBond,
        );
        if (side === undefined) {
          return;
        }

        routes.push({
          id: polymerBond.id,
          side,
          start: firstCell.y,
          end: lastCell.y,
        });
      });

      lanes =
        SideChainConnectionBondRendererUtility.assignOuterConnectionLanes(
          routes,
        );
      outerConnectionLanes.set(matrix, lanes);
    }

    return lanes.get(this.polymerBond.id) ?? 0;
  }

  private buildOuterConnectionPath(
    startMonomer: BaseMonomer,
    endMonomer: BaseMonomer,
    startPosition: Vec2,
    endPosition: Vec2,
    side: OuterConnectionSide,
    lane: number,
  ): string {
    const startAnchor = this.getSideAnchor(startMonomer, startPosition, side);
    const endAnchor = this.getSideAnchor(endMonomer, endPosition, side);
    const outermost = side === 1 ? Math.max : Math.min;
    let outerEdge = outermost(startAnchor.x, endAnchor.x);

    if (side === -1) {
      for (const monomer of provideEditorInstance().drawingEntitiesManager.monomers.values()) {
        const renderer = monomer.renderer;

        if (renderer) {
          outerEdge = outermost(outerEdge, renderer.scaledMonomerPosition.x);
        }
      }
    }

    const outerBackboneX = outerEdge + side * OUTER_BACKBONE_LINE_MARGIN;
    const outerX =
      outerBackboneX -
      side * OUTER_CONNECTION_CLEARANCE +
      side * lane * OUTER_CONNECTION_LANE_SPACING;
    const cornerSize = SideChainConnectionBondRendererUtility.smoothCornerSize;
    const verticalDirection = endAnchor.y > startAnchor.y ? 1 : -1;

    return [
      SVGPathDAttributeUtility.generateMoveTo(startAnchor.x, startAnchor.y),
      SVGPathDAttributeUtility.generateAbsoluteLine(
        outerX - side * cornerSize,
        startAnchor.y,
      ),
      SideChainConnectionBondRendererUtility.generateBend(
        side,
        0,
        side,
        verticalDirection,
      ),
      SVGPathDAttributeUtility.generateAbsoluteLine(
        outerX,
        endAnchor.y - verticalDirection * cornerSize,
      ),
      SideChainConnectionBondRendererUtility.generateBend(
        0,
        verticalDirection,
        -side,
        verticalDirection,
      ),
      SVGPathDAttributeUtility.generateAbsoluteLine(endAnchor.x, endAnchor.y),
    ].join(' ');
  }

  private getSideAnchor(
    monomer: BaseMonomer,
    fallback: Vec2,
    side: OuterConnectionSide,
  ): Vec2 {
    const renderer = monomer.renderer;

    if (!renderer) {
      return fallback;
    }

    return new Vec2(
      renderer.scaledMonomerPosition.x +
        (side === 1 ? renderer.monomerSize.width : 0),
      renderer.scaledMonomerPosition.y + renderer.monomerSize.height / 2,
    );
  }

  // TODO: Specify the types.
  private appendSideConnectionPath(rootElement, pathDAttributeValue: string) {
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
          'data-fromattachmentpoint',
          this.polymerBond.firstMonomer.getAttachmentPointByBond(
            this.polymerBond,
          ) ?? '',
        )
        .attr(
          'data-toattachmentpoint',
          this.polymerBond.secondMonomer?.getAttachmentPointByBond(
            this.polymerBond,
          ) ?? '',
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
    shouldRecheckAttachmentPoint = true,
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
    const distanceY = Math.abs(endPosition.y - startPosition.y);
    let verticalLineLength = distanceY - SnakeLayoutCellWidth / 2 - 5;

    if (isAntisense) {
      verticalLineLength = RNA_ANTISENSE_CHAIN_VERTICAL_LINE_LENGTH;
    } else if (
      this.polymerBond.firstMonomer.monomerItem.isSense &&
      this.polymerBond.hasAntisenseInRow
    ) {
      verticalLineLength = RNA_SENSE_CHAIN_VERTICAL_LINE_LENGTH;
    }

    if (this.isSecondMonomerBottomRight(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentPointOfFirstMonomer &&
        shouldRecheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path += generateCornerFromLeftToBottom();
      this.addLine(
        LineDirection.Vertical,
        endPosition.y - startPosition.y - DOUBLE_CORNER_LENGTH,
      );
      this.path += generateCornerFromTopToRight();
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
        shouldRecheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path += generateCornerFromLeftToTop();
      this.addLine(
        LineDirection.Vertical,
        endPosition.y -
          startPosition.y -
          DOUBLE_CORNER_LENGTH +
          this.getMonomerHeight() / 2,
      );
      this.path += generateCornerFromBottomToRight();
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
        shouldRecheckAttachmentPoint
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
      this.path += generateCornerFromLeftToBottom();

      this.addLine(LineDirection.Vertical, verticalLineLength);
      this.path += generateCornerFromTopToLeft();
      this.addLine(
        LineDirection.Horizontal,
        -(
          startPosition.x -
          (this.polymerBond.nextRowPositionX ?? endPosition.x) +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );
      this.path += generateCornerFromRightToBottom();
      this.addLine(
        LineDirection.Vertical,
        endPosition.y -
          startPosition.y -
          CORNER_LENGTH * 4 -
          verticalLineLength,
      );
      this.path += generateCornerFromTopToRight();
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
        shouldRecheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path += generateCornerFromLeftToBottom();
      this.addLine(LineDirection.Vertical, this.getMonomerHeight());
      this.path += generateCornerFromTopToLeft();
      this.addLine(
        LineDirection.Horizontal,
        -(
          startPosition.x -
          endPosition.x +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );

      this.path += generateCornerFromRightToTop();
      this.addLine(
        LineDirection.Vertical,
        endPosition.y - startPosition.y - this.getMonomerHeight(),
      );
      this.path += generateCornerFromBottomToRight();
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
      );
    } else if (this.isSecondMonomerLeft(startPosition, endPosition)) {
      if (
        isR1TheCurrentAttachmentPointOfFirstMonomer &&
        shouldRecheckAttachmentPoint
      ) {
        this.updateSnakeBondPath(endPosition, startPosition, false);
        return;
      }
      this.addLine(
        LineDirection.Horizontal,
        LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2,
        startPosition,
      );
      this.path += generateCornerFromLeftToBottom();
      this.addLine(
        LineDirection.Vertical,
        endPosition.y - startPosition.y + this.getMonomerHeight(),
      );
      this.path += generateCornerFromTopToLeft();
      this.addLine(
        LineDirection.Horizontal,
        -(
          startPosition.x -
          endPosition.x +
          LINE_FROM_MONOMER_LENGTH * 2 +
          this.getMonomerWidth()
        ),
      );

      this.path += generateCornerFromRightToTop();
      this.addLine(LineDirection.Vertical, -this.getMonomerHeight());
      this.path += generateCornerFromBottomToRight();
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
      ? SVGPathDAttributeUtility.generateMoveTo(
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
    const start = SVGPathDAttributeUtility.generateMoveTo(
      Math.round(startPosition.x),
      Math.round(startPosition.y),
    );
    const line = SVGPathDAttributeUtility.generateAbsoluteLine(
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
          'data-fromattachmentpoint',
          this.polymerBond.firstMonomer.getAttachmentPointByBond(
            this.polymerBond,
          ) ?? '',
        )
        .attr(
          'data-toattachmentpoint',
          this.polymerBond.secondMonomer?.getAttachmentPointByBond(
            this.polymerBond,
          ) ?? '',
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

  public show(_theme?: unknown, shouldForce = false): void {
    if (shouldForce) {
      this.sideConnectionBondTurnPoint = undefined;
    }
    this.rootElement = this.rootElement ?? this.appendRootElement();
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
          .attr('stroke', SELECTION_COLOR)
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

  private moveSnakeBond(): void {
    const startPosition = this.scaledPosition.startPosition;
    const endPosition = this.scaledPosition.endPosition;
    this.updateSnakeBondPath(startPosition, endPosition);

    assert(this.bodyElement);
    assert(this.hoverAreaElement);
    this.bodyElement.attr('d', this.path);

    this.hoverAreaElement.attr('d', this.path);
    this.selectionElement?.attr('d', this.path);
  }

  private moveSnakeBondEnd(): void {
    this.moveSnakeBond();
  }

  private moveGraphBondEnd(): void {
    assert(this.bodyElement);
    assert(this.hoverLineAreaElement);
    this.bodyElement
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y);

    this.hoverLineAreaElement
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
    this.moveSnakeBond();
  }

  private moveGraphBondStart(): void {
    assert(this.bodyElement);
    assert(this.hoverLineAreaElement);
    this.bodyElement
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y);

    this.hoverLineAreaElement
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
      this.hoverAreaElement = this.rootElement
        ?.append('path')
        .attr('stroke', 'transparent')
        .attr('d', this.path)
        .attr('fill-opacity', 0)
        .attr('stroke-width', '5');
    } else {
      this.hoverLineAreaElement = this.rootElement
        ?.append('line')
        .attr('stroke', 'transparent')
        .attr('x1', this.scaledPosition.startPosition.x)
        .attr('y1', this.scaledPosition.startPosition.y)
        .attr('x2', this.scaledPosition.endPosition.x)
        .attr('y2', this.scaledPosition.endPosition.y)
        .attr('stroke-width', '10');
      this.hoverAreaElement = this.hoverLineAreaElement;

      this.hoverCircleAreaElement = this.rootElement
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

  private updateAllSideConnectionBondsColor(
    getColor: (renderer: SnakeModePolymerBondRenderer) => string,
  ): void {
    const editor = provideEditorInstance();
    const allSideConnectionBondsBodyElements = editor.canvas.querySelectorAll(
      `.${SIDE_CONNECTION_BODY_ELEMENT_CLASS}`,
    );

    [...allSideConnectionBondsBodyElements].forEach((bondBodyElement) => {
      const renderer = bondBodyElement.__data__ as SnakeModePolymerBondRenderer;
      bondBodyElement.setAttribute('stroke', getColor(renderer));
    });
  }

  public appendHover(): void {
    assert(this.bodyElement);

    if (this.polymerBond.isSideChainConnection) {
      this.updateAllSideConnectionBondsColor((renderer) =>
        renderer.isHydrogenBond ? 'lightgrey' : '#C0E2E6',
      );
    }

    this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');

    if (this.polymerBond.selected && this.selectionElement) {
      this.selectionElement.attr('stroke', SELECTION_HOVERED_COLOR);
    }
  }

  // TODO: Specify the types.
  public removeHover() {
    assert(this.bodyElement);
    assert(this.hoverAreaElement);

    if (this.polymerBond.isSideChainConnection) {
      this.updateAllSideConnectionBondsColor((renderer) =>
        renderer.polymerBond.isSideChainConnection && !renderer.isHydrogenBond
          ? '#43B5C0'
          : '#333333',
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
      this.selectionElement.attr('stroke', SELECTION_COLOR);
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
    // Check the SVG element's class directly instead of this.polymerBond.isSideChainConnection
    // because by the time remove() is called, the attachment points in the model may already be
    // destroyed, causing isSideChainConnection to return false even though the bond was rendered
    // as a side-chain connection
    const isSideChainConnection = this.bodyElement
      ?.attr('class')
      ?.includes(SIDE_CONNECTION_BODY_ELEMENT_CLASS);

    super.remove();
    if (this.polymerBond.hovered) {
      this.editorEvents.mouseLeaveMonomer.dispatch();
    }

    // After a side-chain bond is removed, set all remaining side-chain bonds to the default color (#43B5C0)
    if (isSideChainConnection) {
      this.updateAllSideConnectionBondsColor((renderer) =>
        renderer.polymerBond.isSideChainConnection && !renderer.isHydrogenBond
          ? '#43B5C0'
          : '#333333',
      );
    }
  }
}
