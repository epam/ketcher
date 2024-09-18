import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Bond } from 'domain/entities/CoreBond';

export class Atom extends DrawingEntity {
  public bonds: Bond[] = [];
  constructor(
    position: Vec2,
    public monomer: BaseMonomer,
    public atomIdInMicroMode,
  ) {
    super(position);
  }

  public addBond(bond: Bond) {
    this.bonds.push(bond);
  }
}
