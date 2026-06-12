import type { Atom } from 'domain/entities/CoreAtom';
import type { Bond } from 'domain/entities/CoreBond';

export class MoleculeSnakeLayoutNode {
  constructor(public molecule: (Atom | Bond)[]) {}
}
