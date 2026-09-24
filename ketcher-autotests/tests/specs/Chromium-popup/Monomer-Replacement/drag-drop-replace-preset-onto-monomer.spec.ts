import { test, expect, Page, Locator } from '@fixtures';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import {
  getMonomerLocator,
  MonomerLocatorOptions,
  AttachmentPoint,
} from '@utils/macromolecules/monomer';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { openFileAndAddToCanvasMacro } from '@utils/index';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import {
  countMonomerBonds,
  getBondAttachmentPoints,
  getMonomerId,
  hasBondBetweenMonomers,
} from '@utils/macromolecules/bonds';
import { dragLibraryItemOntoMonomer } from '@utils/macromolecules/replacement';

let page: Page;

/** Preset A - lone sugar R - preset C; bonds: A.P(R2)->R(R1), R(R2)->C.P(R2). */
const RN_BOND_PRIORITY_FIXTURE = 'Monomer-Replacement/rn-bond-priority.ket';
/** Preset A - lone phosphate P - preset C; bonds: A.P(R2)->P(R1), P(R2)->C.S(R1). */
const LONE_PHOSPHATE_FIXTURE = 'Monomer-Replacement/preset-lone-phosphate.ket';
/** 4-preset RNA chain extended with a terminal lone phosphate + lone sugar. */
const LONG_CHAIN_FIXTURE = 'Monomer-Replacement/long-chain-lone-monomer.ket';
/** Peptide A-C-D chain (cysteine side AP R3 is free). */
const CHAIN_FIXTURE = 'Monomer-Replacement/monomer-chain-simple.ket';
/** Peptide A-C chain, C bonded to chem EG via C.R2(OH)/EG.R1(H). */
const CHEM_FIXTURE = 'Monomer-Replacement/chem-bonded-target.ket';

// Drop position for the extra chem EG (canvas coordinates).
const CHEM_X = 300;
const CHEM_Y = 420;
// Tolerance for "monomer did not move" bounding-box comparisons.
const BBOX_TOLERANCE_PX = 1;
// Tolerance for "new component anchored at the replaced monomer's position".
// The new sugar is anchored at the target's model position, but bounding-box
// centers carry a per-glyph offset — up to ~5 px when the replaced monomer and
// the new anchor are different types (e.g. phosphate -> sugar).
const ANCHOR_TOLERANCE_PX = 6;
// Minimum displacement (px) proving a layout reflow/shift happened.
const MIN_SHIFT_PX = 30;

interface Point {
  x: number;
  y: number;
}

/** Page-absolute center of a canvas element. */
async function getCenterPoint(locator: Locator): Promise<Point> {
  const bb = await locator.boundingBox();
  if (!bb) {
    throw new Error('Bounding box is not available');
  }
  return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
}

/** Asserts that a monomer kept its position (bounding box within tolerance). */
async function expectMonomerKeptPosition(locator: Locator, before: Point) {
  const after = await getCenterPoint(locator);
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(BBOX_TOLERANCE_PX);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(BBOX_TOLERANCE_PX);
}

/** Asserts that a (new) monomer is anchored at an expected canvas point. */
async function expectAnchoredAt(locator: Locator, expected: Point) {
  const actual = await getCenterPoint(locator);
  expect(Math.abs(actual.x - expected.x)).toBeLessThanOrEqual(
    ANCHOR_TOLERANCE_PX,
  );
  expect(Math.abs(actual.y - expected.y)).toBeLessThanOrEqual(
    ANCHOR_TOLERANCE_PX,
  );
}

/** Asserts that a monomer moved by at least MIN_SHIFT_PX from `before`. */
async function expectMonomerShifted(locator: Locator, before: Point) {
  const after = await getCenterPoint(locator);
  expect(
    Math.hypot(after.x - before.x, after.y - before.y),
  ).toBeGreaterThanOrEqual(MIN_SHIFT_PX);
}

/** The lone (non-preset) sugar: the only sugar without a bond at R3. */
async function findLoneSugar(): Promise<Locator> {
  const sugars = getMonomerLocator(page, Sugar.R);
  for (let i = 0; i < (await sugars.count()); i++) {
    if ((await countMonomerBonds(page, sugars.nth(i), 'R3')) === 0) {
      return sugars.nth(i);
    }
  }
  throw new Error('No lone sugar found');
}

