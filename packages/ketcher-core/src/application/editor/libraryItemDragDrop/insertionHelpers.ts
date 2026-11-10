/**
 * Pure helpers for the "insert a library item into a polymer bond" drag-drop
 * feature (issue #7925). They work on plain data (ids, vectors, AP names) so
 * they can be unit-tested without a canvas.
 *
 * All lengths are in model space (Å).
 */

import { AttachmentPointName } from 'domain/types';

/**
Outer bond-proximity distance (canvas px) at which the insertion circle shows. TBD with UX.
*/
export const DRAG_INSERT_OUTER_THRESHOLD_PX = 20;
/**
Inner bond-proximity distance (canvas px) at which the insertion circle grows. TBD with UX.
*/
export const DRAG_INSERT_INNER_THRESHOLD_PX = 10;
/**
Minimal length (Å) of a bond that receives an inserted monomer.
*/
export const MIN_INSERTION_BOND_LENGTH_ANGSTROM = 3;
/**
Phosphate-preset triangle side B: preset component to sugar–phosphate bond centre (Å).
*/
export const PRESET_TRIANGLE_SIDE_B_ANGSTROM = 0.75;
/**
Phosphate-preset triangle side A: original monomer to the preset component it bonds with (Å).
*/
export const PRESET_TRIANGLE_SIDE_A_ANGSTROM = 1.5;

export type Point = { x: number; y: number };

// ---------------------------------------------------------------------------
// Geometry: bond extension
// ---------------------------------------------------------------------------

/**
 * Angle (radians, 0..π/2) between the segment `from → to` and a horizontal line.
 */
export function getAngleToHorizontal(from: Point, to: Point): number {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  return Math.atan2(dy, dx);
}

/**
 * Side C of the triangle (A, B, C) where A is opposite the angle α, i.e.
 * A² = B² + C² − 2·B·C·cos α, taking the positive root:
 * C = B·cos α + √(A² − B²·sin² α).
 */
export function computeTriangleSideC(alpha: number): number {
  const a = PRESET_TRIANGLE_SIDE_A_ANGSTROM;
  const b = PRESET_TRIANGLE_SIDE_B_ANGSTROM;
  const sinAlpha = Math.sin(alpha);
  return b * Math.cos(alpha) + Math.sqrt(a * a - b * b * sinAlpha * sinAlpha);
}

/**
 * Length (Å) the bond must have after inserting a phosphate-containing preset:
 * 2C, where C comes from {@link computeTriangleSideC}.
 */
export function getPhosphatePresetRequiredBondLength(alpha: number): number {
  return 2 * computeTriangleSideC(alpha);
}

/**
 * Length the original bond has after insertion. Never shorter than the current
 * length; a plain monomer / phosphateless preset needs at least 3 Å, a
 * phosphate-containing preset at least 2C.
 */
export function getExtendedBondLength(
  currentLength: number,
  from: Point,
  to: Point,
  hasPhosphate: boolean,
): number {
  const required = hasPhosphate
    ? getPhosphatePresetRequiredBondLength(getAngleToHorizontal(from, to))
    : MIN_INSERTION_BOND_LENGTH_ANGSTROM;
  return Math.max(currentLength, required);
}

// ---------------------------------------------------------------------------
// Graph helpers
// ---------------------------------------------------------------------------

export type GraphEdge = [number, number];

function buildAdjacency(edges: GraphEdge[]): Map<number, number[]> {
  const adjacency = new Map<number, number[]>();
  for (const [a, b] of edges) {
    if (!adjacency.has(a)) adjacency.set(a, []);
    if (!adjacency.has(b)) adjacency.set(b, []);
    adjacency.get(a)?.push(b);
    adjacency.get(b)?.push(a);
  }
  return adjacency;
}

function collectReachable(
  start: number,
  adjacency: Map<number, number[]>,
): Set<number> {
  const visited = new Set<number>([start]);
  const stack = [start];
  while (stack.length) {
    const current = stack.pop() as number;
    for (const next of adjacency.get(current) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        stack.push(next);
      }
    }
  }
  return visited;
}

/**
 * Ids reachable from `start` when the edge `bond` is ignored.
 * `edges` is the full edge list and may contain `bond`.
 */
