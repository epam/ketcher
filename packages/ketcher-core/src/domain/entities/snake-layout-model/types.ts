import type { BaseMonomer } from '../BaseMonomer';
import type { Chain } from '../monomer-chains/Chain';
import { MoleculeSnakeLayoutNode } from '../snake-layout-model/MoleculeSnakeLayoutNode';
import { EmptySnakeLayoutNode } from '../snake-layout-model/EmptySnakeLayoutNode';

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
