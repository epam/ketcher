import { BaseMonomer, Chain } from 'domain/entities';

export interface ISnakeLayoutNode {
  monomers: BaseMonomer[];
}

export interface ITwoStrandedSnakeLayoutNode {
  senseNode?: ISnakeLayoutNode;
  antisenseNode?: ISnakeLayoutNode;
  chain: Chain;
}

export interface ISnakeLayoutModelRow {
  snakeLayoutModelItems: ITwoStrandedSnakeLayoutNode[];
}