export function getReachableWithoutBond(
  start: number,
  bond: GraphEdge,
  edges: GraphEdge[],
): Set<number> {
  const remaining = edges.filter(
    ([a, b]) =>
      !((a === bond[0] && b === bond[1]) || (a === bond[1] && b === bond[0])),
  );
  const adjacency = buildAdjacency(remaining);
  return collectReachable(start, adjacency);
}

/**
 * A bond is part of a circular structure when its endpoints stay connected
 * after the bond itself is removed.
 */
export function isBondInCycle(bond: GraphEdge, edges: GraphEdge[]): boolean {
  return getReachableWithoutBond(bond[0], bond, edges).has(bond[1]);
}

// ---------------------------------------------------------------------------
// Geometry: shift set
// ---------------------------------------------------------------------------

/**
 * Orders the bond ends into [leftTop, rightBottom]: the end with the larger x
 * is "right"; on equal x the one with the larger y is "bottom".
 */
export function orderBondEnds<T extends Point>(a: T, b: T): [T, T] {
  if (a.x !== b.x) return a.x < b.x ? [a, b] : [b, a];
  return a.y <= b.y ? [a, b] : [b, a];
}

/**
 * Unit vector along the bond from the left/top to the right/bottom end
 * (zero vector for a degenerate bond).
 */
export function getBondDirection(leftTop: Point, rightBottom: Point): Point {
  const dx = rightBottom.x - leftTop.x;
  const dy = rightBottom.y - leftTop.y;
  const length = Math.hypot(dx, dy);
  return length === 0 ? { x: 0, y: 0 } : { x: dx / length, y: dy / length };
}

export type PositionedNode = { id: number; position: Point };

/**
 * Ids of monomers that must move by the bond-extension delta.
 *
 *  - Linear chain: everything connected to the right/bottom end once the bond
 *    is removed.
 *  - Circular structure: every monomer whose projection on the bond direction
 *    lies beyond the line perpendicular to the bond through its midpoint, so
 *    the angles between them and the right/bottom end are preserved.
 *
 * The left/top end itself never moves.
 */
export function computeShiftSet(params: {
  bond: GraphEdge;
  leftTopId: number;
  rightBottomId: number;
  nodes: PositionedNode[];
  edges: GraphEdge[];
}): Set<number> {
  const { bond, leftTopId, rightBottomId, nodes, edges } = params;
  if (!isBondInCycle(bond, edges)) {
    const reachable = getReachableWithoutBond(rightBottomId, bond, edges);
    reachable.delete(leftTopId);
    return reachable;
  }

  const leftTop = nodes.find((n) => n.id === leftTopId);
  const rightBottom = nodes.find((n) => n.id === rightBottomId);
  if (!leftTop || !rightBottom) return new Set();
  const direction = getBondDirection(leftTop.position, rightBottom.position);
  const middle = {
    x: (leftTop.position.x + rightBottom.position.x) / 2,
    y: (leftTop.position.y + rightBottom.position.y) / 2,
  };
  const shifted = new Set<number>();
  for (const node of nodes) {
    if (node.id === leftTopId) continue;
    const projection =
      (node.position.x - middle.x) * direction.x +
      (node.position.y - middle.y) * direction.y;
    if (projection > 0 || node.id === rightBottomId) shifted.add(node.id);
  }
  return shifted;
}

// ---------------------------------------------------------------------------
// Default attachment-point resolution
// ---------------------------------------------------------------------------

const { R1, R2, R3 } = AttachmentPointName;

export type InsertionMonomerKind = 'sugar' | 'base' | 'other';

export type InsertionFailure = 'dialog' | 'single-ap-error' | 'preset-error';

export type MonomerInsertionResolution =
  | {
      status: 'resolved';
      kind: 'monomer';
      /**
      AP of the new monomer that bonds with the left/top original monomer
      */
      leftAp: AttachmentPointName;
      /**
      AP of the new monomer that bonds with the right/bottom original monomer
      */
      rightAp: AttachmentPointName;
    }
  | {
      status: 'failed';
      kind: 'monomer';
      failure: 'dialog' | 'single-ap-error';
    };

export type PresetComponentName = 'sugar' | 'phosphate';

export type PresetInsertionResolution =
  | {
      status: 'resolved';
      kind: 'preset';
      leftComponent: PresetComponentName;
      leftAp: AttachmentPointName;
      rightComponent: PresetComponentName;
      rightAp: AttachmentPointName;
      /**
      True when the preset runs against its library direction (R1 side on the right)
      */
      flipped: boolean;
    }
  | { status: 'failed'; kind: 'preset'; failure: 'preset-error' };

