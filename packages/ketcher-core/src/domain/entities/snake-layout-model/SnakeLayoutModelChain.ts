import type {
  ISnakeLayoutModelRow,
  ITwoStrandedSnakeLayoutNode,
} from 'domain/entities/snake-layout-model/types';
import type { EmptySnakeLayoutNode } from 'domain/entities/snake-layout-model/EmptySnakeLayoutNode';
import type { MoleculeSnakeLayoutNode } from 'domain/entities/snake-layout-model/MoleculeSnakeLayoutNode';

export class SnakeLayoutModelChain {
  private readonly rows: ISnakeLayoutModelRow[] = [];

  public get lastRow() {
    const lastRow = this.rows.at(-1);

    if (!lastRow) {
      throw new Error('Cannot get the last row of an empty snake layout chain');
    }

    return lastRow;
  }

  public get lastNode() {
    return this.lastRow.snakeLayoutModelItems[
      this.lastRow.snakeLayoutModelItems.length - 1
    ];
  }

  public get firstRow() {
    return this.rows[0];
  }

  public get firstNode() {
    return this.firstRow.snakeLayoutModelItems[0];
  }

  public get nodes() {
    return this.rows.reduce(
      (acc, row) => acc.concat(row.snakeLayoutModelItems),
      [] as (
        | ITwoStrandedSnakeLayoutNode
        | EmptySnakeLayoutNode
        | MoleculeSnakeLayoutNode
      )[],
    );
  }

  public get length() {
    return this.nodes.length;
  }

  public get rowsLength() {
    return this.rows.length;
  }

  public addRow(row: ISnakeLayoutModelRow) {
    this.rows.push(row);
  }

  public forEachNode(
    callback: (
      node:
        | ITwoStrandedSnakeLayoutNode
        | MoleculeSnakeLayoutNode
        | EmptySnakeLayoutNode,
      nodeIndex: number,
    ) => void,
  ) {
    let nodeIndexInChain = 0;

    for (const row of this.rows) {
      for (const node of row.snakeLayoutModelItems) {
        callback(node, nodeIndexInChain);
        nodeIndexInChain++;
      }
    }
  }

  public forEachRow(
    callback: (row: ISnakeLayoutModelRow, rowIndex: number) => void,
  ) {
    for (const [rowIndex, row] of this.rows.entries()) {
      callback(row, rowIndex);
    }
  }
}
