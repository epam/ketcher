import type { Atom } from './atom';
import type { Pool } from './pool';
import { Vec2 } from './vec2';

export function geometricCenter(positions: Vec2[]): Vec2 {
  return positions
    .reduce((sum, pp) => sum.add(pp), new Vec2(0, 0))
    .scaled(1 / positions.length);
}

export function getAtomPositions(atomIds: number[], atoms: Pool<Atom>): Vec2[] {
  return atomIds
    .map((id) => atoms.get(id)?.pp)
    .filter((pp): pp is Vec2 => pp !== null);
}
