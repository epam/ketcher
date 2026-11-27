import { Vec2 } from 'domain/entities/vec2';

export interface RectangleGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EllipseGeometry {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface LineGeometry {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function getRectangleGeometry([start, end]: [
  Vec2,
  Vec2,
]): RectangleGeometry {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function getEllipseGeometry([start, end]: [
  Vec2,
  Vec2,
]): EllipseGeometry {
  const rx = (end.x - start.x) / 2;
  const ry = (end.y - start.y) / 2;

  return {
    cx: start.x + rx,
    cy: start.y + ry,
    rx: Math.abs(rx),
    ry: Math.abs(ry),
  };
}

export function getLineGeometry([start, end]: [Vec2, Vec2]): LineGeometry {
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}

export function makeCircleFromEllipse(position0: Vec2, position1: Vec2): Vec2 {
  const diff = Vec2.diff(position1, position0);
  const min = Math.abs(diff.x) < Math.abs(diff.y) ? diff.x : diff.y;
  return new Vec2(
    position0.x + (diff.x > 0 ? 1 : -1) * Math.abs(min),
    position0.y + (diff.y > 0 ? 1 : -1) * Math.abs(min),
    0,
  );
}
