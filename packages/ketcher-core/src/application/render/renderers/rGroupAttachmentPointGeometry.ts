import type { Atom } from 'domain/entities/CoreAtom';
import { Bond, BondType } from 'domain/entities/CoreBond';
import type { RGroupAttachmentPointType } from 'domain/entities/rgroupAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';
import { attachmentPointDirection } from 'application/render/geometry/atomGeometry';

/** Adapt current macro bond coordinates to the shared AP calculation. */
export function getRGroupAttachmentPointDirection(
  atom: Atom,
  type: RGroupAttachmentPointType,
  both: boolean,
): Vec2 {
  const neighbors = atom.bonds.map((bond) => {
    const otherPosition =
      bond instanceof Bond
        ? (bond.firstAtom === atom ? bond.secondAtom : bond.firstAtom).position
        : bond.monomer.position;
    const direction = otherPosition.sub(atom.position);
    return {
      angle: Math.atan2(direction.y, direction.x),
      isTriple: bond instanceof Bond && bond.type === BondType.Triple,
    };
  });
  // Preserve the existing macro layout for two APs on an isolated atom.
  if (!neighbors.length && both) {
    const angle = type === 'primary' ? (-2 * Math.PI) / 3 : -Math.PI / 3;
    return new Vec2(Math.cos(angle), Math.sin(angle));
  }
  return attachmentPointDirection(neighbors, type, both);
}
