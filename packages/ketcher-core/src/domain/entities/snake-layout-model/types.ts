import { BaseMonomer, Chain } from 'domain/entities';
import { MoleculeSnakeLayoutNode } from 'domain/entities/snake-layout-model/MoleculeSnakeLayoutNode';
import { EmptySnakeLayoutNode } from 'domain/entities/snake-layout-model/EmptySnakeLayoutNode';

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
    | EmptySnakeLayoutNode
  )[];
}

export function isTwoStrandedSnakeLayoutNode(
  node:
    | ITwoStrandedSnakeLayoutNode
    | MoleculeSnakeLayoutNode
    | EmptySnakeLayoutNode,
): node is ITwoStrandedSnakeLayoutNode {
  return (
    !(node instanceof MoleculeSnakeLayoutNode) &&
    !(node instanceof EmptySnakeLayoutNode)
  );
}
