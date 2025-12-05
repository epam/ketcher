import { BaseMonomer, Chain } from 'domain/entities';
import { MoleculeSnakeLayoutNode } from 'domain/entities/snake-layout-model/MoleculeSnakeLayoutNode';
import {
  IEmptySnakeLayoutNode,
  isEmptySnakeLayoutNode,
} from 'domain/entities/snake-layout-model/EmptySnakeLayoutNode';

export interface ISnakeLayoutMonomersNode {
  monomers: BaseMonomer[];
}

export interface ITwoStrandedSnakeLayoutNode {
  senseNode?: ISnakeLayoutMonomersNode;
  antisenseNode?: ISnakeLayoutMonomersNode;
  chain: Chain;
}

export interface ISnakeLayoutModelRow {
  snakeLayoutModelItems: (
    | ITwoStrandedSnakeLayoutNode
    | MoleculeSnakeLayoutNode
    | IEmptySnakeLayoutNode
  )[];
}

export function isTwoStrandedSnakeLayoutNode(
  node:
    | ITwoStrandedSnakeLayoutNode
    | MoleculeSnakeLayoutNode
    | IEmptySnakeLayoutNode,
): node is ITwoStrandedSnakeLayoutNode {
  return (
    !(node instanceof MoleculeSnakeLayoutNode) && !isEmptySnakeLayoutNode(node)
  );
}
