import { BaseMonomer } from 'domain/entities';
import { ISnakeLayoutNode } from './types';

export class SingleMonomerSnakeLayoutNode implements ISnakeLayoutNode {
  constructor(public monomer: BaseMonomer) {}

  public get monomers() {
    return [this.monomer];
  }
}
