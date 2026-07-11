import type { Atom } from '../CoreAtom';
import type { Bond } from '../CoreBond';

export class MoleculeSnakeLayoutNode {
  constructor(public molecule: (Atom | Bond)[]) {}
}
