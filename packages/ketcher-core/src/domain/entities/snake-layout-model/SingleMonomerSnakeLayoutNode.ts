import { BaseMonomer } from 'domain/entities';
import { ISnakeLayoutMonomersNode } from './types';

export class SingleMonomerSnakeLayoutNode implements ISnakeLayoutMonomersNode {
  constructor(public monomer: BaseMonomer) {}

  public get monomers() {
    return [this.monomer];
  }
}
