import type { BaseRenderer } from 'application/render';
import type { SGroupRenderer } from 'application/render/renderers/SGroupRenderer';
import type { BaseMonomer } from './BaseMonomer';
import { DrawingEntity } from './DrawingEntity';
import type { SGroup } from './sgroup';
import { Vec2 } from './vec2';

export class SGroupDrawingEntity extends DrawingEntity {
  public renderer?: SGroupRenderer;

  constructor(
    public readonly sgroup: SGroup,
    public readonly monomer: BaseMonomer,
    public readonly sgroupIdInMicroMode: number,
  ) {
    super(SGroupDrawingEntity.getCenter(sgroup, monomer));
  }

  public get center(): Vec2 {
    return SGroupDrawingEntity.getCenter(this.sgroup, this.monomer);
  }

  public setRenderer(renderer: SGroupRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  private static getCenter(sgroup: SGroup, monomer: BaseMonomer): Vec2 {
    const atoms = sgroup.atoms
      .map((atomId) => monomer.monomerItem.struct.atoms.get(atomId)?.pp)
      .filter((position): position is Vec2 => position instanceof Vec2);

    if (atoms.length === 0) {
      return monomer.position;
    }

    const atomWeight = 1 / atoms.length;

    return atoms.reduce(
      (center, position) => center.addScaled(position, atomWeight),
      new Vec2(),
    );
  }
}