function complementAp(ap: AttachmentPointName): AttachmentPointName | null {
  if (ap === R1) return R2;
  if (ap === R2) return R1;
  return null;
}

/**
 * The AP that the new monomer must use to bond with an original monomer
 * attached through `originalAp`:
 *  - sugar R3 ↔ base R1,
 *  - otherwise R1 ↔ R2 (the default for amino acids, sugars, phosphates and
 *    unsplit nucleotides, and the sequence-mode fallback for the rest).
 */
export function getDefaultPartnerAp(
  originalKind: InsertionMonomerKind,
  originalAp: AttachmentPointName,
  newKind: InsertionMonomerKind,
): AttachmentPointName | null {
  if (originalKind === 'sugar' && newKind === 'base' && originalAp === R3) {
    return R1;
  }
  if (originalKind === 'base' && newKind === 'sugar' && originalAp === R1) {
    return R3;
  }
  return complementAp(originalAp);
}

/**
 * Resolves the APs a single dropped monomer uses on the two new bonds.
 */
export function resolveMonomerInsertion(params: {
  left: { kind: InsertionMonomerKind; ap: AttachmentPointName };
  right: { kind: InsertionMonomerKind; ap: AttachmentPointName };
  newMonomer: {
    kind: InsertionMonomerKind;
    attachmentPoints: AttachmentPointName[];
  };
}): MonomerInsertionResolution {
  const { left, right, newMonomer } = params;
  const available = newMonomer.attachmentPoints;

  if (available.length < 2) {
    return { status: 'failed', kind: 'monomer', failure: 'single-ap-error' };
  }

  const leftAp = getDefaultPartnerAp(left.kind, left.ap, newMonomer.kind);
  const rightAp = getDefaultPartnerAp(right.kind, right.ap, newMonomer.kind);

  if (
    leftAp &&
    rightAp &&
    leftAp !== rightAp &&
    available.includes(leftAp) &&
    available.includes(rightAp)
  ) {
    return { status: 'resolved', kind: 'monomer', leftAp, rightAp };
  }
  return { status: 'failed', kind: 'monomer', failure: 'dialog' };
}

/**
 * Resolves which preset components (sugar / phosphate) bond with the two
 * original monomers. Only the sugar and phosphate are used (req. 4.1).
 *
 * The preset's external APs follow from its phosphate position: with a left
 * (5′) phosphate the phosphate exposes R1 and the sugar R2; with a right (3′)
 * phosphate the sugar exposes R1 and the phosphate R2. The preset is flipped
 * when the original bond requires R2 on its left/top side.
 */
export function resolvePresetInsertion(params: {
  left: { kind: InsertionMonomerKind; ap: AttachmentPointName };
  right: { kind: InsertionMonomerKind; ap: AttachmentPointName };
  hasPhosphate: boolean;
  phosphatePosition?: 'left' | 'right';
}): PresetInsertionResolution {
  const { left, right, hasPhosphate } = params;
  const failed: PresetInsertionResolution = {
    status: 'failed',
    kind: 'preset',
    failure: 'preset-error',
  };

  const externals: Record<
    'forward',
    { r1: PresetComponentName; r2: PresetComponentName }
  > = hasPhosphate
    ? params.phosphatePosition === 'right'
      ? { forward: { r1: 'sugar', r2: 'phosphate' } }
      : { forward: { r1: 'phosphate', r2: 'sugar' } }
    : { forward: { r1: 'sugar', r2: 'sugar' } };

  const leftAp = getDefaultPartnerAp(left.kind, left.ap, 'sugar');
  const rightAp = getDefaultPartnerAp(right.kind, right.ap, 'sugar');
  if (!leftAp || !rightAp || leftAp === rightAp) return failed;

  const flipped = leftAp === R2;
  const componentFor = (ap: AttachmentPointName): PresetComponentName =>
    ap === R1 ? externals.forward.r1 : externals.forward.r2;

  return {
    status: 'resolved',
    kind: 'preset',
    leftComponent: componentFor(leftAp),
    leftAp,
    rightComponent: componentFor(rightAp),
    rightAp,
    flipped,
  };
}
