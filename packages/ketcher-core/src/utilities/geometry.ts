import { Vec2 } from 'domain/entities/vec2';

export function geometricCenter(positions: Vec2[]): Vec2 {
  return positions
    .reduce((sum, pp) => sum.add(pp), new Vec2(0, 0))
    .scaled(1 / positions.length);
}
