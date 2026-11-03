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

// Clearance applied to a dative bond's arrowhead tip at an unlabeled end atom so that
// multiple dative arrowheads converging on the same atom do not overlap.
export const DATIVE_ARROW_END_OFFSET = 7;

export const BondDashArrayMap = {
  [BondType.Aromatic]: '6',
  [BondType.SingleDouble]: '6',
  [BondType.SingleAromatic]: '4 4 1 4',
  [BondType.DoubleAromatic]: '4 4 1 4',
  [BondType.Any]: '6',
  [BondType.Hydrogen]: '3',
};
