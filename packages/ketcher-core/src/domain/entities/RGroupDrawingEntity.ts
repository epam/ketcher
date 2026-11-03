import { DrawingEntity } from './DrawingEntity';
import type { Atom } from './CoreAtom';
import type { Bond } from './CoreBond';
import type { RGroup } from './rgroup';
import { Vec2 } from './vec2';

/** A view of an R-group definition spanning one or more molecule fragments. */
export class RGroupDrawingEntity extends DrawingEntity {
  constructor(
    public readonly rgroupId: number,
    public rgroup: RGroup,
    public atoms: Atom[],
    public bonds: Bond[],
  ) {
    super();
  }

  public get center(): Vec2 {
    if (!this.atoms.length) return new Vec2();
    return this.atoms.reduce(
      (center, atom) => center.addScaled(atom.position, 1 / this.atoms.length),
      new Vec2(),
    );
  }
}
