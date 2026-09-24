import { test, expect, Page, Locator } from '@fixtures';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { openFileAndAddToCanvasMacro } from '@utils/index';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  countMonomerBonds,
  getMonomerId,
  hasBondBetweenMonomers,
} from '@utils/macromolecules/bonds';
import { dragLibraryItemOntoMonomer } from '@utils/macromolecules/replacement';

let page: Page;

/** RNA presets A-C, standard bonds: inter-preset bond is A.phosphate(R2)->C.sugar(R1). */
const PRESET_CHAIN_FIXTURE =
  'Monomer-Replacement/preset-chain-same-geometry.ket';
/** Same chain with preset C placed diagonally (non-standard bond length/angle). */
const NON_STANDARD_BONDS_FIXTURE =
  'Monomer-Replacement/preset-non-standard-bonds.ket';
// Tolerance for "monomer did not move" bounding-box comparisons.
const BBOX_TOLERANCE_PX = 1;

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

/** The leftmost/rightmost element matching the locator (preset A sits left of preset C). */
async function extremeMonomer(locator: Locator, side: 'left' | 'right') {
  const count = await locator.count();
  let best = locator.nth(0);
  let bestX =
    side === 'left' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  for (let i = 0; i < count; i++) {
    const bb = await locator.nth(i).boundingBox();
    if (!bb) continue;
    if (
      (side === 'left' && bb.x < bestX) ||
      (side === 'right' && bb.x > bestX)
    ) {
      bestX = bb.x;
      best = locator.nth(i);
    }
  }
  return best;
}

/** Asserts that a monomer kept its position (bounding box within tolerance). */
async function expectMonomerKeptPosition(locator: Locator, before: Point) {
  const after = await getCenterPoint(locator);
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(BBOX_TOLERANCE_PX);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(BBOX_TOLERANCE_PX);
}

/**
 * Captures preset C (the right-hand preset of the fixtures) components by
 * their stable monomer IDs and centers, so they can be re-located after a
 * replacement introduces a second identical preset.
 */
async function capturePresetC() {
  const base = getMonomerLocator(page, Base.C);
  const sugar = await extremeMonomer(getMonomerLocator(page, Sugar.R), 'right');
  const phosphate = await extremeMonomer(
    getMonomerLocator(page, Phosphate.P),
    'right',
  );
  return {
    base: { id: await getMonomerId(base), before: await getCenterPoint(base) },
    sugar: {
      id: await getMonomerId(sugar),
      before: await getCenterPoint(sugar),
    },
    phosphate: {
      id: await getMonomerId(phosphate),
      before: await getCenterPoint(phosphate),
    },
  };
}

/** Locates a monomer by its stable `data-monomerid`. */
function monomerById(id: string) {
  return getMonomerLocator(page, { monomerId: id });
}

