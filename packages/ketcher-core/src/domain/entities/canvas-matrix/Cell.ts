import { SubChainNode } from 'domain/entities';
import { Connection } from 'domain/entities/canvas-matrix/Connection';

export class Cell {
  constructor(
    public node: SubChainNode,
    public connections: Connection[],
    public x: number,
    public y: number,
  ) {}
}
