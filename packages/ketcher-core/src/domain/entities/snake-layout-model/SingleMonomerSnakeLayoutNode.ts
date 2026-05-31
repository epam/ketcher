import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { ISnakeLayoutMonomersNode } from './types';

export class SingleMonomerSnakeLayoutNode implements ISnakeLayoutMonomersNode {
  constructor(public monomer: BaseMonomer) {}

  public get monomers() {
    return [this.monomer];
  }
}
