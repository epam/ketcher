import type { AmbiguousMonomer } from '../AmbiguousMonomer';
import type { RNABase } from '../RNABase';
import type { Sugar } from '../Sugar';
import type { ISnakeLayoutMonomersNode } from './types';

export class SugarWithBaseSnakeLayoutNode implements ISnakeLayoutMonomersNode {
  constructor(
    public sugar: Sugar | AmbiguousMonomer,
    public base: RNABase | AmbiguousMonomer,
  ) {}

  public get monomers() {
    return [this.sugar, this.base];
  }
}
