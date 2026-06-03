import type { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import type { RNABase } from 'domain/entities/RNABase';
import type { Sugar } from 'domain/entities/Sugar';
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
