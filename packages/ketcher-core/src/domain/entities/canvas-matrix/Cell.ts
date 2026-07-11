import type { BaseMonomer } from '../BaseMonomer';
import type { SubChainNode } from '../monomer-chains/types';
import type { Connection } from '../canvas-matrix/Connection';

export class Cell {
  constructor(
    public node: SubChainNode | null | undefined,
    public connections: Connection[],
    public x: number,
    public y: number,
    public monomer?: BaseMonomer,
  ) {}
}
