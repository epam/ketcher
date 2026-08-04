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
} from 'application/editor/libraryItemDragDrop/replacementHelpers';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import { AttachmentPointName } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { Sugar } from 'domain/entities/Sugar';
import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';
import { MonomerItemType } from 'domain/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMonomerItem(label = 'X'): MonomerItemType {
  return {
    label,
    props: {
      MonomerNaturalAnalogCode: label,
      MonomerClass: 'AminoAcid',
    },
  } as unknown as MonomerItemType;
}

function makeSugar(): Sugar {
  const m = new Sugar(makeMonomerItem('R'), undefined);
  // Ensure it has R1, R2, R3 APs
  m.attachmentPointsToBonds = {
    R1: null,
    R2: null,
    R3: null,
  };
  return m;
}

function makeRNABase(): RNABase {
  const m = new RNABase(makeMonomerItem('A'), undefined);
  m.attachmentPointsToBonds = {
    R1: null,
  };
  return m;
}

function makePhosphate(): Phosphate {
  const m = new Phosphate(makeMonomerItem('P'), undefined);
  m.attachmentPointsToBonds = {
    R1: null,
    R2: null,
  };
  return m;
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
