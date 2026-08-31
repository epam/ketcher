import type { BaseRenderer } from 'application/render';
import type { SGroupRenderer } from 'application/render/renderers/SGroupRenderer';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { SGroup } from 'domain/entities/sgroup';
import { Vec2 } from 'domain/entities/vec2';

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
    if (this.isSelectableDataSGroup && this.sgroup.pp) {
      return this.sgroup.pp;
    }

    return SGroupDrawingEntity.getCenter(this.sgroup, this.monomer);
  }

  public get isSelectableDataSGroup(): boolean {
    return this.sgroup.type === SGroup.TYPES.DAT && !this.sgroup.data.attached;
  }

  public moveRelative(position: Vec2): void {
    if (this.isSelectableDataSGroup) {
      this.sgroup.pp?.add_(position);

      return;
    }

    super.moveRelative(position);
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
