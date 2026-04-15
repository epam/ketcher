import { Bond, Struct } from 'domain/entities';
import {
  LonePairAnchor,
  LonePairDisplayOverride,
  RenderOptions,
} from 'application/render/render.types';
import { Render } from 'application/render/raphaelRender';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnchorPlacement = {
  anchor: LonePairAnchor;
  score: number;
  dot1: { x: number; y: number };
  dot2: { x: number; y: number };
};

type BBox = { x: number; y: number; width: number; height: number };

export type LonePairContext = {
  label: string;
  charge: number;
  radical: number;
  bondOrderSum: number;
  implicitHs: number;
};

// ---------------------------------------------------------------------------
// Valence-electron table for supported heteroatoms
// ---------------------------------------------------------------------------

const VALENCE_ELECTRONS: Record<string, number> = {
  N: 5,
  O: 6,
  F: 7,
  P: 5,
  S: 6,
  Cl: 7,
  Br: 7,
  I: 7,
};

// Bond type → order mapping (Bond.PATTERN.TYPE values)
const BOND_ORDER: Record<number, number> = {
  1: 1, // SINGLE
  2: 2, // DOUBLE
  3: 3, // TRIPLE
  4: 1.5, // AROMATIC
};

// ---------------------------------------------------------------------------
// Lone-pair count calculation
// ---------------------------------------------------------------------------

/**
 * Conservative display-only lone-pair estimate.
 * Returns null for atoms that should not show lone pairs (C, H, unknowns).
 */
export function getExpectedLonePairCount(ctx: LonePairContext): number | null {
  const { label, charge, radical, bondOrderSum, implicitHs } = ctx;

  if (label === 'C' || label === 'H') return null;

  const ve = VALENCE_ELECTRONS[label];
  if (ve === undefined) return null;

  const usedElectrons = 2 * bondOrderSum + implicitHs + charge;
  const nonbondingElectrons = ve - usedElectrons - radical;
  const lonePairs = Math.floor(Math.max(0, nonbondingElectrons) / 2);

  return Number.isFinite(lonePairs) ? lonePairs : null;
}

/**
 * Sum bond orders for an atom by iterating struct half-bonds.
 * Aromatic bonds count as 1.5; single=1, double=2, triple=3.
 */
export function getBondOrderSumForAtom(struct: Struct, aid: number): number {
  const atom = struct.atoms.get(aid);
  if (!atom) return 0;

  let sum = 0;
  for (const neighborHbId of atom.neighbors) {
    const hb = struct.halfBonds.get(neighborHbId);
    if (!hb) continue;
    const bond = struct.bonds.get(hb.bid);
    if (!bond) continue;
    sum += BOND_ORDER[bond.type] ?? 1;
  }
  return sum;
}

// ---------------------------------------------------------------------------
// Placement helpers
// ---------------------------------------------------------------------------

/**
 * Build the four cardinal placement candidates for a lone pair around an atom.
 *
 * @param atomCenter     Canvas-space atom center (after Scale.modelToCanvas)
 * @param labelBox       Absolute bounding box of the atom label in canvas space
 * @param offset         Pixels from label edge to dot center
 * @param spread         Distance between the two dots of the pair
 * @param occupiedBoxes  Bboxes already occupied by other annotations
 * @param bondAngles     Optional bond directions in radians (for bond-ray penalty)
 */
export function getAnchorPlacements(
  atomCenter: { x: number; y: number },
  labelBox: BBox,
  offset: number,
  spread: number,
  occupiedBoxes: BBox[],
  bondAngles?: number[],
): AnchorPlacement[] {
  const { x: cx, y: cy } = atomCenter;
  const halfW = labelBox.width / 2;
  const halfH = labelBox.height / 2;

  const candidates: AnchorPlacement[] = [
    {
      anchor: 'top',
      score: 0,
      dot1: { x: cx - spread / 2, y: cy - halfH - offset },
      dot2: { x: cx + spread / 2, y: cy - halfH - offset },
    },
    {
      anchor: 'bottom',
      score: 0,
      dot1: { x: cx - spread / 2, y: cy + halfH + offset },
      dot2: { x: cx + spread / 2, y: cy + halfH + offset },
    },
    {
      anchor: 'left',
      score: 0,
      dot1: { x: cx - halfW - offset, y: cy - spread / 2 },
      dot2: { x: cx - halfW - offset, y: cy + spread / 2 },
    },
    {
      anchor: 'right',
      score: 0,
      dot1: { x: cx + halfW + offset, y: cy - spread / 2 },
      dot2: { x: cx + halfW + offset, y: cy + spread / 2 },
    },
  ];

  for (const c of candidates) {
    c.score = scorePlacement(c, occupiedBoxes, bondAngles);
  }

  return candidates.sort((a, b) => b.score - a.score);
}

const ANCHOR_ANGLE: Record<LonePairAnchor, number> = {
  top: -Math.PI / 2,
  bottom: Math.PI / 2,
  left: Math.PI,
  right: 0,
};

function pointInBox(pt: { x: number; y: number }, box: BBox): boolean {
  return (
    pt.x >= box.x &&
    pt.x <= box.x + box.width &&
    pt.y >= box.y &&
    pt.y <= box.y + box.height
  );
}

function scorePlacement(
  p: AnchorPlacement,
  occupiedBoxes: BBox[],
  bondAngles?: number[],
): number {
  let score = 100;

  // Penalize overlapping occupied annotation bboxes
  for (const box of occupiedBoxes) {
    if (pointInBox(p.dot1, box) || pointInBox(p.dot2, box)) {
      score -= 50;
    }
  }

  // Penalize anchors whose direction is close to a bond direction
  if (bondAngles && bondAngles.length > 0) {
    const anchorAngle = ANCHOR_ANGLE[p.anchor];
    for (const bondAngle of bondAngles) {
      const diff = Math.abs(
        ((anchorAngle - bondAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
      );
      if (diff < Math.PI / 4) {
        score -= 30; // within 45° of a bond direction
      }
    }
  }

  return score;
}

/**
 * Pick the best `count` placements from sorted candidates (no anchor reuse).
 */
export function choosePlacements(
  sorted: AnchorPlacement[],
  count: number,
): AnchorPlacement[] {
  return sorted.slice(0, count);
}

// ---------------------------------------------------------------------------
// Display decision
// ---------------------------------------------------------------------------

/**
 * Returns true if lone pairs should be rendered for this atom given
 * the current options and atom-level override.
 */
export function shouldRenderLonePairs(
  lonePairDisplay: LonePairDisplayOverride | undefined,
  lonePairCount: number | null,
  options: RenderOptions,
): boolean {
  if (lonePairCount === null || lonePairCount === 0) return false;

  const override = lonePairDisplay ?? 'inherit';

  if (override === 'hide') return false;
  if (override === 'show') return true;

  // 'inherit': use global setting
  if (!options.showLonePairs) return false;
  if (options.lonePairDefaultMode === 'off') return false;

  return true;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

/**
 * Render a single lone-pair dot-pair onto the canvas.
 * Returns the Raphael set so the caller can add it to the visel.
 */
export function renderLonePairDots(
  render: Render,
  dot1: { x: number; y: number },
  dot2: { x: number; y: number },
  diameter: number,
  color: string,
): any {
  const r = diameter / 2;
  const set = render.paper.set();
  set.push(
    render.paper
      .circle(dot1.x, dot1.y, r)
      .attr({ fill: color, stroke: 'none' }),
    render.paper
      .circle(dot2.x, dot2.y, r)
      .attr({ fill: color, stroke: 'none' }),
  );
  return set;
}
