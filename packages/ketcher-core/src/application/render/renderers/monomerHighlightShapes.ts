/**
 * Geometry primitives used to describe a monomer's highlight silhouette.
 *
 * Each monomer renderer owns the shape that best matches its body (a rounded
 * square for sugars/peptides/CHEM, a diamond for RNA bases, a circle for
 * phosphates). `ReplacementHighlightView` collects these shapes — plus neck
 * shapes along the bonds — and combines them into a single outline.
 *
 * A shape is expressed as a signed-distance function (negative inside, zero on
 * the boundary) so that an arbitrary set of shapes can be unioned with `min`
 * and traced as one continuous contour, without SVG filters or a polygon-union
 * library.
 */

export type Point = { x: number; y: number };
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export interface MonomerHighlightShape {
  /** Signed distance from `point` to the shape boundary (negative inside). */
  signedDistance(point: Point): number;
  /** Axis-aligned bounding box of the shape. */
  bounds(): Bounds;
}

/** A rounded rectangle, optionally rotated (a diamond is a 45°-rotated square). */
export class RoundedRectHighlightShape implements MonomerHighlightShape {
  constructor(
    private readonly center: Point,
    private readonly halfWidth: number,
    private readonly halfHeight: number,
    private readonly angle = 0,
  ) {}

  signedDistance(point: Point): number {
    let dx = point.x - this.center.x;
    let dy = point.y - this.center.y;
    if (this.angle !== 0) {
      const cos = Math.cos(-this.angle);
      const sin = Math.sin(-this.angle);
      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;
      dx = rotatedX;
      dy = rotatedY;
    }
    const qx = Math.abs(dx) - this.halfWidth;
    const qy = Math.abs(dy) - this.halfHeight;
    const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
    const inside = Math.min(Math.max(qx, qy), 0);
    return outside + inside;
  }

  bounds(): Bounds {
    const cos = Math.abs(Math.cos(this.angle));
    const sin = Math.abs(Math.sin(this.angle));
    const extentX = this.halfWidth * cos + this.halfHeight * sin;
    const extentY = this.halfWidth * sin + this.halfHeight * cos;
    return {
      minX: this.center.x - extentX,
      maxX: this.center.x + extentX,
      minY: this.center.y - extentY,
      maxY: this.center.y + extentY,
    };
  }
}

export class CircleHighlightShape implements MonomerHighlightShape {
  constructor(
    private readonly center: Point,
    private readonly radius: number,
  ) {}

  signedDistance(point: Point): number {
    return (
      Math.hypot(point.x - this.center.x, point.y - this.center.y) - this.radius
    );
  }

  bounds(): Bounds {
    return {
      minX: this.center.x - this.radius,
      maxX: this.center.x + this.radius,
      minY: this.center.y - this.radius,
      maxY: this.center.y + this.radius,
    };
  }
}

/** A thick segment (capsule) used to bridge two monomers along a bond. */
export class SegmentHighlightShape implements MonomerHighlightShape {
  constructor(
    private readonly a: Point,
    private readonly b: Point,
    private readonly halfWidth: number,
  ) {}

  signedDistance(point: Point): number {
    const pax = point.x - this.a.x;
    const pay = point.y - this.a.y;
    const bax = this.b.x - this.a.x;
    const bay = this.b.y - this.a.y;
    const lengthSquared = bax * bax + bay * bay || 1;
    const t = Math.min(1, Math.max(0, (pax * bax + pay * bay) / lengthSquared));
    const dx = pax - bax * t;
    const dy = pay - bay * t;
    return Math.hypot(dx, dy) - this.halfWidth;
  }

  bounds(): Bounds {
    return {
      minX: Math.min(this.a.x, this.b.x) - this.halfWidth,
      maxX: Math.max(this.a.x, this.b.x) + this.halfWidth,
      minY: Math.min(this.a.y, this.b.y) - this.halfWidth,
      maxY: Math.max(this.a.y, this.b.y) + this.halfWidth,
    };
  }
}

/**
 * Convenience factory for a diamond (RNA base) shape whose bounding box equals
 * `size` × `size`: a square rotated 45° has a half-side of `size / (2 · √2)`.
 */
export const createDiamondHighlightShape = (
  center: Point,
  size: number,
): RoundedRectHighlightShape => {
  const halfSide = size / 2 / Math.SQRT2;
  return new RoundedRectHighlightShape(center, halfSide, halfSide, Math.PI / 4);
};
