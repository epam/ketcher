import { BaseMonomer } from 'domain/entities';
import { SnakeLayoutNode } from 'domain/entities/snake-layout-model/SnakeLayoutModel';

export class SingleMonomerSnakeLayoutNode implements SnakeLayoutNode {
  constructor(public monomer: BaseMonomer) {}

  public get monomers() {
    return [this.monomer];
  }
}
