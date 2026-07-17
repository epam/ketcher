import type { Vec2 } from 'domain/entities/vec2';
import type { HalfEdge } from 'application/render/view-model/HalfEdge';
import type { BondType } from 'domain/entities/CoreBond';

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

export const BondDashArrayMap: Partial<Record<BondType, string>> = {
  4: '6',
  5: '6',
  6: '4 4 1 4',
  7: '4 4 1 4',
  8: '6',
  10: '3',
};
