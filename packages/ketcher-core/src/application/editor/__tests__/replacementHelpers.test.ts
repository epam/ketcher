/**
 * Unit tests for replacementHelpers.ts
 *
 * Tests cover:
 *  - presetsHaveSameGeometry (task 3.2)
 *  - collectMonomerBonds (task 4.4)
 *  - computeReestablishableBonds (task 4.4)
 *  - mapPresetBonds (task 4.4)
 */

import {
  presetsHaveSameGeometry,
  collectMonomerBonds,
  computeReestablishableBonds,
  mapPresetBonds,
  getPresetPhosphateFromSugar,
  getPresetSugarForMonomer,
  getMatchingPresetComponents,
  getPresetComponentRole,
  computeLostBondsForMonomerReplacement,
  computeLostBondsForPresetReplacement,
} from 'application/editor/libraryItemDragDrop/replacementHelpers';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import { AttachmentPointName, type MonomerItemType } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { Sugar } from 'domain/entities/Sugar';
import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';
import { Struct } from 'domain/entities/struct';
import { KetMonomerClass } from 'domain/constants/monomers';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMonomerItem(
  label = 'X',
  monomerClass: KetMonomerClass = KetMonomerClass.AminoAcid,
): MonomerItemType {
  return {
    label,
    props: {
      MonomerNaturalAnalogCode: label,
      MonomerClass: monomerClass,
    },
    // An empty Struct is enough for the BaseMonomer constructor's
    // attachment-point recalculation (no superatom → empty AP dict). Tests set
    // `attachmentPointsToBonds` manually afterwards.
    struct: new Struct(),
  } as unknown as MonomerItemType;
}

function makeSugar(): Sugar {
  const m = new Sugar(makeMonomerItem('R', KetMonomerClass.Sugar), undefined);
  // Ensure it has R1, R2, R3 APs
  m.attachmentPointsToBonds = {
    R1: null,
    R2: null,
    R3: null,
  };
  return m;
}

function makeRNABase(): RNABase {
  const m = new RNABase(makeMonomerItem('A', KetMonomerClass.Base), undefined);
  m.attachmentPointsToBonds = {
    R1: null,
  };
  return m;
}

function makePhosphate(): Phosphate {
  const m = new Phosphate(
    makeMonomerItem('P', KetMonomerClass.Phosphate),
    undefined,
  );
  m.attachmentPointsToBonds = {
    R1: null,
    R2: null,
  };
  return m;
}

/**
 * Wires an intra-preset sugar↔base bond (sugar.R3 ↔ base.R1).
 */
function connectBase(sugar: Sugar, base: RNABase): void {
  const bond = new PolymerBond(sugar, base);
  sugar.attachmentPointsToBonds.R3 = bond;
  base.attachmentPointsToBonds.R1 = bond;
}

/**
 * Wires an intra-preset sugar↔phosphate bond on the requested side:
 *  - 'right' (3′): sugar.R2 ↔ phosphate.R1
 *  - 'left'  (5′): sugar.R1 ↔ phosphate.R2
 */
function connectPhosphate(
  sugar: Sugar,
  phosphate: Phosphate,
  position: 'left' | 'right',
): void {
  const bond = new PolymerBond(sugar, phosphate);
  if (position === 'right') {
    sugar.attachmentPointsToBonds.R2 = bond;
    phosphate.attachmentPointsToBonds.R1 = bond;
  } else {
    sugar.attachmentPointsToBonds.R1 = bond;
    phosphate.attachmentPointsToBonds.R2 = bond;
  }
}

function makePreset(
  opts: {
    hasSugar?: boolean;
    hasBase?: boolean;
    hasPhosphate?: boolean;
    phosphatePosition?: 'left' | 'right';
  } = {},
): IRnaPreset {
  const {
    hasSugar = true,
    hasBase = true,
    hasPhosphate = true,
    phosphatePosition,
  } = opts;
  return {
    sugar: hasSugar
      ? (makeMonomerItem('R') as unknown as IRnaPreset['sugar'])
      : undefined,
    base: hasBase
      ? (makeMonomerItem('A') as unknown as IRnaPreset['base'])
      : undefined,
    phosphate: hasPhosphate
      ? (makeMonomerItem('P') as unknown as IRnaPreset['phosphate'])
      : undefined,
    phosphatePosition,
  };
}

