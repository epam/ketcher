import { EmptySequenceNode } from 'domain/entities';
import {
  ISnakeLayoutModelRow,
  ITwoStrandedSnakeLayoutNode,
} from 'domain/entities/snake-layout-model/types';

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
      [] as ITwoStrandedSnakeLayoutNode[],
    );
  }

  public get length() {
    return this.nodes.length;
  }

  public get hasAntisense() {
    return this.rows.some((row) =>
      row.snakeLayoutModelItems.some(
        (node) =>
          node.antisenseNode &&
          !(node.antisenseNode instanceof EmptySequenceNode),
      ),
    );
  }

  public get isNewSequenceChain() {
    return (
      this.length === 1 && this.firstNode.senseNode instanceof EmptySequenceNode
    );
  }

  public addRow(row: ISnakeLayoutModelRow) {
    this.rows.push(row);
  }

  public forEachNode(
    callback: (node: ITwoStrandedSnakeLayoutNode, nodeIndex: number) => void,
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
