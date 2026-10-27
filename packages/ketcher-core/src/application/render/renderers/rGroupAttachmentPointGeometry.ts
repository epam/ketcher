import type { Atom } from 'domain/entities/CoreAtom';
import { Bond, BondType } from 'domain/entities/CoreBond';
import type { RGroupAttachmentPointType } from 'domain/entities/rgroupAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';

/** Resolve from current coordinates, including after a macro atom move. */
export function getRGroupAttachmentPointDirection(
  atom: Atom,
  type: RGroupAttachmentPointType,
  both: boolean,
): Vec2 {
  const bonds = atom.bonds.filter((bond): bond is Bond => bond instanceof Bond);
  const angles = bonds
    .map((bond) => {
      const other = bond.firstAtom === atom ? bond.secondAtom : bond.firstAtom;
      const direction = other.position.sub(atom.position);
      return Math.atan2(direction.y, direction.x);
    })
    .sort((a, b) => a - b);
  let angle = -Math.PI / 2;
  if (!angles.length && both) {
    angle = type === 'primary' ? (-2 * Math.PI) / 3 : -Math.PI / 3;
  } else if (angles.length === 1 && !both) {
    angle =
      angles[0] +
      (bonds[0].type === BondType.Triple ? Math.PI : (2 * Math.PI) / 3);
  } else if (angles.length) {
    let largest = -1;
    let start = angles[0];
    angles.forEach((value, index) => {
      const next =
        index === angles.length - 1
          ? angles[0] + 2 * Math.PI
          : angles[index + 1];
      if (next - value > largest) {
        largest = next - value;
        start = value;
      }
    });
    const fraction = both ? (type === 'primary' ? 1 / 3 : 2 / 3) : 1 / 2;
    angle = start + largest * fraction;
  }
  return new Vec2(Math.cos(angle), Math.sin(angle));
}
