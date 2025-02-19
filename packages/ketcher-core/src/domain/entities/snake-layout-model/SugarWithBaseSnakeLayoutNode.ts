import { AmbiguousMonomer, RNABase, Sugar } from 'domain/entities';
import { SnakeLayoutNode } from 'domain/entities/snake-layout-model/SnakeLayoutModel';

export class SugarWithBaseSnakeLayoutNode implements SnakeLayoutNode {
  constructor(public sugar: Sugar, public base: RNABase | AmbiguousMonomer) {}

  public get monomers() {
    return [this.sugar, this.base];
  }
}
