import type { Atom } from 'domain/entities/atom';
import type { Pool } from 'domain/entities/pool';
import { Vec2 } from 'domain/entities/vec2';

export function geometricCenter(positions: Vec2[]): Vec2 {
  let sum = new Vec2(0, 0);
  positions.forEach((position) => {
    sum = sum.add(position);
  });
  return sum.scaled(1 / positions.length);
}

export function getAtomPositions(atomIds: number[], atoms: Pool<Atom>): Vec2[] {
  return atomIds
    .map((id) => atoms.get(id)?.pp)
    .filter((pp): pp is Vec2 => pp !== null);
}
