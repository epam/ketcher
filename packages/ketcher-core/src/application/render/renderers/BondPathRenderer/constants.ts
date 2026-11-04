import type { Vec2 } from 'domain/entities/vec2';
import type { HalfEdge } from 'application/render/view-model/HalfEdge';
import { BondType } from 'domain/entities/CoreBond';

export type SVGPathAttributes = {
  d: string;
  attrs: Record<string, string | number>;
};

export type BondVectors = {
  startPosition: Vec2;
  endPosition: Vec2;
  firstHalfEdge: HalfEdge;
  secondHalfEdge: HalfEdge;
};

export const BondWidth = 2;
export const StereoBondWidth = 6;
export const BondSpace = 6;
export const LinesOffset = BondSpace / 2;

// `#arrow-marker` is 5 units long and centered on the line end (refX = 2.5), in
// stroke-width units. Shortening the line by half of it puts the tip on the end point.
export const DativeArrowTipOffset = 2.5 * BondWidth;

export const BondDashArrayMap = {
  [BondType.Aromatic]: '6',
  [BondType.SingleDouble]: '6',
  [BondType.SingleAromatic]: '4 4 1 4',
  [BondType.DoubleAromatic]: '4 4 1 4',
  [BondType.Any]: '6',
  [BondType.Hydrogen]: '3',
};
