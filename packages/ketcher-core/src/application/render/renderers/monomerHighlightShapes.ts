/**
 * SVG path primitives used to describe a monomer's replacement-highlight
 * silhouette.
 *
 * Each monomer renderer owns the path that best matches its body (a rectangle
 * for sugars/peptides/CHEM, a diamond for RNA bases, a circle for phosphates).
 * `ReplacementHighlightView` collects those paths, adds capsule paths for
 * internal bonds, and combines everything with Paper.js boolean union.
 */

export type Point = { x: number; y: number };
export type HighlightPathData = string;

// Radius used only to soften replacement-highlight corners; it is clamped per
// shape below so tiny monomers cannot produce self-intersecting paths.
const HIGHLIGHT_CORNER_RADIUS = 6;

const formatCoordinate = (value: number): string => {
  const roundedValue = Number(value.toFixed(2));

  return Object.is(roundedValue, -0) ? '0' : String(roundedValue);
};

const pointToPath = (point: Point): string =>
  `${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`;

const getDistance = (from: Point, to: Point): number =>
  Math.hypot(to.x - from.x, to.y - from.y);

const getPointTowards = (from: Point, to: Point, distance: number): Point => {
  const fullDistance = getDistance(from, to);

  if (fullDistance === 0) {
    return from;
  }

  const ratio = distance / fullDistance;

  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
};

const createPolygonHighlightPath = (points: Point[]): HighlightPathData =>
  `${points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${pointToPath(point)}`)
    .join(' ')} Z`;

const createRoundedPolygonHighlightPath = (
  points: Point[],
  cornerRadius: number,
): HighlightPathData => {
  if (points.length < 3 || cornerRadius <= 0) {
    return createPolygonHighlightPath(points);
  }

  const roundedCorners = points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const maxDistance = Math.min(
      cornerRadius,
      getDistance(point, previous) / 2,
      getDistance(point, next) / 2,
    );

    return {
      point,
      incoming: getPointTowards(point, previous, maxDistance),
      outgoing: getPointTowards(point, next, maxDistance),
    };
  });
  const [firstCorner, ...restCorners] = roundedCorners;

  return `M ${pointToPath(firstCorner.outgoing)} ${restCorners
    .map(
      ({ point, incoming, outgoing }) =>
        `L ${pointToPath(incoming)} Q ${pointToPath(point)} ${pointToPath(
          outgoing,
        )}`,
    )
    .join(' ')} L ${pointToPath(firstCorner.incoming)} Q ${pointToPath(
    firstCorner.point,
  )} ${pointToPath(firstCorner.outgoing)} Z`;
};

export const createRectHighlightPath = (
  center: Point,
  width: number,
  height: number,
  offset = 0,
): HighlightPathData => {
  const halfWidth = width / 2 + offset;
  const halfHeight = height / 2 + offset;
  const left = center.x - halfWidth;
  const right = center.x + halfWidth;
  const top = center.y - halfHeight;
  const bottom = center.y + halfHeight;

  return createRoundedPolygonHighlightPath(
    [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ],
    HIGHLIGHT_CORNER_RADIUS,
  );
};

export const createCircleHighlightPath = (
  center: Point,
  radius: number,
  offset = 0,
): HighlightPathData => {
  const inflatedRadius = radius + offset;
  const left = center.x - inflatedRadius;
  const right = center.x + inflatedRadius;
  const radiusPath = formatCoordinate(inflatedRadius);

  return `M ${formatCoordinate(right)} ${formatCoordinate(
    center.y,
  )} A ${radiusPath} ${radiusPath} 0 1 0 ${formatCoordinate(
    left,
  )} ${formatCoordinate(
    center.y,
  )} A ${radiusPath} ${radiusPath} 0 1 0 ${formatCoordinate(
    right,
  )} ${formatCoordinate(center.y)} Z`;
};

export const createDiamondHighlightPath = (
  center: Point,
  size: number,
  offset = 0,
): HighlightPathData => {
  // Diamond edges are at 45°, so moving each edge outward by `offset` expands
  // the axis-aligned half-size by offset · √2.
  const halfSize = size / 2 + offset * Math.SQRT2;
  const top = { x: center.x, y: center.y - halfSize };
  const right = { x: center.x + halfSize, y: center.y };
  const bottom = { x: center.x, y: center.y + halfSize };
  const left = { x: center.x - halfSize, y: center.y };

  return createRoundedPolygonHighlightPath(
    [top, right, bottom, left],
    HIGHLIGHT_CORNER_RADIUS,
  );
};

/** A capsule path used to bridge two monomers along an internal polymer bond. */
export const createSegmentHighlightPath = (
  start: Point,
  end: Point,
  halfWidth: number,
): HighlightPathData => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return createCircleHighlightPath(start, halfWidth);
  }

  const normalX = (-dy / length) * halfWidth;
  const normalY = (dx / length) * halfWidth;
  const startTop = { x: start.x + normalX, y: start.y + normalY };
  const endTop = { x: end.x + normalX, y: end.y + normalY };
  const endBottom = { x: end.x - normalX, y: end.y - normalY };
  const startBottom = { x: start.x - normalX, y: start.y - normalY };
  const radiusPath = formatCoordinate(halfWidth);

  return `M ${pointToPath(startTop)} L ${pointToPath(
    endTop,
  )} A ${radiusPath} ${radiusPath} 0 0 1 ${pointToPath(
    endBottom,
  )} L ${pointToPath(
    startBottom,
  )} A ${radiusPath} ${radiusPath} 0 0 1 ${pointToPath(startTop)} Z`;
};
