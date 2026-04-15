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
    // C=O (carbonyl O): ve=6, usedElectrons = 2*2 + 0 + 0 = 4, nonbonding=2, pairs=1
    expect(
      getExpectedLonePairCount({
        label: 'O',
        charge: 0,
        radical: 0,
        bondOrderSum: 2,
        implicitHs: 0,
      }),
    ).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// shouldRenderLonePairs
// ---------------------------------------------------------------------------

describe('shouldRenderLonePairs', () => {
  const baseOptions: Partial<RenderOptions> = {
    showLonePairs: true,
    lonePairDefaultMode: 'eligible-only',
  };

  it('returns false when lonePairCount is null', () => {
    expect(
      shouldRenderLonePairs('inherit', null, baseOptions as RenderOptions),
    ).toBe(false);
  });

  it('returns false when lonePairCount is 0', () => {
    expect(
      shouldRenderLonePairs('inherit', 0, baseOptions as RenderOptions),
    ).toBe(false);
  });

  it('returns false when override is hide', () => {
    expect(shouldRenderLonePairs('hide', 2, baseOptions as RenderOptions)).toBe(
      false,
    );
  });

  it('returns true when override is show even if global is off', () => {
    expect(
      shouldRenderLonePairs('show', 2, {
        ...baseOptions,
        showLonePairs: false,
      } as RenderOptions),
    ).toBe(true);
  });

  it('returns false when global showLonePairs is false and override is inherit', () => {
    expect(
      shouldRenderLonePairs('inherit', 2, {
        ...baseOptions,
        showLonePairs: false,
      } as RenderOptions),
    ).toBe(false);
  });

  it('returns false when mode is off and override is inherit', () => {
    expect(
      shouldRenderLonePairs('inherit', 2, {
        ...baseOptions,
        lonePairDefaultMode: 'off',
      } as RenderOptions),
    ).toBe(false);
  });

  it('returns true when global is on and override is inherit', () => {
    expect(
      shouldRenderLonePairs('inherit', 2, baseOptions as RenderOptions),
    ).toBe(true);
  });

  it('returns true when override is undefined and global is on', () => {
    expect(
      shouldRenderLonePairs(undefined, 2, baseOptions as RenderOptions),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getAnchorPlacements and choosePlacements
// ---------------------------------------------------------------------------

describe('getAnchorPlacements', () => {
  const center = { x: 0, y: 0 };
  const box = { x: -5, y: -5, width: 10, height: 10 };

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
    const topPlacement = placements.find((p) => p.anchor === 'top')!;
    const rightPlacement = placements.find((p) => p.anchor === 'right')!;
    expect(topPlacement.score).toBeLessThan(rightPlacement.score);
  });

  it('penalizes anchors aligned with bond directions', () => {
    // Bond going right (angle=0) should penalize 'right' anchor
    const placements = getAnchorPlacements(center, box, 9, 3.5, [], [0]);
    const right = placements.find((p) => p.anchor === 'right')!;
    const top = placements.find((p) => p.anchor === 'top')!;
    expect(right.score).toBeLessThan(top.score);
  });

  it('places top dots at correct y coordinate', () => {
    const offset = 9;
    const spread = 3.5;
    const halfH = 5; // box height/2
    const placements = getAnchorPlacements(center, box, offset, spread, []);
    const top = placements.find((p) => p.anchor === 'top')!;
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
