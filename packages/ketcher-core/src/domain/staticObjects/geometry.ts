import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';
import type {
  Box,
  BoxHandle,
  Handle,
  HitResult,
  HitTolerance,
  ShapeGeometry,
} from './types';

const BOX_HANDLES_ON_EDGES: ReadonlyArray<BoxHandle> = [
  'top',
  'right',
  'bottom',
  'left',
];

export function boxFromPoints(first: Vec2, second: Vec2): Box {
  return {
    min: new Vec2(Math.min(first.x, second.x), Math.min(first.y, second.y)),
    max: new Vec2(Math.max(first.x, second.x), Math.max(first.y, second.y)),
  };
}

export function getBoundingBox(shape: ShapeGeometry): Box {
  return boxFromPoints(shape.start, shape.end);
}

export function getCenter(shape: ShapeGeometry): Vec2 {
  return Vec2.centre(shape.start, shape.end);
}

export function getBoxHandles(box: Box): ReadonlyMap<BoxHandle, Vec2> {
  const { min, max } = box;
  const middle = Vec2.centre(min, max);

  return new Map<BoxHandle, Vec2>([
    ['top', new Vec2(middle.x, min.y)],
    ['right', new Vec2(max.x, middle.y)],
    ['bottom', new Vec2(middle.x, max.y)],
    ['left', new Vec2(min.x, middle.y)],
    ['topLeft', new Vec2(min.x, min.y)],
    ['bottomLeft', new Vec2(min.x, max.y)],
    ['bottomRight', new Vec2(max.x, max.y)],
    ['topRight', new Vec2(max.x, min.y)],
  ]);
}

export function getHandles(shape: ShapeGeometry): ReadonlyMap<Handle, Vec2> {
  if (shape.kind === SimpleObjectMode.line) {
    return new Map<Handle, Vec2>([
      ['start', new Vec2(shape.start.x, shape.start.y, 0)],
      ['end', new Vec2(shape.end.x, shape.end.y, 0)],
    ]);
  }

  return getBoxHandles(getBoundingBox(shape));
}

export function getHandlesOnOutline(
  shape: ShapeGeometry,
): ReadonlyMap<Handle, Vec2> {
  const handles = getHandles(shape);

  if (shape.kind !== SimpleObjectMode.ellipse) {
    return handles;
  }

  return new Map(
    [...handles].filter(([handle]) =>
      BOX_HANDLES_ON_EDGES.includes(handle as BoxHandle),
    ),
  );
}

function distanceToBoxOutline(box: Box, point: Vec2): number {
  const { min, max } = box;
  const isInside =
    point.x >= min.x &&
    point.x <= max.x &&
    point.y >= min.y &&
    point.y <= max.y;

  if (isInside) {
    return Math.min(
      point.x - min.x,
      max.x - point.x,
      point.y - min.y,
      max.y - point.y,
    );
  }

  const dx = Math.max(min.x - point.x, 0, point.x - max.x);
  const dy = Math.max(min.y - point.y, 0, point.y - max.y);

  return Math.hypot(dx, dy);
}

function distanceToEllipseOutline(shape: ShapeGeometry, point: Vec2): number {
  const radius = Vec2.diff(shape.end, shape.start);
  const rx = radius.x / 2;
  const ry = radius.y / 2;

  if (rx === 0 || ry === 0) {
    return point.calculateDistanceToLine([shape.start, shape.end]);
  }

  const center = Vec2.sum(shape.start, new Vec2(rx, ry));
  const pointToCenter = Vec2.diff(point, center);

  return Math.abs(
    1 -
      (pointToCenter.x * pointToCenter.x) / (rx * rx) -
      (pointToCenter.y * pointToCenter.y) / (ry * ry),
  );
}

export function distanceToOutline(shape: ShapeGeometry, point: Vec2): number {
  switch (shape.kind) {
    case SimpleObjectMode.ellipse:
      return distanceToEllipseOutline(shape, point);
    case SimpleObjectMode.rectangle:
      return distanceToBoxOutline(getBoundingBox(shape), point);
    case SimpleObjectMode.line:
      return point.calculateDistanceToLine([shape.start, shape.end]);
    default:
      throw new Error('Unsupported shape type');
  }
}

