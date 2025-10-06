import { BaseMonomer, MonomerToAtomBond, SubChainNode } from 'domain/entities';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Matrix } from 'domain/entities/canvas-matrix/Matrix';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { isNumber } from 'lodash';

interface MatrixConfig {
  initialMatrix: Matrix<Cell>;
}

export class CanvasMatrix {
  private matrix: Matrix<Cell>;
  private initialMatrixWidth: number;
  private monomerToCell: Map<BaseMonomer, Cell> = new Map();
  public polymerBondToCells: Map<PolymerBond, Cell[]> = new Map();
  public polymerBondToConnections: Map<PolymerBond, Connection[]> = new Map();

  constructor(
    public chainsCollection: ChainsCollection,
    private matrixConfig: MatrixConfig = {
      initialMatrix: new Matrix<Cell>(),
    },
  ) {
    this.matrix = new Matrix<Cell>();
    this.initialMatrixWidth = this.matrixConfig.initialMatrix.width;
    this.fillCells();
  }

  private fillConnectionsOffset(
    direction: number,
    increaseOffset = (connection: Connection, increaseValue?: number) => {
      if (isNumber(increaseValue)) {
        connection.xOffset = increaseValue;
      } else {
        connection.xOffset++;
      }
    },
    getOffset = (connection: Connection): number => connection.xOffset,
  ): void {
    // set offsets for connections with overlappings
    const currentConnections = new Map<PolymerBond, Set<Connection>>();
    let iterationMethod: typeof this.matrix.forEach;

    if (direction === 180) {
      iterationMethod = this.matrix.forEach.bind(this.matrix);
    } else if (direction === 0) {
      iterationMethod = this.matrix.forEachRightToLeft.bind(this.matrix);
    } else {
      iterationMethod = this.matrix.forEachBottomToTop.bind(this.matrix);
    }

    iterationMethod((cell) => {
      const biggestOffsetInCell = cell.connections.reduce(
        (biggestOffset: number, connection: Connection): number => {
          return getOffset(connection) > biggestOffset
            ? getOffset(connection)
            : biggestOffset;
        },
        0,
      );
      cell.connections.forEach((connection: Connection): void => {
        if (connection.direction !== direction || connection.connectedNode) {
          return;
        }
        if (!currentConnections.has(connection.polymerBond)) {
          const polymerBondConnections = this.polymerBondToConnections.get(
            connection.polymerBond,
          );
          polymerBondConnections?.forEach(
            (polymerBondConnection: Connection): void => {
              increaseOffset(polymerBondConnection, biggestOffsetInCell);
            },
          );
          currentConnections.set(
            connection.polymerBond,
            new Set(polymerBondConnections),
          );
        }
      });
      cell.connections.forEach((connection: Connection): void => {
        if (
          !connection.connectedNode ||
          (connection.direction !== direction &&
            !currentConnections.has(connection.polymerBond))
        ) {
          return;
        }
        if (currentConnections.has(connection.polymerBond)) {
          currentConnections.delete(connection.polymerBond);
          currentConnections.forEach((connections: Set<Connection>): void => {
            Array.from(connections.values()).forEach(
              (currentConnection: Connection): void => {
                increaseOffset(currentConnection);
              },
            );
          });
        } else {
          currentConnections.set(
            connection.polymerBond,
            new Set(this.polymerBondToConnections.get(connection.polymerBond)),
          );
        }
      });
      if (
        (cell.x === 0 && direction !== 90) ||
        (cell.y === 0 && direction === 90)
      ) {
        currentConnections.clear();
      }
      Array.from(currentConnections.keys()).forEach((polymerBond) => {
        const polymerBondConnections =
          this.polymerBondToConnections.get(polymerBond);
        if (
          polymerBondConnections?.every(
            (connection: Connection): boolean =>
              !cell.connections.includes(connection),
          )
        ) {
          currentConnections.delete(polymerBond);
        }
      });
    });
  }

  private fillRightConnectionsOffset() {
    const direction = 0;
    const handledConnections = new Set<PolymerBond>();

    this.matrix.forEach((cell) => {
      const biggestOffsetInCell = cell.connections.reduce(
        (biggestOffset: number, connection: Connection): number => {
          return connection.xOffset > biggestOffset
            ? connection.xOffset
            : biggestOffset;
        },
        0,
      );

      cell.connections.forEach((connection: Connection): void => {
        if (connection.direction !== direction) {
          return;
        }
        if (connection.xOffset <= biggestOffsetInCell) {
          const polymerBondConnections = this.polymerBondToConnections.get(
            connection.polymerBond,
          );
          polymerBondConnections?.forEach(
            (polymerBondConnection: Connection): void => {
              polymerBondConnection.xOffset = biggestOffsetInCell;
            },
          );
          handledConnections.add(connection.polymerBond);
        }
      });
    });

    handledConnections.forEach((polymerBond) => {
      const polymerBondConnections =
        this.polymerBondToConnections.get(polymerBond);
      polymerBondConnections?.forEach((polymerBondConnection) => {
        if (polymerBondConnection.direction !== direction) {
          return;
        }

        polymerBondConnection.xOffset++;
      });
    });
  }

