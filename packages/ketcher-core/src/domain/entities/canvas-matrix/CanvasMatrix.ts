// 1. We think about chains as a matrix of cells where each cell represents a node in chain. We also can fill each cell by the information about connections
// which goes through/in/from this cell. It will give us a possibility to calculate the offset of each connection if there are overlappings.
// 2. We analyse side connections from top to bottom, from left to right, consequently for each node. It gives us some limitations which we can use to simplify calculations.
// 3. We separate connection path calculation into two parts. First part is filling each cell by the information about connections which goes through/in/from this cell
// and their directions.
// After that we can apply such rules to draw path for each connection inside the chain, but only from bottom of first monomer to top of second:
//
// xDistanceIncludingEndpoints = 4
// yDistanceIncludingEndpoints = 4
// steps = [
// right, right, right (xDistanceIncludingEndpoints - 1, because we need to jump to last node in the end),
// bottom, bottom (yDistanceIncludingEndpoints - 2, because we first node y starts from bottom(so we don't need to avoid it by line y position) and need to jump to last node in the end)
// ]
//
// 4. After that we need to collect all side connections by grouping the cells by Bond and we get pieces of each connection in each cell with angle and entry point
// with limitations described above.
// 5. We can iterate over this collection and set offset and starting point for each connection depends on:
// - it's attachment point position
// - it overlaps in some of the parts of connection
// - it is in one row
// - it starts/ends in the beginning/end of the chain
// Additional thoughts
// 1. If nodes are on same vertical position then we need to collect only verticals connections
// 2. If nodes are on same horizontal position then we need to collect only horizontal connections
// 3. If nodes are NOT on same vertical/horizontal position then we need to collect horizontals first, and then verticals
// In 1 and 2 cases, and also in case we have only one external connection(only R1 or only R2) we need to apply another rules from point 3 above

// 1. R3-R3
// 1.1 Different vertical and horizontal positions
// 1.1.1 Example 1:5 - 3:2
// _xDistance = 2 - 5 = -3
// _yDistance = 1 - 3 = -2
// xDirection = 180 // because _xDistance negative
// yDirection = 90 // because _yDistance negative
// xDistance = Math.abs(_xDistance)
// yDistance = Math.abs(_yDistance)
//
// fill start cell by connection with direction 180
//
// 1:5
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 180,
//         },
//       ],
//     },
//
// fill horizontal cells by connection with direction 180
//
// xDistance > 1 === true:
// 1:4
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 180,
//         },
//       ],
//     },
// xDistance--
// xDistance > 1 === true:
// 1:3
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 180,
//         },
//       ],
//     },
// xDistance--
// xDistance > 1 === false:
//
// fill vertical cells by connection with direction 90
//
// yDistance > 1 === true:
// 2:3
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 90,
//         },
//       ],
//     },
// yDistance--
// yDistance > 1 === false:
//
//  yDistance === 1 && xDistance === 1 so next(and last) cell to handle is 3:2 (jump both x and y direction)
// 3:2
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//         },
//       ],
//     },

