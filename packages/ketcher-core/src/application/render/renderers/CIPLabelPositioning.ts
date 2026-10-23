import { Vec2 } from 'domain/entities/vec2';

export const CIP_LABEL_COLLISION_PADDING = 2;
export const CIP_LABEL_PLACEMENT_ANGLE_STEPS = 24;
export const CIP_LABEL_PLACEMENT_DISTANCE_STEP = 2;
export const CIP_LABEL_MAX_EXTRA_DISTANCE = 60;

export interface BondSegment {
  start: Vec2;
  end: Vec2;
}

function segmentIntersectsRectangle(
  segment: BondSegment,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): boolean {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const p = [-dx, dx, -dy, dy];
  const q = [
    segment.start.x - minX,
    maxX - segment.start.x,
    segment.start.y - minY,
    maxY - segment.start.y,
  ];
  let minT = 0;
  let maxT = 1;

  for (let index = 0; index < p.length; index += 1) {
    if (p[index] === 0) {
      if (q[index] < 0) return false;
      continue;
    }

    const ratio = q[index] / p[index];
    if (p[index] < 0) {
      minT = Math.max(minT, ratio);
    } else {
      maxT = Math.min(maxT, ratio);
    }
    if (minT > maxT) return false;
  }

  return true;
}

export function doesCIPLabelOverlapBond(
  center: Vec2,
  width: number,
  height: number,
  bondSegments: readonly BondSegment[],
): boolean {
  const halfWidth = width / 2 + CIP_LABEL_COLLISION_PADDING;
  const halfHeight = height / 2 + CIP_LABEL_COLLISION_PADDING;

  return bondSegments.some((segment) =>
    segmentIntersectsRectangle(
      segment,
      center.x - halfWidth,
      center.y - halfHeight,
      center.x + halfWidth,
      center.y + halfHeight,
    ),
  );
}
