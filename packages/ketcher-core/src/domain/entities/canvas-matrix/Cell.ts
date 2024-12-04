import { BaseMonomer, SubChainNode } from 'domain/entities';
import { Connection } from 'domain/entities/canvas-matrix/Connection';

export class Cell {
  constructor(
    public node: SubChainNode | null | undefined,
    public connections: Connection[],
    public x: number,
    public y: number,
    public monomer?: BaseMonomer,
  ) {}
}