export function findNearestHandle(
  handles: ReadonlyMap<Handle, Vec2>,
  point: Vec2,
): { handle: Handle | null; position: Vec2 | null; distance: number } {
  let nearest: {
    handle: Handle | null;
    position: Vec2 | null;
    distance: number;
  } = { handle: null, position: null, distance: Infinity };

  handles.forEach((position, handle) => {
    const distance = Vec2.dist(point, position);
    if (distance <= nearest.distance) {
      nearest = { handle, position, distance };
    }
  });

  return nearest;
}

export function hitTest(
  shape: ShapeGeometry,
  point: Vec2,
  tolerance: HitTolerance,
): HitResult | null {
  const nearest = findNearestHandle(getHandles(shape), point);
  const distance = Math.min(nearest.distance, distanceToOutline(shape, point));

  if (distance >= tolerance.outline) {
    return null;
  }

  const isHandleHit = nearest.distance <= tolerance.handle;

  return {
    distance,
    handle: isHandleHit ? nearest.handle : null,
    handlePosition: isHandleHit ? nearest.position : null,
  };
}

export function moveShape(shape: ShapeGeometry, delta: Vec2): ShapeGeometry {
  return {
    kind: shape.kind,
    start: shape.start.add(delta),
    end: shape.end.add(delta),
  };
}

function pickPointIndex(
  startCoordinate: number,
  endCoordinate: number,
  side: 'min' | 'max',
): 0 | 1 {
  if (side === 'max') {
    return endCoordinate >= startCoordinate ? 1 : 0;
  }
  return endCoordinate <= startCoordinate ? 1 : 0;
}

const HORIZONTAL_SIDE: Partial<Record<Handle, 'min' | 'max'>> = {
  left: 'min',
  topLeft: 'min',
  bottomLeft: 'min',
  right: 'max',
  topRight: 'max',
  bottomRight: 'max',
};

const VERTICAL_SIDE: Partial<Record<Handle, 'min' | 'max'>> = {
  top: 'min',
  topLeft: 'min',
  topRight: 'min',
  bottom: 'max',
  bottomLeft: 'max',
  bottomRight: 'max',
};

export function resizeShape(
  shape: ShapeGeometry,
  handle: Handle,
  pointer: Vec2,
): ShapeGeometry {
  if (handle === 'start' || handle === 'end') {
    return {
      kind: shape.kind,
      start: handle === 'start' ? new Vec2(pointer.x, pointer.y) : shape.start,
      end: handle === 'end' ? new Vec2(pointer.x, pointer.y) : shape.end,
    };
  }

  const points = [new Vec2(shape.start), new Vec2(shape.end)];
  const horizontalSide = HORIZONTAL_SIDE[handle];
  const verticalSide = VERTICAL_SIDE[handle];

  if (horizontalSide) {
    points[pickPointIndex(shape.start.x, shape.end.x, horizontalSide)].x =
      pointer.x;
  }
  if (verticalSide) {
    points[pickPointIndex(shape.start.y, shape.end.y, verticalSide)].y =
      pointer.y;
  }

  return { kind: shape.kind, start: points[0], end: points[1] };
}

export function resizeBox(box: Box, handle: BoxHandle, pointer: Vec2): Box {
  const min = new Vec2(box.min);
  const max = new Vec2(box.max);
  const horizontalSide = HORIZONTAL_SIDE[handle];
  const verticalSide = VERTICAL_SIDE[handle];

  if (horizontalSide === 'min') min.x = pointer.x;
  if (horizontalSide === 'max') max.x = pointer.x;
  if (verticalSide === 'min') min.y = pointer.y;
  if (verticalSide === 'max') max.y = pointer.y;

  return { min, max };
}

export function constrainToCircle(start: Vec2, end: Vec2): Vec2 {
  const diff = Vec2.diff(end, start);
  const side = Math.min(Math.abs(diff.x), Math.abs(diff.y));

  return new Vec2(
    start.x + (diff.x > 0 ? 1 : -1) * side,
    start.y + (diff.y > 0 ? 1 : -1) * side,
    0,
  );
}
