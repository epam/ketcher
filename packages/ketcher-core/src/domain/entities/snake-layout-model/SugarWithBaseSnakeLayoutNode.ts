import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { ISnakeLayoutMonomersNode } from './types';

export class SugarWithBaseSnakeLayoutNode implements ISnakeLayoutMonomersNode {
  constructor(public sugar: Sugar, public base: RNABase | AmbiguousMonomer) {}

  public get monomers() {
    return [this.sugar, this.base];
  }
}