// 1.2 Different vertical and same horizontal position
// 1.2.1 Example 1:5 - 3:5
// _xDistance = 5 - 5 = 0
// _yDistance = 1 - 3 = -2
// xDirection = undefined // because _xDistance === 0
// yDirection = 90 // because _yDistance negative
// xDistance = undefined
// yDistance = Math.abs(_yDistance)
//
// fill start cell by connection with direction 90
//
// 1:5
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 90,
//         },
//       ],
//     },
//
// fill vertical cells by connection with direction 90
//
// yDistance > 1 === true:
// 2:5
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 90,
//         },
//       ],
//     },
//
// yDistance--
// yDistance > 1 === false:
//
//  yDistance === 1 && xDistance === undefined so next(and last) cell to handle is 3:5 (jump only y direction)
// 3:5
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//         },
//       ],
//     },
//
// 1.3 Same vertical and different horizontal position
// 1.3.1 Example 1:2 - 1:5
// _xDistance = 5 - 2 = 3
// _yDistance = 1 - 1 = 0
// xDirection = 0 // because _xDistance positive
// yDirection = undefined // because _yDistance === 0
// xDistance = Math.abs(_xDistance)
// yDistance = undefined
//
// fill start cell by connection with direction 0
//
// 1:2
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 0,
//         },
//       ],
//     },
//
// fill horizontal cells by connection with direction 0
//
// xDistance > 1 === true:
// 1:3
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 0,
//         },
//       ],
//     },
// xDistance--
// xDistance > 1 === true:
// 1:4
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 0,
//         },
//       ],
//     },
// xDistance--
// xDistance > 1 === false:
//
//  xDistance === 1 && yDistance === undefined so next(and last) cell to handle is 1:5 (jump only x direction)
// 1:5
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//         },
//       ],
//     },
//
// 1.5 Special case for connections from the beginning of chain and AP R1
// Same as cases above but start filling connections from vertical ones.
// Fill vertical cells by connections until yDistance === 1. Then jump to bottom cell and fill xDistance === undefined ? second endpoint connection : horizontal connection.
// Then if xDistance > 0 fill horizontal cells by connections.

// Please create class CanvasMatrix.
// It should take ChainsCollection as a parameter in constructor and create a matrix of cells where each cell represents a node in chain.
// Each cell should have a structure like this:
//     {
//       node: MonomerSequenceNode,
//       connections: [
//         {
//           bond: Bond,
//           connectedNode: MonomerSequenceNode,
//           direction: 0,
//         },
//       ],
//     },
// .

import { SubChainNode } from 'domain/entities';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Matrix } from 'domain/entities/canvas-matrix/Matrix';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { matrix } from 'svgpath';
import { isNumber } from 'lodash';

interface MatrixConfig {
  cellsInRow: number;
}

export class CanvasMatrix {
  private matrix: Matrix<Cell>;
  private nodeToCell: Map<SubChainNode, Cell> = new Map();
  public polymerBondToCells: Map<PolymerBond, Cell[]> = new Map();
  public polymerBondToConnections: Map<PolymerBond, Connection[]> = new Map();

  constructor(
    private chainsCollection: ChainsCollection,
    private matrixConfig: MatrixConfig = {
      cellsInRow: 18,
    },
  ) {
    this.matrix = new Matrix<Cell>();
    this.fillCells();
  }

  private get chains() {
    return this.chainsCollection.chains;
  }

  private fillConnectionsOffset(
    direction: number,
    setOffset = (connection: Connection, offset: number) =>
      (connection.offset = offset),
    getOffset = (connection: Connection) => connection.offset,
    startNodeDirection?: number,
  ) {
    // set offsets for connections with overlappings
    const currentConnections = new Map<PolymerBond, Set<Connection>>();
    const iterationMethod =
      direction === 180
        ? this.matrix.forEach.bind(this.matrix)
        : direction === 0
        ? this.matrix.forEachRightToLeft.bind(this.matrix)
        : this.matrix.forEachBottomToTop.bind(this.matrix);

    iterationMethod((cell, x, y) => {
      const biggestOffsetInCell = cell.connections.reduce(
        (biggestOffset, connection) => {
          return getOffset(connection) > biggestOffset
            ? getOffset(connection)
            : biggestOffset;
        },
        0,
      );
      cell.connections.forEach((connection) => {
        if (connection.direction !== direction || connection.connectedNode) {
          return;
        }
        if (!currentConnections.has(connection.polymerBond)) {
          const polymerBondConnections = this.polymerBondToConnections.get(
            connection.polymerBond,
          );
          polymerBondConnections.forEach((polymerBondConnection) => {
            setOffset(polymerBondConnection, biggestOffsetInCell);
          });
          currentConnections.set(
            connection.polymerBond,
            new Set(polymerBondConnections),
          );
        }
      });
      cell.connections.forEach((connection) => {
        if (
          !connection.connectedNode ||
          connection.direction !==
            (isNumber(startNodeDirection) ? startNodeDirection : direction) ||
          (direction !== 90 && connection.isVertical)
        ) {
          return;
        }
        console.log('Here', connection);
        if (currentConnections.has(connection.polymerBond)) {
          currentConnections.delete(connection.polymerBond);
          // currentOffset++;
          currentConnections.forEach((connections) => {
            connections.values().forEach((currentConnection) => {
              setOffset(currentConnection, currentConnection.offset + 1);
            });
          });
        } else {
          // connection.offset = currentOffset;
          if (!currentConnections.has(connection.polymerBond)) {
            currentConnections.set(
              connection.polymerBond,
              new Set(
                this.polymerBondToConnections.get(connection.polymerBond),
              ),
            );
          }
        }
      });
    });
  }