// ---------------------------------------------------------------------------
// presetsHaveSameGeometry
// ---------------------------------------------------------------------------

describe('presetsHaveSameGeometry', () => {
  it('returns true for identical full presets (sugar+base+phosphate, default position)', () => {
    expect(presetsHaveSameGeometry(makePreset(), makePreset())).toBe(true);
  });

  it('returns true when both presets have explicit left phosphate position', () => {
    const a = makePreset({ phosphatePosition: 'left' });
    const b = makePreset({ phosphatePosition: 'left' });
    expect(presetsHaveSameGeometry(a, b)).toBe(true);
  });

  it('returns true when both presets have explicit right phosphate position', () => {
    const a = makePreset({ phosphatePosition: 'right' });
    const b = makePreset({ phosphatePosition: 'right' });
    expect(presetsHaveSameGeometry(a, b)).toBe(true);
  });

  it('returns false when presets differ in phosphate position (left vs right)', () => {
    const a = makePreset({ phosphatePosition: 'left' });
    const b = makePreset({ phosphatePosition: 'right' });
    expect(presetsHaveSameGeometry(a, b)).toBe(false);
  });

  it('returns false when one has a phosphate and the other does not', () => {
    const a = makePreset({ hasPhosphate: true });
    const b = makePreset({ hasPhosphate: false });
    expect(presetsHaveSameGeometry(a, b)).toBe(false);
  });

  it('returns true for nucleoside presets (no phosphate)', () => {
    const a = makePreset({ hasPhosphate: false });
    const b = makePreset({ hasPhosphate: false });
    expect(presetsHaveSameGeometry(a, b)).toBe(true);
  });

  it('returns false when one has a base and the other does not', () => {
    const a = makePreset({ hasBase: true });
    const b = makePreset({ hasBase: false });
    expect(presetsHaveSameGeometry(a, b)).toBe(false);
  });

  it('returns false when one has a sugar and the other does not', () => {
    const a = makePreset({ hasSugar: true });
    const b = makePreset({ hasSugar: false });
    expect(presetsHaveSameGeometry(a, b)).toBe(false);
  });

  it('treats undefined phosphatePosition the same as "left"', () => {
    const a = makePreset({ phosphatePosition: undefined });
    const b = makePreset({ phosphatePosition: 'left' });
    expect(presetsHaveSameGeometry(a, b)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// collectMonomerBonds
// ---------------------------------------------------------------------------

describe('collectMonomerBonds', () => {
  it('returns empty array when monomer has no bonds', () => {
    const sugar = makeSugar();
    expect(collectMonomerBonds(sugar)).toHaveLength(0);
  });

  it('collects polymer bonds with their AP names and other-monomer APs', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();

    // Simulate R2 on sugar connected to R1 on phosphate
    const bond = new PolymerBond(sugar, phosphate);
    sugar.attachmentPointsToBonds.R2 = bond;
    phosphate.attachmentPointsToBonds.R1 = bond;

    const records = collectMonomerBonds(sugar);
    expect(records).toHaveLength(1);
    expect(records[0].attachmentPointName).toBe('R2');
    expect(records[0].otherEntity).toBe(phosphate);
    expect(records[0].otherAttachmentPointName).toBe('R1');
  });

  it('collects hydrogen bonds under the "hydrogen" key', () => {
    const sugar = makeSugar();
    const base = makeRNABase();

    const hBond = new HydrogenBond(sugar, base);
    sugar.hydrogenBonds = [hBond];
    base.hydrogenBonds = [hBond];

    const records = collectMonomerBonds(sugar);
    const hRecord = records.find(
      (r) => r.attachmentPointName === AttachmentPointName.HYDROGEN,
    );
    expect(hRecord).toBeDefined();
    expect(hRecord?.otherEntity).toBe(base);
  });

  it('collects multiple bonds across different APs', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    const anotherPhosphate = makePhosphate();

    const bond1 = new PolymerBond(sugar, phosphate);
    sugar.attachmentPointsToBonds.R1 = bond1;
    phosphate.attachmentPointsToBonds.R2 = bond1;

    const bond2 = new PolymerBond(sugar, anotherPhosphate);
    sugar.attachmentPointsToBonds.R2 = bond2;
    anotherPhosphate.attachmentPointsToBonds.R1 = bond2;

    const records = collectMonomerBonds(sugar);
    expect(records).toHaveLength(2);
    const apNames = records.map((r) => r.attachmentPointName);
    expect(apNames).toContain('R1');
    expect(apNames).toContain('R2');
  });
});

// ---------------------------------------------------------------------------
// computeReestablishableBonds
// ---------------------------------------------------------------------------

describe('computeReestablishableBonds', () => {
  it('marks all bonds as reestablishable when new monomer has matching free APs', () => {
    const originalSugar = makeSugar();
    const newSugar = makeSugar();
    const phosphate = makePhosphate();

    const bond = new PolymerBond(originalSugar, phosphate);
    originalSugar.attachmentPointsToBonds.R2 = bond;
    phosphate.attachmentPointsToBonds.R1 = bond;

    const records = collectMonomerBonds(originalSugar);
    const plan = computeReestablishableBonds(records, newSugar);

    expect(plan.reestablishable).toHaveLength(1);
    expect(plan.lost).toHaveLength(0);
  });

  it('marks bond as lost when new monomer lacks the matching AP', () => {
    const originalSugar = makeSugar();
    const newBase = makeRNABase(); // only has R1
    const phosphate = makePhosphate();

    const bond = new PolymerBond(originalSugar, phosphate);
    originalSugar.attachmentPointsToBonds.R2 = bond;
    phosphate.attachmentPointsToBonds.R1 = bond;

    const records = collectMonomerBonds(originalSugar);
    // R2 does not exist on newBase
    const plan = computeReestablishableBonds(records, newBase);

    expect(plan.reestablishable).toHaveLength(0);
    expect(plan.lost).toHaveLength(1);
  });

  it('splits partial re-establishment correctly', () => {
    const originalSugar = makeSugar();
    const newSugar = makeSugar();
    const phosphate1 = makePhosphate();
    const phosphate2 = makePhosphate();

    const bond1 = new PolymerBond(originalSugar, phosphate1);
    originalSugar.attachmentPointsToBonds.R1 = bond1;
    phosphate1.attachmentPointsToBonds.R2 = bond1;

    const bond2 = new PolymerBond(originalSugar, phosphate2);
    originalSugar.attachmentPointsToBonds.R2 = bond2;
    phosphate2.attachmentPointsToBonds.R1 = bond2;

    // New sugar only has R1 free (R2 occupied)
    newSugar.attachmentPointsToBonds.R2 = bond2; // simulate occupied

    const records = collectMonomerBonds(originalSugar);
    const plan = computeReestablishableBonds(records, newSugar);

    expect(plan.reestablishable).toHaveLength(1);
    expect(plan.lost).toHaveLength(1);
    expect(plan.reestablishable[0].attachmentPointName).toBe('R1');
    expect(plan.lost[0].attachmentPointName).toBe('R2');
  });

  it('always includes hydrogen bonds in reestablishable', () => {
    const sugar = makeSugar();
    const newSugar = makeSugar();
    const otherSugar = makeSugar();

    const hBond = new HydrogenBond(sugar, otherSugar);
    sugar.hydrogenBonds = [hBond];
    otherSugar.hydrogenBonds = [hBond];

    const records = collectMonomerBonds(sugar);
    const plan = computeReestablishableBonds(records, newSugar);

    const hRecord = plan.reestablishable.find(
      (r) => r.attachmentPointName === AttachmentPointName.HYDROGEN,
    );
    expect(hRecord).toBeDefined();
    expect(plan.lost).toHaveLength(0);
  });

  it('returns empty reestablishable when no bonds can be re-established', () => {
    const originalSugar = makeSugar();
    const newBase = makeRNABase(); // only R1
    const phosphate1 = makePhosphate();
    const phosphate2 = makePhosphate();

    const bond1 = new PolymerBond(originalSugar, phosphate1);
    originalSugar.attachmentPointsToBonds.R2 = bond1;
    phosphate1.attachmentPointsToBonds.R1 = bond1;

    // R3 bond: RNABase does not have R3
    const bond2 = new PolymerBond(originalSugar, phosphate2);
    originalSugar.attachmentPointsToBonds.R3 = bond2;
    phosphate2.attachmentPointsToBonds.R1 = bond2;

    const records = collectMonomerBonds(originalSugar);
    const plan = computeReestablishableBonds(records, newBase);

    expect(plan.reestablishable).toHaveLength(0);
    expect(plan.lost).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// mapPresetBonds
// ---------------------------------------------------------------------------

describe('mapPresetBonds', () => {
  it('maps bonds from original preset components to new preset components', () => {
    const originalSugar = makeSugar();
    const originalPhosphate = makePhosphate();
    const externalMonomer = makeSugar(); // represents the next nucleotide's phosphate

    // originalPhosphate R2 → externalMonomer R1
    const externalBond = new PolymerBond(originalPhosphate, externalMonomer);
    originalPhosphate.attachmentPointsToBonds.R2 = externalBond;
    externalMonomer.attachmentPointsToBonds.R1 = externalBond;

    const newSugar = makeSugar();
    const newPhosphate = makePhosphate();

    const plan = mapPresetBonds(
      [originalSugar, originalPhosphate],
      [newSugar, newPhosphate],
    );

    expect(plan.reestablishable).toHaveLength(1);
    expect(plan.lost).toHaveLength(0);
  });

  it('marks bonds as lost when the new preset lacks the component role', () => {
    const originalPhosphate = makePhosphate();
    const externalMonomer = makeSugar();

    const externalBond = new PolymerBond(originalPhosphate, externalMonomer);
    originalPhosphate.attachmentPointsToBonds.R2 = externalBond;
    externalMonomer.attachmentPointsToBonds.R1 = externalBond;

    // New preset has no phosphate
    const newSugar = makeSugar();

    const plan = mapPresetBonds([originalPhosphate], [newSugar]);

    expect(plan.lost).toHaveLength(1);
    expect(plan.reestablishable).toHaveLength(0);
  });

  it('excludes internal intra-preset bonds from the results', () => {
    const originalSugar = makeSugar();
    const originalBase = makeRNABase();

    // Internal intra-preset bond: sugar R3 → base R1
    const internalBond = new PolymerBond(originalSugar, originalBase);
    originalSugar.attachmentPointsToBonds.R3 = internalBond;
    originalBase.attachmentPointsToBonds.R1 = internalBond;

    const newSugar = makeSugar();
    const newBase = makeRNABase();

    const plan = mapPresetBonds(
      [originalSugar, originalBase],
      [newSugar, newBase],
    );

    // The internal bond is excluded — no bonds to re-establish or lose
    expect(plan.reestablishable).toHaveLength(0);
    expect(plan.lost).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getPresetPhosphateFromSugar
// ---------------------------------------------------------------------------

describe('getPresetPhosphateFromSugar', () => {
  it('finds a right-side (3′) phosphate via sugar.R2 ↔ phosphate.R1', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    connectPhosphate(sugar, phosphate, 'right');

    expect(getPresetPhosphateFromSugar(sugar, 'right')).toBe(phosphate);
    // Not present on the left side
    expect(getPresetPhosphateFromSugar(sugar, 'left')).toBeNull();
  });

  it('finds a left-side (5′) phosphate via sugar.R1 ↔ phosphate.R2', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    connectPhosphate(sugar, phosphate, 'left');

    expect(getPresetPhosphateFromSugar(sugar, 'left')).toBe(phosphate);
    expect(getPresetPhosphateFromSugar(sugar, 'right')).toBeNull();
  });

  it('does not mistake a neighbouring nucleotide phosphate on the wrong AP', () => {
    // A previous nucleotide's 3′ phosphate connects to THIS sugar's R1 via the
    // phosphate's R2 (prevPhosphate.R2 ↔ sugar.R1). When asked for a LEFT
    // phosphate we require phosphate.R2, so this neighbour IS returned for
    // 'left'; but if the neighbour connected on its R1 it must be rejected.
    const sugar = makeSugar();
    const neighbourPhosphate = makePhosphate();
    // Wire sugar.R1 ↔ neighbourPhosphate.R1 (wrong AP for a left phosphate)
    const bond = new PolymerBond(sugar, neighbourPhosphate);
    sugar.attachmentPointsToBonds.R1 = bond;
    neighbourPhosphate.attachmentPointsToBonds.R1 = bond;

    expect(getPresetPhosphateFromSugar(sugar, 'left')).toBeNull();
  });

  it('returns null when the neighbour on that side is not a phosphate', () => {
    const sugar = makeSugar();
    const otherSugar = makeSugar();
    const bond = new PolymerBond(sugar, otherSugar);
    sugar.attachmentPointsToBonds.R2 = bond;
    otherSugar.attachmentPointsToBonds.R1 = bond;

    expect(getPresetPhosphateFromSugar(sugar, 'right')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getPresetSugarForMonomer
// ---------------------------------------------------------------------------

describe('getPresetSugarForMonomer', () => {
  const preset = (
    opts: Partial<IRnaPreset> = {},
  ): Pick<IRnaPreset, 'base' | 'phosphate' | 'phosphatePosition'> => ({
    base: makeMonomerItem('A') as unknown as IRnaPreset['base'],
    phosphate: makeMonomerItem('P') as unknown as IRnaPreset['phosphate'],
    phosphatePosition: 'right',
    ...opts,
  });

  it('returns the sugar itself when hovering a sugar (no base required)', () => {
    const sugar = makeSugar();
    expect(getPresetSugarForMonomer(sugar, preset())).toBe(sugar);
  });

  it('resolves the sugar from a hovered base', () => {
    const sugar = makeSugar();
    const base = makeRNABase();
    connectBase(sugar, base);

    expect(getPresetSugarForMonomer(base, preset())).toBe(sugar);
  });

  it('resolves the sugar from a hovered right-side phosphate', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    connectPhosphate(sugar, phosphate, 'right');

    expect(getPresetSugarForMonomer(phosphate, preset())).toBe(sugar);
  });

  it('resolves the sugar from a hovered left-side phosphate', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    connectPhosphate(sugar, phosphate, 'left');

    expect(
      getPresetSugarForMonomer(
        phosphate,
        preset({ phosphatePosition: 'left' }),
      ),
    ).toBe(sugar);
  });

  it('returns null for a phosphate with no adjacent sugar', () => {
    const phosphate = makePhosphate();
    expect(getPresetSugarForMonomer(phosphate, preset())).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getMatchingPresetComponents
// ---------------------------------------------------------------------------

describe('getMatchingPresetComponents', () => {
  const libPreset = (
    opts: Partial<
      Pick<IRnaPreset, 'base' | 'phosphate' | 'phosphatePosition'>
    > = {},
  ): Pick<IRnaPreset, 'base' | 'phosphate' | 'phosphatePosition'> => ({
    base: makeMonomerItem('A') as unknown as IRnaPreset['base'],
    phosphate: makeMonomerItem('P') as unknown as IRnaPreset['phosphate'],
    phosphatePosition: 'right',
    ...opts,
  });

  it('matches a full standard preset (sugar+base+phosphate on the right)', () => {
    const sugar = makeSugar();
    const base = makeRNABase();
    const phosphate = makePhosphate();
    connectBase(sugar, base);
    connectPhosphate(sugar, phosphate, 'right');

    const components = getMatchingPresetComponents(sugar, libPreset());
    expect(components).not.toBeNull();
    expect(components).toHaveLength(3);
    expect(components).toEqual(
      expect.arrayContaining([sugar, base, phosphate]),
    );
  });

  it('matches a left-phosphate preset and includes the 5′ phosphate', () => {
    const sugar = makeSugar();
    const base = makeRNABase();
    const phosphate = makePhosphate();
    connectBase(sugar, base);
    connectPhosphate(sugar, phosphate, 'left');

    const components = getMatchingPresetComponents(
      sugar,
      libPreset({ phosphatePosition: 'left' }),
    );
    expect(components).toEqual(
      expect.arrayContaining([sugar, base, phosphate]),
    );
    expect(components).toHaveLength(3);
  });

  it('matches a two-component sugar+base preset (no phosphate)', () => {
    const sugar = makeSugar();
    const base = makeRNABase();
    connectBase(sugar, base);

    const components = getMatchingPresetComponents(
      sugar,
      libPreset({ phosphate: undefined, phosphatePosition: undefined }),
    );
    expect(components).toEqual(expect.arrayContaining([sugar, base]));
    expect(components).toHaveLength(2);
  });

  it('matches a two-component sugar+phosphate preset (no base)', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    connectPhosphate(sugar, phosphate, 'right');

    const components = getMatchingPresetComponents(
      sugar,
      libPreset({ base: undefined }),
    );
    expect(components).toEqual(expect.arrayContaining([sugar, phosphate]));
    expect(components).toHaveLength(2);
  });

  it('returns null when the dragged preset has a base but the canvas has none', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    connectPhosphate(sugar, phosphate, 'right');

    expect(getMatchingPresetComponents(sugar, libPreset())).toBeNull();
  });

  it('returns null when the dragged preset has a phosphate but the canvas lacks one on that side', () => {
    const sugar = makeSugar();
    const base = makeRNABase();
    const phosphate = makePhosphate();
    connectBase(sugar, base);
    // Canvas phosphate is on the LEFT, dragged preset expects it on the RIGHT
    connectPhosphate(sugar, phosphate, 'left');

    expect(
      getMatchingPresetComponents(
        sugar,
        libPreset({ phosphatePosition: 'right' }),
      ),
    ).toBeNull();
  });

  it('excludes a canvas base that the dragged sugar+phosphate preset does not provide', () => {
    const sugar = makeSugar();
    const base = makeRNABase();
    const phosphate = makePhosphate();
    connectBase(sugar, base);
    connectPhosphate(sugar, phosphate, 'right');

    const components = getMatchingPresetComponents(
      sugar,
      libPreset({ base: undefined }),
    );
    // Only the parts that exist in the dragged preset are returned.
    expect(components).toEqual(expect.arrayContaining([sugar, phosphate]));
    expect(components).not.toContain(base);
    expect(components).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// getPresetComponentRole
// ---------------------------------------------------------------------------

describe('getPresetComponentRole', () => {
  it('classifies sugar / base / phosphate', () => {
    expect(getPresetComponentRole(makeSugar())).toBe('sugar');
    expect(getPresetComponentRole(makeRNABase())).toBe('base');
    expect(getPresetComponentRole(makePhosphate())).toBe('phosphate');
  });
});

// ---------------------------------------------------------------------------
// computeLostBondsForMonomerReplacement
// ---------------------------------------------------------------------------

describe('computeLostBondsForMonomerReplacement', () => {
  it('reports no lost bonds when the new monomer provides every used AP', () => {
    const sugar = makeSugar();
    const phosphate = makePhosphate();
    const bond = new PolymerBond(sugar, phosphate);
    sugar.attachmentPointsToBonds.R2 = bond;
    phosphate.attachmentPointsToBonds.R1 = bond;

    const lost = computeLostBondsForMonomerReplacement(
      sugar,
      new Set<AttachmentPointName>([
        'R1' as AttachmentPointName,
        'R2' as AttachmentPointName,
        'R3' as AttachmentPointName,
      ]),
    );
    expect(lost).toHaveLength(0);
  });

  it('reports a lost bond when the new monomer lacks the used AP', () => {
    const sugar = makeSugar();
    const other = makePhosphate();
    // Bond on R3
    const bond = new PolymerBond(sugar, other);
    sugar.attachmentPointsToBonds.R3 = bond;
    other.attachmentPointsToBonds.R1 = bond;

    // New monomer only has R1, R2 (no R3)
    const lost = computeLostBondsForMonomerReplacement(
      sugar,
      new Set<AttachmentPointName>([
        'R1' as AttachmentPointName,
        'R2' as AttachmentPointName,
      ]),
    );
    expect(lost).toHaveLength(1);
    expect(lost[0].attachmentPointName).toBe('R3');
  });

  it('never counts hydrogen bonds as lost', () => {
    const sugar = makeSugar();
    const other = makeSugar();
    const hBond = new HydrogenBond(sugar, other);
    sugar.hydrogenBonds = [hBond];
    other.hydrogenBonds = [hBond];

    const lost = computeLostBondsForMonomerReplacement(
      sugar,
      new Set<AttachmentPointName>(),
    );
    expect(lost).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// computeLostBondsForPresetReplacement
// ---------------------------------------------------------------------------

describe('computeLostBondsForPresetReplacement', () => {
  const freeByRole = (
    sugar: AttachmentPointName[],
    base: AttachmentPointName[],
    phosphate: AttachmentPointName[],
  ) => ({
    sugar: new Set<AttachmentPointName>(sugar),
    base: new Set<AttachmentPointName>(base),
    phosphate: new Set<AttachmentPointName>(phosphate),
  });

  it('preserves the base bond when dropping a sugar+phosphate preset', () => {
    // Canvas nucleotide: sugar+base+phosphate; dragged preset: sugar+phosphate.
    // presetComponents = [sugar, phosphate] (base excluded, stays on canvas).
    const sugar = makeSugar();
    const base = makeRNABase();
    const phosphate = makePhosphate();
    connectBase(sugar, base); // sugar.R3 ↔ base.R1 (external to [sugar,phosphate])
    connectPhosphate(sugar, phosphate, 'right'); // internal

    const lost = computeLostBondsForPresetReplacement(
      [sugar, phosphate],
      freeByRole(
        ['R1' as AttachmentPointName, 'R3' as AttachmentPointName], // R2 used by phosphate
        [],
        ['R2' as AttachmentPointName], // R1 used by sugar
      ),
      { sugar: true, base: false, phosphate: true },
    );
    // The sugar→base (R3) bond is preservable → nothing lost.
    expect(lost).toHaveLength(0);
  });

  it('reports a lost bond when the new component lacks the required AP', () => {
    const sugar = makeSugar();
    const base = makeRNABase();
    connectBase(sugar, base); // sugar.R3 ↔ base (external)

    const lost = computeLostBondsForPresetReplacement(
      [sugar],
      freeByRole(
        ['R1' as AttachmentPointName, 'R2' as AttachmentPointName], // no R3 free
        [],
        [],
      ),
      { sugar: true, base: false, phosphate: false },
    );
    expect(lost).toHaveLength(1);
    expect(lost[0].attachmentPointName).toBe('R3');
  });

  it('reports all external bonds as lost when the new preset lacks the role', () => {
    const phosphate = makePhosphate();
    const nextSugar = makeSugar();
    const bond = new PolymerBond(phosphate, nextSugar);
    phosphate.attachmentPointsToBonds.R2 = bond;
    nextSugar.attachmentPointsToBonds.R1 = bond;

    // New preset has no phosphate role.
    const lost = computeLostBondsForPresetReplacement(
      [phosphate],
      freeByRole([], [], []),
      { sugar: true, base: false, phosphate: false },
    );
    expect(lost).toHaveLength(1);
    expect(lost[0].attachmentPointName).toBe('R2');
  });
});
