/**
 * SVG path primitives used to describe a monomer's replacement-highlight
 * silhouette.
 *
 * Each monomer renderer owns the path that best matches its body:
 *   – hexagon for peptides
 *   – pentagon for unsplit nucleotides
 *   – rectangle for sugars/CHEM
 *   – diamond for RNA bases
 *   – circle for phosphates
 * `ReplacementHighlightView` collects those paths, adds capsule paths for
 * internal bonds, and combines everything with Paper.js boolean union.
 */

export type Point = { x: number; y: number };
export type HighlightPathData = string;

// Radius used only to soften replacement-highlight corners; it is clamped per
// shape below so tiny monomers cannot produce self-intersecting paths.
const HIGHLIGHT_CORNER_RADIUS = 13;
const DIAMOND_HIGHLIGHT_CORNER_RADIUS = 6;

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

/**
 * Expands a convex polygon outward by `offset` pixels using edge-normal
 * offsetting: each edge is shifted perpendicularly outward by `offset`, then
 * new vertices are placed at the intersection of adjacent shifted edges.
 *
 * This produces a geometrically accurate offset shape regardless of the angle
 * between adjacent edges (unlike simple radial scaling).
 *
 * Assumes CCW winding with the SVG y-axis pointing down (i.e. the "outward"
 * normal of an edge from A→B is (+dy, −dx) / len).
 */
const expandPolygon = (points: Point[], offset: number): Point[] => {
  const n = points.length;

  // Shift each edge outward by `offset` along its outward normal.
  const shiftedEdges = points.map((point, index) => {
    const next = points[(index + 1) % n];
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const len = Math.hypot(dx, dy);
    // Outward normal for CW polygon in SVG (y-down): (+dy, -dx) / len
    const nx = dy / len;
    const ny = -dx / len;

    return {
      x1: point.x + offset * nx,
      y1: point.y + offset * ny,
      x2: next.x + offset * nx,
      y2: next.y + offset * ny,
    };
  });

  // New vertices = intersections of consecutive shifted edges.
  return shiftedEdges.map((edge, index) => {
    const prev = shiftedEdges[(index - 1 + n) % n];
    const denom =
      (prev.x1 - prev.x2) * (edge.y1 - edge.y2) -
      (prev.y1 - prev.y2) * (edge.x1 - edge.x2);

    if (Math.abs(denom) < 1e-10) {
      return { x: (prev.x2 + edge.x1) / 2, y: (prev.y2 + edge.y1) / 2 };
    }

    const t =
      ((prev.x1 - edge.x1) * (edge.y1 - edge.y2) -
        (prev.y1 - edge.y1) * (edge.x1 - edge.x2)) /
      denom;

    return {
      x: prev.x1 + t * (prev.x2 - prev.x1),
      y: prev.y1 + t * (prev.y2 - prev.y1),
    };
  });
};

/**
 * Flat-top hexagon path matching the Peptide monomer body shape.
 *
 * The ratio 18.6583/70 is taken directly from the peptide SVG symbol: the
 * flat-corner x-coordinate (18.6583) divided by the full viewBox width (70).
 */
export const createHexagonHighlightPath = (
  center: Point,
  width: number,
  height: number,
  offset = 0,
): HighlightPathData => {
  // Ratio of flat-corner x-distance from the left edge to the total width,
  // derived from the peptide SVG path vertex at x=18.6583 in a 70-wide viewBox.
  const FLAT_X_RATIO = 18.6583 / 70;
  const halfW = width / 2;
  const halfH = height / 2;
  const innerX = halfW - FLAT_X_RATIO * width;

  const baseVerts: Point[] = [
    { x: center.x - innerX, y: center.y - halfH }, // top-left
    { x: center.x + innerX, y: center.y - halfH }, // top-right
    { x: center.x + halfW, y: center.y }, // right tip
    { x: center.x + innerX, y: center.y + halfH }, // bottom-right
    { x: center.x - innerX, y: center.y + halfH }, // bottom-left
    { x: center.x - halfW, y: center.y }, // left tip
  ];

  const verts = offset === 0 ? baseVerts : expandPolygon(baseVerts, offset);

  return createRoundedPolygonHighlightPath(verts, HIGHLIGHT_CORNER_RADIUS);
};

/**
 * Pentagon path matching the UnsplitNucleotide monomer body shape: a flat
 * bottom edge with two upper angled sides converging at a single top tip.
 *
 * All ratios are derived from the nucleotide SVG path vertices after applying
 * the `rotate(180, 42, 42)` transform and the implicit 2× viewBox scaling
 * (viewBox 84×84 rendered at 42×42). The two asymmetric side vertices in the
 * original path are averaged to produce a symmetric shape.
 */
export const createNucleotideHighlightPath = (
  center: Point,
  width: number,
  height: number,
  offset = 0,
): HighlightPathData => {
  // Ratios derived from nucleotide SVG vertex coordinates (post-transform,
  // rendered size 42×42). Side vertex dx is the average of the original left
  // (16.840) and right (16.372) values to produce a symmetric shape.
  const TIP_DY_RATIO = -14.701 / 42; // top-tip y offset from center (≈ −0.350)
  const SIDE_DX_RATIO = 16.606 / 42; // |x| of upper side vertices (≈ +0.395)
  const SIDE_DY_RATIO = -4.815 / 42; // y of upper side vertices (≈ −0.115)
  const FLAT_DX_RATIO = 11.706 / 42; // |x| of flat-bottom corners (≈ +0.279)
  const FLAT_DY_RATIO = 15.0 / 42; // y of flat-bottom corners (≈ +0.357)

  const baseVerts: Point[] = [
    { x: center.x, y: center.y + TIP_DY_RATIO * height }, // top tip
    {
      x: center.x + SIDE_DX_RATIO * width,
      y: center.y + SIDE_DY_RATIO * height,
    }, // right-upper
    {
      x: center.x + FLAT_DX_RATIO * width,
      y: center.y + FLAT_DY_RATIO * height,
    }, // bottom-right
    {
      x: center.x - FLAT_DX_RATIO * width,
      y: center.y + FLAT_DY_RATIO * height,
    }, // bottom-left
    {
      x: center.x - SIDE_DX_RATIO * width,
      y: center.y + SIDE_DY_RATIO * height,
    }, // left-upper
  ];

  const verts = offset === 0 ? baseVerts : expandPolygon(baseVerts, offset);

  return createRoundedPolygonHighlightPath(verts, HIGHLIGHT_CORNER_RADIUS);
};

export const createDiamondHighlightPath = (
  center: Point,
  width: number,
  height: number,
  offset = 0,
): HighlightPathData => {
  // Diamond edges are at 45°, so moving each edge outward by `offset` expands
  // the axis-aligned half-size by offset · √2.
  const halfWidth = width / 2 + offset;
  const halfHeight = height / 2 + offset;
  const top = { x: center.x, y: center.y - halfHeight };
  const right = { x: center.x + halfWidth, y: center.y };
  const bottom = { x: center.x, y: center.y + halfHeight };
  const left = { x: center.x - halfWidth, y: center.y };

  return createRoundedPolygonHighlightPath(
    [top, right, bottom, left],
    DIAMOND_HIGHLIGHT_CORNER_RADIUS,
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
