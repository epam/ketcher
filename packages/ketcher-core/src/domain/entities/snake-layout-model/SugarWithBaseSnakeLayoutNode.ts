import { AmbiguousMonomer, RNABase, Sugar } from 'domain/entities';
import { ISnakeLayoutMonomersNode } from './types';

export class SugarWithBaseSnakeLayoutNode implements ISnakeLayoutMonomersNode {
  constructor(public sugar: Sugar, public base: RNABase | AmbiguousMonomer) {}

  public get monomers() {
    return [this.sugar, this.base];
  }
}