test.describe('Drag-and-drop preset replacement (issue #7455)', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Replaces a preset with a same-geometry preset and keeps the inter-preset bond', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Dropping a same-geometry preset (same component slots, same
     * phosphate side) onto a canvas preset replaces the whole preset; the
     * inter-preset bond is re-established on the corresponding components
     * (req. 4-6).
     */
    await openFileAndAddToCanvasMacro(page, PRESET_CHAIN_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );

    await dragLibraryItemOntoMonomer(page, Preset.C, sugarA);

    expect(await ConfirmYourActionDialog(page).isVisible()).toBe(false);
    expect(await getMonomerLocator(page, Base.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Base.C).count()).toBe(2);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(2);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(2);

    // The inter-preset bond (phosphate -> next sugar) is re-established.
    const newPhosphate = await extremeMonomer(
      getMonomerLocator(page, Phosphate.P),
      'left',
    );
    const sugarC = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'right',
    );
    expect(await hasBondBetweenMonomers(page, newPhosphate, sugarC)).toBe(true);
  });

  test('Replaces the whole preset when dropped onto any of its components', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Dropping a same-geometry preset onto the base component of
     * a canvas preset replaces all corresponding components, not just the hit
     * one (req. 4).
     */
    await openFileAndAddToCanvasMacro(page, PRESET_CHAIN_FIXTURE);
    const { base } = Preset.A;
    if (!base) {
      throw new Error('Preset A must have a base component');
    }
    const baseA = getMonomerLocator(page, base);

    await dragLibraryItemOntoMonomer(page, Preset.G, baseA);

    expect(await ConfirmYourActionDialog(page).isVisible()).toBe(false);
    expect(await baseA.count()).toBe(0);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    expect(await getMonomerLocator(page, Base.C).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(2);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(2);
  });

  test('Replaces a preset with a different-sugar preset of the same slot composition', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: "Same geometry" compares which structural slots are filled
     * and the phosphate side, not monomer identities — a deoxyribose preset
     * still replaces a ribose preset (req. 4/6; verified against
     * presetsHaveSameGeometry in replacementHelpers.ts).
     */
    await openFileAndAddToCanvasMacro(page, PRESET_CHAIN_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );

    await dragLibraryItemOntoMonomer(page, Preset.dR_U_P, sugarA);

    expect(await ConfirmYourActionDialog(page).isVisible()).toBe(false);
    expect(await getMonomerLocator(page, Base.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Base.U).count()).toBe(1);
    expect(await getMonomerLocator(page, Base.C).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.dR).count()).toBe(1);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(2);
  });

  test('Shows the "Deletion of bonds" modal when a preset component lacks the bonded AP — Cancel keeps the original', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: The 12ddR sugar has no base attachment point (R3), so
     * replacing a full preset with the base-less 12ddR()P preset would delete
     * the bond to the kept base — the "Deletion of bonds" modal is shown;
     * Cancel leaves the canvas unchanged (req. 7.1).
     */
    await openFileAndAddToCanvasMacro(page, PRESET_CHAIN_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );

    await dragLibraryItemOntoMonomer(page, Preset._12ddR__P, sugarA);

    const dialog = ConfirmYourActionDialog(page);
    await expect(dialog.window).toBeVisible();
    expect(await dialog.getMessageBodyText()).toBe(
      'Some bonds will get deleted during replacement. Do you wish to proceed.',
    );

    await dialog.cancel();
    await expect(dialog.window).toBeHidden();

    expect(await getMonomerLocator(page, Base.A).count()).toBe(1);
    expect(await getMonomerLocator(page, Base.C).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(2);
    expect(await getMonomerLocator(page, Sugar._12ddR).count()).toBe(0);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(2);
  });

  test('Deletes the lost bond and keeps the unprovided component when the modal is confirmed', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Confirming the "Deletion of bonds" modal replaces the
     * sugar and phosphate; the kept base loses its (unre-establishable) bond,
     * while the inter-preset bond is re-established on the new phosphate
     * (req. 7.1).
     */
    await openFileAndAddToCanvasMacro(page, PRESET_CHAIN_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );

    await dragLibraryItemOntoMonomer(page, Preset._12ddR__P, sugarA);

    const dialog = ConfirmYourActionDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.yes();
    await expect(dialog.window).toBeHidden();

    expect(await getMonomerLocator(page, Base.A).count()).toBe(1);
    expect(await getMonomerLocator(page, Base.C).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(1);
    expect(await getMonomerLocator(page, Sugar._12ddR).count()).toBe(1);
    expect(await getMonomerLocator(page, Phosphate.P).count()).toBe(2);

    // The kept base is orphaned: its bond to the replaced sugar was deleted.
    const keptBase = getMonomerLocator(page, Base.A);
    expect(await countMonomerBonds(page, keptBase)).toBe(0);

    // New phosphate carries the internal bond plus the re-established
    // inter-preset bond.
    const newPhosphate = await extremeMonomer(
      getMonomerLocator(page, Phosphate.P),
      'left',
    );
    expect(await countMonomerBonds(page, newPhosphate)).toBe(2);
  });

  test('Does not re-trigger the layout when replacing a preset in flex mode', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: With standard bond lengths/angles, replacing a preset does
     * not trigger a new layout — the neighboring preset keeps its positions
     * (req. 12.1, flex).
     */
    await openFileAndAddToCanvasMacro(page, PRESET_CHAIN_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );
    const presetC = await capturePresetC();

    await dragLibraryItemOntoMonomer(page, Preset.G, sugarA);

    expect(await getMonomerLocator(page, Base.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    await expectMonomerKeptPosition(
      monomerById(presetC.base.id),
      presetC.base.before,
    );
    await expectMonomerKeptPosition(
      monomerById(presetC.sugar.id),
      presetC.sugar.before,
    );
    await expectMonomerKeptPosition(
      monomerById(presetC.phosphate.id),
      presetC.phosphate.before,
    );
  });

  test('Does not re-trigger the layout when replacing a preset in snake mode', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: With standard bond lengths/angles, replacing a preset does
     * not trigger a new layout in snake mode either — the neighboring preset
     * keeps its positions (req. 12.1, snake).
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(page, PRESET_CHAIN_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );
    const presetC = await capturePresetC();

    await dragLibraryItemOntoMonomer(page, Preset.G, sugarA);

    expect(await getMonomerLocator(page, Base.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    await expectMonomerKeptPosition(
      monomerById(presetC.base.id),
      presetC.base.before,
    );
    await expectMonomerKeptPosition(
      monomerById(presetC.sugar.id),
      presetC.sugar.before,
    );
    await expectMonomerKeptPosition(
      monomerById(presetC.phosphate.id),
      presetC.phosphate.before,
    );
  });

  test('Does not re-trigger the layout for same-geometry replacement even with non-standard bond geometry', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Same-geometry preset replacement never re-runs the layout —
     * a chain with non-standard bond lengths/angles keeps its hand-adjusted
     * geometry after replacement (req. 12; the snake layout trigger only exists
     * on the preset-to-monomer path, covered in drag-drop-replace-preset-onto-monomer.spec.ts).
     */
    await openFileAndAddToCanvasMacro(page, NON_STANDARD_BONDS_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );
    const presetC = await capturePresetC();

    await dragLibraryItemOntoMonomer(page, Preset.G, sugarA);

    expect(await getMonomerLocator(page, Base.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    await expectMonomerKeptPosition(
      monomerById(presetC.base.id),
      presetC.base.before,
    );
    await expectMonomerKeptPosition(
      monomerById(presetC.sugar.id),
      presetC.sugar.before,
    );
    await expectMonomerKeptPosition(
      monomerById(presetC.phosphate.id),
      presetC.phosphate.before,
    );
  });

  test('Keeps the replaced preset sugar position in flex mode with non-standard bonds', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: In flex mode the new preset is anchored at the replaced
     * one — its sugar renders at the old sugar position even when the chain
     * has non-standard bond geometry (req. 12.3).
     */
    await openFileAndAddToCanvasMacro(page, NON_STANDARD_BONDS_FIXTURE);
    const sugarA = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );
    const beforeSugar = await getCenterPoint(sugarA);

    await dragLibraryItemOntoMonomer(page, Preset.G, sugarA);

    expect(await getMonomerLocator(page, Base.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    const newSugar = await extremeMonomer(
      getMonomerLocator(page, Sugar.R),
      'left',
    );
    await expectMonomerKeptPosition(newSugar, beforeSugar);
  });
});