  private fillRightConnectionsOffset() {
    const direction = 0;
    const handledConnections = new Set<PolymerBond>();

    this.matrix.forEach((cell, x, y) => {
      const biggestOffsetInCell = cell.connections.reduce(
        (biggestOffset, connection) => {
          return connection.offset > biggestOffset
            ? connection.offset
            : biggestOffset;
        },
        0,
      );

      cell.connections.forEach((connection) => {
        if (connection.direction !== direction) {
          return;
        }
        if (connection.offset <= biggestOffsetInCell) {
          const polymerBondConnections = this.polymerBondToConnections.get(
            connection.polymerBond,
          );
          polymerBondConnections.forEach((polymerBondConnection) => {
            polymerBondConnection.offset = biggestOffsetInCell;
          });
          handledConnections.add(connection.polymerBond);
        }
      });
    });

    handledConnections.forEach((polymerBond) => {
      const polymerBondConnections =
        this.polymerBondToConnections.get(polymerBond);
      polymerBondConnections.forEach((polymerBondConnection) => {
        if (polymerBondConnection.direction !== direction) {
          return;
        }

        polymerBondConnection.offset++;
      });
    });
  }

  private fillCells() {
    // iterate over each chain and fill matrix with cells
    let rowNumber = 0;
    let columnNumber = 0;
    this.chains.forEach((chain) => {
      chain.forEachNode(({ node }) => {
        if (columnNumber / this.matrixConfig.cellsInRow >= 1) {
          rowNumber++;
          columnNumber = 0;
        }

        const cell = new Cell(node, [], columnNumber, rowNumber);
        this.matrix.set(rowNumber, columnNumber, cell);
        this.nodeToCell.set(node, cell);
        columnNumber++;
      });
      let emptyCellsAmount = this.matrixConfig.cellsInRow - columnNumber;
      while (emptyCellsAmount > 0) {
        this.matrix.set(
          rowNumber,
          columnNumber,
          new Cell(null, [], columnNumber, rowNumber),
        );
        columnNumber++;
        emptyCellsAmount--;
      }
      rowNumber++;
      columnNumber = 0;
    });

    const monomerToNode = this.chainsCollection.monomerToNode;
    const handledConnections = new Set<PolymerBond>();

    this.matrix.forEach((cell, x, y) => {
      cell.node?.monomers.forEach((monomer) => {
        monomer.forEachBond((polymerBond) => {
          if (
            polymerBond.isSideChainConnection &&
            !handledConnections.has(polymerBond)
          ) {
            const anotherMonomer = polymerBond.getAnotherMonomer(monomer);
            const connectedNode = monomerToNode.get(anotherMonomer);
            const connectedCell = this.nodeToCell.get(connectedNode);
            const xDistance = connectedCell.x - cell.x;
            const yDistance = connectedCell.y - cell.y;
            const xDirection = xDistance > 0 ? 0 : 180;
            const yDirection = yDistance > 0 ? 90 : 270;
            let xDistanceAbsolute = Math.abs(xDistance);
            let yDistanceAbsolute = Math.abs(yDistance);
            const isVertical = xDistanceAbsolute === 0;
            console.log('Connection', xDistanceAbsolute);
            // fill start cell by connection with direction
            let connection = {
              polymerBond,
              connectedNode,
              direction: yDistance === 1 ? 90 : xDirection,
              offset: 0,
              isVertical,
            };

            cell.connections.push(connection);
            this.polymerBondToCells.set(polymerBond, [cell]);
            this.polymerBondToConnections.set(polymerBond, [connection]);

            let nextCellX = cell.x;
            let nextCellY = cell.y;

            // fill x cells by connection with direction
            while (xDistanceAbsolute > 1) {
              nextCellX += Math.sign(xDistance);
              const nextCellToHandle = this.matrix.get(nextCellY, nextCellX);
              connection = {
                polymerBond,
                connectedNode: null,
                direction: xDirection,
                offset: 0,
                isVertical,
              };
              nextCellToHandle.connections.push(connection);
              this.polymerBondToCells.get(polymerBond).push(nextCellToHandle);
              this.polymerBondToConnections.get(polymerBond).push(connection);

              xDistanceAbsolute--;
            }

            // fill y cells by connection with direction
            while (yDistanceAbsolute > 1) {
              nextCellY += Math.sign(yDistance);
              const nextCellToHandle = this.matrix.get(nextCellY, nextCellX);
              connection = {
                polymerBond,
                connectedNode: null,
                direction: yDirection,
                offset: 0,
                isVertical,
              };
              nextCellToHandle.connections.push(connection);
              this.polymerBondToCells.get(polymerBond).push(nextCellToHandle);
              this.polymerBondToConnections.get(polymerBond).push(connection);

              yDistanceAbsolute--;
            }

            // fill last cell by connection
            nextCellX += Math.sign(xDistance);
            nextCellY += Math.sign(yDistance);

            const lastCellToHandle = this.matrix.get(nextCellY, nextCellX);
            connection = {
              polymerBond,
              connectedNode,
              direction: { x: xDistance === 0 ? 0 : xDirection, y: yDirection },
              offset: 0,
              isVertical,
            };
            lastCellToHandle.connections.push(connection);
            this.polymerBondToCells.get(polymerBond).push(lastCellToHandle);
            this.polymerBondToConnections.get(polymerBond).push(connection);

            handledConnections.add(polymerBond);
          }
        });
      });
    });

    this.fillConnectionsOffset(180);
    this.fillRightConnectionsOffset();
    this.fillConnectionsOffset(0);
    this.fillConnectionsOffset(
      90,
      (connection, offset) => (connection.yOffset = offset),
      (connection) => connection.yOffset,
      180,
    );
    console.log(this.matrix);
  }

  private calculateDirection(cell: Cell, connectedCell: Cell): number {
    console.log(cell, connectedCell);
    if (cell.x === connectedCell.x) {
      return cell.y > connectedCell.y ? 90 : 270;
    }
    return cell.x > connectedCell.x ? 180 : 0;
  }

  private drawConnectionsInChain() {
    for (const chain of this.chains) {
      for (const node of chain) {
        const cell = this.matrix.get(node.x, node.y);
        for (const connection of cell.connections) {
          this.drawConnection(node, connection);
        }
      }
    }
  }

  private drawConnection(node: SubChainNode, connection: Connection) {
    // draw connection from bottom of first monomer to top of second
    // with direction, angle and entry point
  }

  private drawConnectionsBetweenChains() {
    for (const chain of this.chains) {
      for (const node of chain) {
        const cell = this.matrix.get(node.x, node.y);
        for (const connection of cell.connections) {
          this.drawConnection(node, connection);
        }
      }
    }
  }
}
