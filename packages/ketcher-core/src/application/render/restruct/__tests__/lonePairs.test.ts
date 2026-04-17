import {
  getExpectedLonePairCount,
  shouldRenderLonePairs,
  getAnchorPlacements,
  choosePlacements,
} from '../lonePairs';
import { RenderOptions } from 'application/render/render.types';

// ---------------------------------------------------------------------------
// getExpectedLonePairCount
// ---------------------------------------------------------------------------

describe('getExpectedLonePairCount', () => {
  it('returns null for carbon', () => {
    expect(
      getExpectedLonePairCount({
        label: 'C',
        charge: 0,
        radical: 0,
        bondOrderSum: 4,
        implicitHs: 0,
      }),
    ).toBeNull();
  });

  it('returns null for hydrogen', () => {
    expect(
      getExpectedLonePairCount({
        label: 'H',
        charge: 0,
        radical: 0,
        bondOrderSum: 1,
        implicitHs: 0,
      }),
    ).toBeNull();
  });

  it('returns null for unknown element', () => {
    expect(
      getExpectedLonePairCount({
        label: 'X',
        charge: 0,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 0,
      }),
    ).toBeNull();
  });

  it('water oxygen has 2 lone pairs', () => {
    // O in H2O: ve=6, usedElectrons = 2*0 + 2 + 0 = 2, nonbonding=4, pairs=2
    expect(
      getExpectedLonePairCount({
        label: 'O',
        charge: 0,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 2,
      }),
    ).toBe(2);
  });

  it('amine nitrogen has 1 lone pair', () => {
    // N in NH3: ve=5, usedElectrons = 2*0 + 3 + 0 = 3, nonbonding=2, pairs=1
    expect(
      getExpectedLonePairCount({
        label: 'N',
        charge: 0,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 3,
      }),
    ).toBe(1);
  });

  it('fluorine has 3 lone pairs', () => {
    // F: ve=7, usedElectrons = 2*0 + 1 + 0 = 1, nonbonding=6, pairs=3
    expect(
      getExpectedLonePairCount({
        label: 'F',
        charge: 0,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 1,
      }),
    ).toBe(3);
  });

  it('charged nitrogen (ammonium-like) has 0 lone pairs', () => {
    // N+: ve=5, usedElectrons = 2*0 + 4 + 1 = 5, nonbonding=0, pairs=0
    expect(
      getExpectedLonePairCount({
        label: 'N',
        charge: 1,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 4,
      }),
    ).toBe(0);
  });

  it('chlorine has 3 lone pairs', () => {
    // Cl in HCl: ve=7, usedElectrons = 2*0 + 1 + 0 = 1, nonbonding=6, pairs=3
    expect(
      getExpectedLonePairCount({
        label: 'Cl',
        charge: 0,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 1,
      }),
    ).toBe(3);
  });

  it('oxygen bonded by double bond has 2 lone pairs', () => {
    // C=O (carbonyl O): RDKit formula floor((6 - 0 - 2 - 0 - 0) / 2) = 2
    expect(
      getExpectedLonePairCount({
        label: 'O',
        charge: 0,
        radical: 0,
        bondOrderSum: 2,
        implicitHs: 0,
      }),
    ).toBe(2);
  });

  it('sulfur in H2S has 2 lone pairs', () => {
    // S with 2 implicit H: floor((6 - 0 - 0 - 2 - 0) / 2) = 2
    expect(
      getExpectedLonePairCount({
        label: 'S',
        charge: 0,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 2,
      }),
    ).toBe(2);
  });

  it('bromine in HBr has 3 lone pairs', () => {
    // Br with 1 implicit H: floor((7 - 0 - 0 - 1 - 0) / 2) = 3
    expect(
      getExpectedLonePairCount({
        label: 'Br',
        charge: 0,
        radical: 0,
        bondOrderSum: 0,
        implicitHs: 1,
      }),
    ).toBe(3);
  });

  it('pyridine-like aromatic nitrogen has 1 lone pair', () => {
    expect(
      getExpectedLonePairCount({
        label: 'N',
        charge: 0,
        radical: 0,
        bondOrderSum: 3,
        implicitHs: 0,
        isAromatic: true,
      }),
    ).toBe(1);
  });

  it('pyrrolic aromatic [nH] has 1 lone pair', () => {
    expect(
      getExpectedLonePairCount({
        label: 'N',
        charge: 0,
        radical: 0,
        bondOrderSum: 3,
        implicitHs: 1,
        isAromatic: true,
      }),
    ).toBe(1);
  });

  it('furan-like aromatic oxygen has 2 lone pairs', () => {
    expect(
      getExpectedLonePairCount({
        label: 'O',
        charge: 0,
        radical: 0,
        bondOrderSum: 3,
        implicitHs: 0,
        isAromatic: true,
      }),
    ).toBe(2);
  });

  it('thiophene-like aromatic sulfur has 2 lone pairs', () => {
    expect(
      getExpectedLonePairCount({
        label: 'S',
        charge: 0,
        radical: 0,
        bondOrderSum: 3,
        implicitHs: 0,
        isAromatic: true,
      }),
    ).toBe(2);
  });

  it('aromatic cationic nitrogen has 0 lone pairs', () => {
    expect(
      getExpectedLonePairCount({
        label: 'N',
        charge: 1,
        radical: 0,
        bondOrderSum: 3,
        implicitHs: 0,
        isAromatic: true,
      }),
    ).toBe(0);
  });

  it('returns null for impossible negative electron bookkeeping', () => {
    expect(
      getExpectedLonePairCount({
        label: 'O',
        charge: 0,
        radical: 0,
        bondOrderSum: 7,
        implicitHs: 0,
      }),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// shouldRenderLonePairs
// ---------------------------------------------------------------------------

describe('shouldRenderLonePairs', () => {
  const baseOptions: Partial<RenderOptions> = {
    lonePairShowO: true,
  };

  it('returns false when lonePairCount is null', () => {
    expect(
      shouldRenderLonePairs('O', 'inherit', null, baseOptions as RenderOptions),
    ).toBe(false);
  });

  it('returns false when lonePairCount is 0', () => {
    expect(
      shouldRenderLonePairs('O', 'inherit', 0, baseOptions as RenderOptions),
    ).toBe(false);
  });

  it('returns false when override is hide', () => {
    expect(
      shouldRenderLonePairs('O', 'hide', 2, baseOptions as RenderOptions),
    ).toBe(false);
  });

  it('returns true when override is show even if element default is off', () => {
    expect(shouldRenderLonePairs('O', 'show', 2, {} as RenderOptions)).toBe(
      true,
    );
  });

  it('returns false when element default is off and override is inherit', () => {
    expect(shouldRenderLonePairs('O', 'inherit', 2, {} as RenderOptions)).toBe(
      false,
    );
  });

  it('returns false for unknown element when override is inherit', () => {
    expect(
      shouldRenderLonePairs('P', 'inherit', 2, baseOptions as RenderOptions),
    ).toBe(false);
  });

  it('returns true when element default is on and override is inherit', () => {
    expect(
      shouldRenderLonePairs('O', 'inherit', 2, baseOptions as RenderOptions),
    ).toBe(true);
  });

  it('returns true when override is undefined and element default is on', () => {
    expect(
      shouldRenderLonePairs('O', undefined, 2, baseOptions as RenderOptions),
    ).toBe(true);
  });

  it('returns false for nitrogen when only oxygen is enabled', () => {
    expect(
      shouldRenderLonePairs('N', 'inherit', 1, baseOptions as RenderOptions),
    ).toBe(false);
  });

  it('returns true for nitrogen when nitrogen is enabled', () => {
    expect(
      shouldRenderLonePairs('N', 'inherit', 1, {
        lonePairShowN: true,
      } as RenderOptions),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getAnchorPlacements and choosePlacements
// ---------------------------------------------------------------------------

describe('getAnchorPlacements', () => {
  const center = { x: 0, y: 0 };
  const box = { x: -5, y: -5, width: 10, height: 10 };
  const getPlacement = (placements, anchor) => {
    const placement = placements.find((p) => p.anchor === anchor);
    expect(placement).toBeDefined();
    return placement;
  };

  it('returns 4 placements sorted by score descending', () => {
    const placements = getAnchorPlacements(center, box, 9, 3.5, []);
    expect(placements).toHaveLength(4);
    expect(placements[0].score).toBeGreaterThanOrEqual(placements[1].score);
    expect(placements[1].score).toBeGreaterThanOrEqual(placements[2].score);
    expect(placements[2].score).toBeGreaterThanOrEqual(placements[3].score);
  });

  it('penalizes placement that overlaps an occupied box', () => {
    // Top dots land at y = center.y - halfH - offset = 0 - 5 - 9 = -14
    // Build a box that covers exactly those dot positions
    const topDotBox = { x: -3.75, y: -15, width: 7.5, height: 3 };
    const placements = getAnchorPlacements(center, box, 9, 3.5, [topDotBox]);
    const topPlacement = getPlacement(placements, 'top');
    const rightPlacement = getPlacement(placements, 'right');
    expect(topPlacement.score).toBeLessThan(rightPlacement.score);
  });

  it('penalizes anchors aligned with bond directions', () => {
    // Bond going right (angle=0) should penalize 'right' anchor
    const placements = getAnchorPlacements(center, box, 9, 3.5, [], [0]);
    const right = getPlacement(placements, 'right');
    const top = getPlacement(placements, 'top');
    expect(right.score).toBeLessThan(top.score);
  });

  it('places top dots at correct y coordinate', () => {
    const offset = 9;
    const spread = 3.5;
    const halfH = 5; // box height/2
    const placements = getAnchorPlacements(center, box, offset, spread, []);
    const top = getPlacement(placements, 'top');
    expect(top.dot1.y).toBeCloseTo(center.y - halfH - offset);
    expect(top.dot2.y).toBeCloseTo(center.y - halfH - offset);
    expect(top.dot1.x).toBeCloseTo(center.x - spread / 2);
    expect(top.dot2.x).toBeCloseTo(center.x + spread / 2);
  });
});

describe('choosePlacements', () => {
  const center = { x: 0, y: 0 };
  const box = { x: -5, y: -5, width: 10, height: 10 };

  it('returns requested count of placements', () => {
    const placements = getAnchorPlacements(center, box, 9, 3.5, []);
    expect(choosePlacements(placements, 2)).toHaveLength(2);
    expect(choosePlacements(placements, 1)).toHaveLength(1);
  });

  it('returns all when count exceeds available', () => {
    const placements = getAnchorPlacements(center, box, 9, 3.5, []);
    expect(choosePlacements(placements, 10)).toHaveLength(4);
  });
});
