import { AmbiguousMonomer, RNABase, Sugar } from 'domain/entities';
import { ISnakeLayoutNode } from './types';

export class SugarWithBaseSnakeLayoutNode implements ISnakeLayoutNode {
  constructor(public sugar: Sugar, public base: RNABase | AmbiguousMonomer) {}

  public get monomers() {
    return [this.sugar, this.base];
  }
}
