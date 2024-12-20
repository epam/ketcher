import { Vec2 } from 'domain/entities';
import { HalfEdge } from 'application/render/view-model/HalfEdge';
import { BondType } from 'domain/entities/CoreBond';

export type BondSVGPath = {
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

export const BondDashArrayMap = {
  [BondType.Aromatic]: '6',
  [BondType.SingleDouble]: '6',
  [BondType.SingleAromatic]: '4 4 1 4',
  [BondType.DoubleAromatic]: '4 4 1 4',
  [BondType.Any]: '6',
  [BondType.Hydrogen]: '3',
};
