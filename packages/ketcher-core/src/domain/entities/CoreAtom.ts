import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Bond } from 'domain/entities/CoreBond';
import { BaseRenderer } from 'application/render';
import { AtomLabel } from 'domain/constants';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';

export class Atom extends DrawingEntity {
  public bonds: Bond[] = [];
  public renderer: AtomRenderer | undefined = undefined;
  constructor(
    position: Vec2,
    public monomer: BaseMonomer,
    public atomIdInMicroMode,
    public label: AtomLabel,
  ) {
    super(position);
  }

  public get center() {
    return this.position;
  }

  public addBond(bond: Bond) {
    this.bonds.push(bond);
  }

  public setRenderer(renderer: AtomRenderer) {
    this.renderer = renderer;
    super.setBaseRenderer(renderer as BaseRenderer);
  }
}