/** The monomer among `candidates` that is bonded to `target`. */
async function findBondedMonomer(
  target: Locator,
  candidates: Locator[],
): Promise<Locator> {
  for (const candidate of candidates) {
    if (await hasBondBetweenMonomers(page, target, candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `No monomer bonded to the target found among ${candidates.length} candidates`,
  );
}

/** All monomer ids of `type` currently on the canvas. */
async function collectIds(type: MonomerLocatorOptions): Promise<Set<string>> {
  const all = getMonomerLocator(page, type);
  const ids = new Set<string>();
  for (let i = 0; i < (await all.count()); i++) {
    ids.add(await getMonomerId(all.nth(i)));
  }
  return ids;
}

/**
 * The monomers of `type` created by a replacement: their stable ids were not
 * present before the drop (old components are deleted, new ones get fresh ids).
 */
async function findNewMonomers(
  type: MonomerLocatorOptions,
  oldIds: Set<string>,
): Promise<Locator[]> {
  const all = getMonomerLocator(page, type);
  const created: Locator[] = [];
  for (let i = 0; i < (await all.count()); i++) {
    if (!oldIds.has(await getMonomerId(all.nth(i)))) {
      created.push(all.nth(i));
    }
  }
  return created;
}

/** Peptide A-C-D chain plus a chem EG bonded to the cysteine side AP (C.R3->EG.R1). */
async function openChainWithChemBondedToCysteine() {
  await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
  const monomerC = getMonomerLocator(page, Peptide.C);
  const chemEG = getMonomerLocator(page, Chem.EG);
  await Library(page).dragMonomerOnCanvas(Chem.EG, {
    x: CHEM_X,
    y: CHEM_Y,
  });
  // Peptide-to-chem bonding opens the attachment-point dialog; cysteine's only
  // free AP is its side chain (R3), so bond C.R3 -> EG.R1.
  await bondTwoMonomers(
    page,
    monomerC,
    chemEG,
    AttachmentPoint.R3,
    AttachmentPoint.R1,
  );
  expect(await hasBondBetweenMonomers(page, monomerC, chemEG)).toBe(true);
}

test.describe('Drag-and-drop preset onto single monomer (issue #7455)', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Replaces a single monomer with a preset and anchors the new sugar at the old position', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Dropping an RNA preset onto a lone (non-preset) canvas
     * monomer replaces that monomer with the whole preset; the new sugar is
     * anchored at the replaced monomer's position (req. 8-9).
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(page, RN_BOND_PRIORITY_FIXTURE);
    const loneSugar = await findLoneSugar();
    const beforeCenter = await getCenterPoint(loneSugar);
    const oldSugarIds = await collectIds(Sugar.R);

    await dragLibraryItemOntoMonomer(page, Preset.G, loneSugar);

    expect(await ConfirmYourActionDialog(page).isVisible()).toBe(false);
    expect(await getMonomerLocator(page, Base.A).count()).toBe(1);
    expect(await getMonomerLocator(page, Base.C).count()).toBe(1);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(3);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(3);

    const [newSugar] = await findNewMonomers(Sugar.R, oldSugarIds);
    if (!newSugar) {
      throw new Error('Replacement did not create a new sugar');
    }
    // The new sugar carries the preset base (bond at R3) and sits where the
    // lone sugar was.
    expect(await countMonomerBonds(page, newSugar, 'R3')).toBe(1);
    await expectAnchoredAt(newSugar, beforeCenter);
  });

  test('Re-establishes the R1 bond on the new sugar and drops the R2 bond whose AP is taken by an internal preset bond', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: The replaced lone sugar's bonds are re-routed to the new
     * preset component of the same role (the sugar). The R1 bond is kept on
     * the new sugar's R1; the R2 bond cannot be re-established because the
     * new sugar's R2 is consumed by the internal sugar-phosphate bond, so it
     * is dropped without a modal (req. 10; verified against
     * findNewPresetComponentForBond + the free-AP check in replacePreset).
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(page, RN_BOND_PRIORITY_FIXTURE);
    const loneSugar = await findLoneSugar();
    const oldSugarIds = await collectIds(Sugar.R);
    const oldPhosphateIds = await collectIds(Phosphate.P);

    // Identify the two preset phosphates structurally (base -> sugar -> P).
    const aSugar = await findBondedMonomer(
      getMonomerLocator(page, Base.A),
      await allOf(Sugar.R),
    );
    const aPhosphate = await findBondedMonomer(
      aSugar,
      await allOf(Phosphate.P),
    );

    await dragLibraryItemOntoMonomer(page, Preset.G, loneSugar);

    const [newSugar] = await findNewMonomers(Sugar.R, oldSugarIds);
    const [newPhosphate] = await findNewMonomers(Phosphate.P, oldPhosphateIds);
    if (!newSugar || !newPhosphate) {
      throw new Error('Replacement did not create new sugar/phosphate');
    }

    // Upstream bond (preset A phosphate R2 -> lone sugar R1) is re-established
    // on the new sugar's R1.
    expect(await hasBondBetweenMonomers(page, aPhosphate, newSugar)).toBe(true);
    expect(await getBondAttachmentPoints(page, newSugar, aPhosphate)).toEqual({
      from: 'R1',
      to: 'R2',
    });

    // Downstream bond (lone sugar R2 -> preset C phosphate R2) is dropped:
    // the new phosphate keeps only its internal bond.
    const cSugar = await findBondedMonomer(
      getMonomerLocator(page, Base.C),
      await allOf(Sugar.R),
    );
    const cPhosphate = await findBondedMonomer(
      cSugar,
      await allOf(Phosphate.P),
    );
    expect(await hasBondBetweenMonomers(page, newPhosphate, cPhosphate)).toBe(
      false,
    );
    expect(await countMonomerBonds(page, cPhosphate)).toBe(1);
  });

  test('Shows the "Deletion of bonds" modal when no preset component has a free Rn — Cancel keeps the original', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: The cysteine is bonded at R1, R2 and R3 (side chain to
     * chem EG). Preset A only offers free R1 (sugar) and R2 (phosphate), so
     * the R3 bond would be lost — the "Deletion of bonds" modal is shown;
     * Cancel leaves the canvas unchanged (req. 10.3).
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openChainWithChemBondedToCysteine();
    const monomerC = getMonomerLocator(page, Peptide.C);

    await dragLibraryItemOntoMonomer(page, Preset.A, monomerC);

    const dialog = ConfirmYourActionDialog(page);
    await expect(dialog.window).toBeVisible();
    expect(await dialog.getMessageBodyText()).toBe(
      'Some bonds will get deleted during replacement. Do you wish to proceed.',
    );

    await dialog.cancel();
    await expect(dialog.window).toBeHidden();

    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await getMonomerLocator(page, Peptide.D).count()).toBe(1);
    expect(await getMonomerLocator(page, Chem.EG).count()).toBe(1);
    expect(await countMonomerBonds(page, monomerC)).toBe(3);
    expect(await getMonomerLocator(page, Base.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(0);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(0);
  });

  test('Routes the remaining bonds by sugar > phosphate priority and drops the R3 bond when confirmed', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Confirming the modal replaces the cysteine with preset A.
     * The R1 bond goes to the new sugar's free R1; the R2 bond cannot use the
     * sugar (R2 is internal) and falls back to the phosphate's free R2; the
     * R3 bond (to chem EG) has no free Rn on any component and is deleted,
     * orphaning the EG (req. 10.1-10.3).
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openChainWithChemBondedToCysteine();
    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerD = getMonomerLocator(page, Peptide.D);
    const chemEG = getMonomerLocator(page, Chem.EG);
    const monomerC = getMonomerLocator(page, Peptide.C);

    await dragLibraryItemOntoMonomer(page, Preset.A, monomerC);

    const dialog = ConfirmYourActionDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.yes();
    await expect(dialog.window).toBeHidden();

    expect(await monomerC.count()).toBe(0);
    expect(await getMonomerLocator(page, Base.A).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(1);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(1);

    const newSugar = getMonomerLocator(page, Sugar.R);
    const newPhosphate = getMonomerLocator(page, Phosphate.P);

    // R1 bond kept on the new sugar; R2 bond re-routed to the new phosphate.
    expect(await hasBondBetweenMonomers(page, monomerA, newSugar)).toBe(true);
    expect(await getBondAttachmentPoints(page, newSugar, monomerA)).toEqual({
      from: 'R1',
      to: 'R2',
    });
    expect(await hasBondBetweenMonomers(page, newPhosphate, monomerD)).toBe(
      true,
    );
    expect(await getBondAttachmentPoints(page, newPhosphate, monomerD)).toEqual(
      { from: 'R2', to: 'R1' },
    );
    expect(await countMonomerBonds(page, newSugar)).toBe(3);
    expect(await countMonomerBonds(page, newPhosphate)).toBe(2);

    // The R3 bond to the chem is lost; the EG is orphaned.
    expect(await hasBondBetweenMonomers(page, newSugar, chemEG)).toBe(false);
    expect(await hasBondBetweenMonomers(page, newPhosphate, chemEG)).toBe(
      false,
    );
    expect(await countMonomerBonds(page, chemEG)).toBe(0);
  });

  test('Re-lays out the chain in snake mode after a preset replaces a monomer', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: In snake mode the replacement triggers applySnakeLayout —
     * the downstream preset is re-laid out one cell to the right while the
     * upstream preset keeps its positions (req. 13.1).
     */
    await openFileAndAddToCanvasMacro(page, RN_BOND_PRIORITY_FIXTURE);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    const aSugar = await findBondedMonomer(
      getMonomerLocator(page, Base.A),
      await allOf(Sugar.R),
    );
    const cBase = getMonomerLocator(page, Base.C);
    const cSugar = await findBondedMonomer(cBase, await allOf(Sugar.R));
    const aPhosphate = await findBondedMonomer(
      aSugar,
      await allOf(Phosphate.P),
    );
    const cPhosphate = await findBondedMonomer(
      cSugar,
      await allOf(Phosphate.P),
    );
    const aSugarBefore = await getCenterPoint(aSugar);
    const aPhosphateBefore = await getCenterPoint(aPhosphate);
    const cSugarBefore = await getCenterPoint(cSugar);
    const cPhosphateBefore = await getCenterPoint(cPhosphate);
    const loneSugar = await findLoneSugar();

    await dragLibraryItemOntoMonomer(page, Preset.G, loneSugar);

    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);

    // Upstream preset (A) keeps its positions; downstream preset (C) reflows.
    const aSugarAfter = await findBondedMonomer(
      getMonomerLocator(page, Base.A),
      await allOf(Sugar.R),
    );
    const cSugarAfter = await findBondedMonomer(cBase, await allOf(Sugar.R));
    const aPhosphateAfter = await findBondedMonomer(
      aSugarAfter,
      await allOf(Phosphate.P),
    );
    const cPhosphateAfter = await findBondedMonomer(
      cSugarAfter,
      await allOf(Phosphate.P),
    );
    await expectMonomerKeptPosition(aSugarAfter, aSugarBefore);
    await expectMonomerKeptPosition(aPhosphateAfter, aPhosphateBefore);
    await expectMonomerShifted(cSugarAfter, cSugarBefore);
    await expectMonomerShifted(cPhosphateAfter, cPhosphateBefore);
  });

  test('Shifts downstream backbone monomers one cell in flex mode and keeps side branches', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: In flex mode the replacement shifts the backbone monomers
     * downstream of the new phosphate by one cell (shiftDownstreamChainMonomers).
     * The side-branch base is not part of the backbone traversal and stays in
     * place; the downstream bond is re-established on the new phosphate's R2,
     * while the upstream bond to the replaced phosphate's R1 is dropped
     * (req. 13.2).
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(page, LONE_PHOSPHATE_FIXTURE);
    const aSugar = await findBondedMonomer(
      getMonomerLocator(page, Base.A),
      await allOf(Sugar.R),
    );
    const cBase = getMonomerLocator(page, Base.C);
    const cSugar = await findBondedMonomer(cBase, await allOf(Sugar.R));
    const aPhosphate = await findBondedMonomer(
      aSugar,
      await allOf(Phosphate.P),
    );
    const cPhosphate = await findBondedMonomer(
      cSugar,
      await allOf(Phosphate.P),
    );
    const cBaseBefore = await getCenterPoint(cBase);
    const cSugarBefore = await getCenterPoint(cSugar);
    const cPhosphateBefore = await getCenterPoint(cPhosphate);

    // The lone phosphate is the median-x of the three phosphates (flex chain).
    const ps = await allOf(Phosphate.P);
    const boxes: Array<{ i: number; x: number }> = [];
    for (let i = 0; i < ps.length; i++) {
      const bb = await ps[i].boundingBox();
      if (bb) boxes.push({ i, x: bb.x });
    }
    boxes.sort((a, b) => a.x - b.x);
    const lonePhosphate = ps[boxes[1].i];
    const loneBefore = await getCenterPoint(lonePhosphate);
    const oldSugarIds = await collectIds(Sugar.R);
    const oldPhosphateIds = await collectIds(Phosphate.P);

    await dragLibraryItemOntoMonomer(page, Preset.G, lonePhosphate);

    expect(await ConfirmYourActionDialog(page).isVisible()).toBe(false);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(3);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(3);

    const [newSugar] = await findNewMonomers(Sugar.R, oldSugarIds);
    const [newPhosphate] = await findNewMonomers(Phosphate.P, oldPhosphateIds);
    if (!newSugar || !newPhosphate) {
      throw new Error('Replacement did not create new sugar/phosphate');
    }

    // The new sugar is anchored at the replaced phosphate's position.
    await expectAnchoredAt(newSugar, loneBefore);

    // Downstream backbone (preset C sugar + phosphate) shifts one cell right;
    // its side-branch base does not move.
    const cSugarAfter = await findBondedMonomer(cBase, await allOf(Sugar.R));
    const cPhosphateAfter = await findBondedMonomer(
      cSugarAfter,
      await allOf(Phosphate.P),
    );
    await expectMonomerKeptPosition(cBase, cBaseBefore);
    await expectMonomerShifted(cSugarAfter, cSugarBefore);
    await expectMonomerShifted(cPhosphateAfter, cPhosphateBefore);

    // The downstream bond is re-established on the new phosphate's R2.
    expect(await hasBondBetweenMonomers(page, newPhosphate, cSugarAfter)).toBe(
      true,
    );
    expect(
      await getBondAttachmentPoints(page, newPhosphate, cSugarAfter),
    ).toEqual({ from: 'R2', to: 'R1' });

    // The upstream bond (A phosphate -> lone P R1) is dropped: the new
    // phosphate's R1 is consumed by its internal bond.
    expect(await countMonomerBonds(page, aPhosphate)).toBe(1);
  });

  test('Keeps the chem bond when a peptide bonded to a small molecule is replaced by a preset', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: QA note — bonds to small molecules survive replacement:
     * the cysteine's R2 bond to chem EG is re-routed to the new phosphate's
     * free R2 (the sugar's R2 is internal), so the EG stays bonded.
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(page, CHEM_FIXTURE);
    const monomerC = getMonomerLocator(page, Peptide.C);
    const chemEG = getMonomerLocator(page, Chem.EG);

    await dragLibraryItemOntoMonomer(page, Preset.A, monomerC);

    expect(await ConfirmYourActionDialog(page).isVisible()).toBe(false);
    expect(await monomerC.count()).toBe(0);
    expect(await getMonomerLocator(page, Base.A).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(1);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(1);

    const newPhosphate = getMonomerLocator(page, Phosphate.P);
    expect(await hasBondBetweenMonomers(page, newPhosphate, chemEG)).toBe(true);
    expect(await getBondAttachmentPoints(page, newPhosphate, chemEG)).toEqual({
      from: 'R2',
      to: 'R1',
    });
    expect(await countMonomerBonds(page, chemEG)).toBe(1);
  });

  test('Replaces the terminal monomer of a long chain and keeps the upstream bond (req. 14 limitation)', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Replacing the terminal lone sugar of a long chain with a
     * preset works near the viewport edge; the upstream bond (lone phosphate
     * R2 -> sugar R1) is re-established on the new sugar's R1. NOTE: the
     * smooth auto-scroll for this case (req. 14) is not implemented in the
     * current build (task 7.8 of the archived change is unchecked), so no
     * scroll assertion is made here — structural final state only.
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(page, LONG_CHAIN_FIXTURE);
    const loneSugar = await findLoneSugar();
    // The lone phosphate is the only phosphate bonded to the lone sugar.
    const lonePhosphate = await findBondedMonomer(
      loneSugar,
      await allOf(Phosphate.P),
    );
    const lonePhosphateId = await getMonomerId(lonePhosphate);
    const oldSugarIds = await collectIds(Sugar.R);

    await dragLibraryItemOntoMonomer(page, Preset.G, loneSugar);

    expect(await ConfirmYourActionDialog(page).isVisible()).toBe(false);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(2);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(5);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(5);

    const [newSugar] = await findNewMonomers(Sugar.R, oldSugarIds);
    if (!newSugar) {
      throw new Error('Replacement did not create a new sugar');
    }
    expect(
      await hasBondBetweenMonomers(
        page,
        getMonomerLocator(page, { monomerId: lonePhosphateId }),
        newSugar,
      ),
    ).toBe(true);
    expect(
      await getBondAttachmentPoints(
        page,
        newSugar,
        getMonomerLocator(page, { monomerId: lonePhosphateId }),
      ),
    ).toEqual({ from: 'R1', to: 'R2' });
  });
});

/** All current monomer locators of `type` (count-resolved). */
async function allOf(type: MonomerLocatorOptions): Promise<Locator[]> {
  const all = getMonomerLocator(page, type);
  const count = await all.count();
  return Array.from({ length: count }, (_, i) => all.nth(i));
}
