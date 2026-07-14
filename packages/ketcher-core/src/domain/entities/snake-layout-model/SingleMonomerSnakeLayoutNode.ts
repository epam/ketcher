import type { BaseMonomer } from '../BaseMonomer';
import type { ISnakeLayoutMonomersNode } from './types';

export class SingleMonomerSnakeLayoutNode implements ISnakeLayoutMonomersNode {
  constructor(public monomer: BaseMonomer) {}

  public get monomers() {
    return [this.monomer];
  }
}
