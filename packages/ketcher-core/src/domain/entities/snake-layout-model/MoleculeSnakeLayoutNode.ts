import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';

export class MoleculeSnakeLayoutNode {
  constructor(public molecule: (Atom | Bond)[]) {}
}