  private fillCells() {
    // create matrix by initial matrix filling empty cells

    for (
      let rowNumber = 0;
      rowNumber < this.matrixConfig.initialMatrix.height;
      rowNumber++
    ) {
      for (
        let columnNumber = 0;
        columnNumber < this.initialMatrixWidth;
        columnNumber++
      ) {
        const initialMatrixCell = this.matrixConfig.initialMatrix.get(
          rowNumber,
          columnNumber,
        );

        if (!initialMatrixCell) {
          this.matrix.set(
            rowNumber,
            columnNumber,
            new Cell(null, [], columnNumber, rowNumber),
          );

          continue;
        }

        const cell = new Cell(
          initialMatrixCell.node,
          [],
          columnNumber,
          rowNumber,
          initialMatrixCell.monomer,
        );

        this.matrix.set(rowNumber, columnNumber, cell);

        if (initialMatrixCell.monomer) {
          this.monomerToCell.set(initialMatrixCell.monomer, cell);
        }
      }
    }

    const monomerToNode = this.chainsCollection.monomerToNode;
    const handledConnections = new Set<PolymerBond>();

    this.matrix.forEach((cell) => {
      const monomer = cell.monomer;

      monomer?.forEachBond((polymerBond) => {
        if (polymerBond instanceof MonomerToAtomBond) {
          return;
        }

        if (
          (polymerBond.isSideChainConnection ||
            polymerBond.isOverlappedByMonomer) &&
          !handledConnections.has(polymerBond)
        ) {
          const anotherMonomer = polymerBond.getAnotherMonomer(
            monomer,
          ) as BaseMonomer;
          const connectedNode = monomerToNode.get(
            anotherMonomer,
          ) as SubChainNode;
          const connectedCell = this.monomerToCell.get(anotherMonomer);

          if (!connectedCell) {
            return;
          }

          const xDistance = connectedCell.x - cell.x;
          const yDistance = connectedCell.y - cell.y;
          const xDirection = xDistance > 0 ? 0 : 180;
          const yDirection = yDistance > 0 ? 90 : 270;
          let xDistanceAbsolute = Math.abs(xDistance);
          let yDistanceAbsolute = Math.abs(yDistance);
          const isVertical = xDistanceAbsolute === 0;

          // fill start cell by connection with direction
          let connection = new Connection(
            connectedNode,
            isVertical ? 90 : xDirection,
            isVertical,
            polymerBond,
            0,
            0,
          );

          cell.connections.push(connection);
          this.polymerBondToCells.set(polymerBond, [cell]);
          this.polymerBondToConnections.set(polymerBond, [connection]);

          let nextCellX = cell.x;
          let nextCellY = cell.y;

          // fill x cells by connection with direction
          while (xDistanceAbsolute > 1) {
            nextCellX += Math.sign(xDistance);
            const nextCellToHandle = this.matrix.get(
              nextCellY,
              nextCellX,
            ) as Cell;
            connection = new Connection(
              null,
              xDirection,
              isVertical,
              polymerBond,
              0,
              0,
            );
            nextCellToHandle.connections.push(connection);
            this.polymerBondToCells.get(polymerBond)?.push(nextCellToHandle);
            this.polymerBondToConnections.get(polymerBond)?.push(connection);

            xDistanceAbsolute--;
          }

          // fill y cells by connection with direction
          while (yDistanceAbsolute > 1) {
            nextCellY += Math.sign(yDistance);
            const nextCellToHandle = this.matrix.get(
              nextCellY,
              nextCellX,
            ) as Cell;
            connection = new Connection(
              null,
              yDirection,
              isVertical,
              polymerBond,
              0,
              0,
            );
            nextCellToHandle.connections.push(connection);
            this.polymerBondToCells.get(polymerBond)?.push(nextCellToHandle);
            this.polymerBondToConnections.get(polymerBond)?.push(connection);

            yDistanceAbsolute--;
          }

          // fill last cell by connection
          nextCellX += Math.sign(xDistance);
          nextCellY += Math.sign(yDistance);

          const lastCellToHandle = this.matrix.get(
            nextCellY,
            nextCellX,
          ) as Cell;
          connection = new Connection(
            connectedNode,
            isVertical
              ? yDirection
              : { x: xDistance === 0 ? 0 : xDirection, y: yDirection },
            isVertical,
            polymerBond,
            0,
            0,
          );
          lastCellToHandle.connections.push(connection);
          this.polymerBondToCells.get(polymerBond)?.push(lastCellToHandle);
          this.polymerBondToConnections.get(polymerBond)?.push(connection);

          handledConnections.add(polymerBond);
        }
      });
    });

    this.fillConnectionsOffset(180);
    this.fillRightConnectionsOffset();
    this.fillConnectionsOffset(0);
    this.fillConnectionsOffset(
      90,
      (connection: Connection, increaseValue: number | undefined): void => {
        if (isNumber(increaseValue)) {
          connection.yOffset = increaseValue;
        } else {
          connection.yOffset++;
        }
      },
      (connection: Connection): number => connection.yOffset,
    );
  }
}
