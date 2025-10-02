import {
  ISnakeLayoutModelRow,
  ITwoStrandedSnakeLayoutNode,
} from 'domain/entities/snake-layout-model/types';
import { EmptySnakeLayoutNode } from 'domain/entities/snake-layout-model/EmptySnakeLayoutNode';
import { MoleculeSnakeLayoutNode } from 'domain/entities/snake-layout-model/MoleculeSnakeLayoutNode';

export class SnakeLayoutModelChain {
  private rows: ISnakeLayoutModelRow[] = [];

  public get lastRow() {
    return this.rows[this.rows.length - 1];
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

    this.rows.forEach((row) => {
      row.snakeLayoutModelItems.forEach((node) => {
        callback(node, nodeIndexInChain);
        nodeIndexInChain++;
      });
    });
  }

  public forEachRow(
    callback: (row: ISnakeLayoutModelRow, rowIndex: number) => void,
  ) {
    this.rows.forEach((row, rowIndex) => {
      callback(row, rowIndex);
    });
  }
}
