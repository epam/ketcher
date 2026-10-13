import { test, expect, Page, Locator } from '@fixtures';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  openFileAndAddToCanvasMacro,
  redoByKeyboard,
  undoByKeyboard,
} from '@utils/index';
import {
  AttachmentPoint,
  getMonomerLocator,
  MonomerLocatorOptions,
  moveMonomer,
} from '@utils/macromolecules/monomer';
import {
  countMonomerBonds,
  hasBondBetweenMonomers,
} from '@utils/macromolecules/bonds';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import {
  cancelDrag,
  dragLibraryItemOntoMonomer,
  getElementCenterInCanvasCoords,
  moveDragToCanvasCoords,
  startDragLibraryItem,
} from '@utils/macromolecules/replacement';

let page: Page;

/** Peptide A-C-D chain with standard backbone bonds (A.R2->C.R1, C.R2->D.R1). */
const CHAIN_FIXTURE = 'Monomer-Replacement/monomer-chain-simple.ket';
// Must be greater than the 10 px replacement radius.
const OUT_OF_RADIUS_OFFSET = 40;
// Canvas-relative placement points (kept <= ~420 px: with the library open in
// popup mode drops beyond that land on the library panel).
const PRESET_X = 300;
const PRESET_Y = 300;
const CHEM_X = 300;
const CHEM_Y = 420;
// Tolerance for "monomer did not move" bounding-box comparisons. A few px of
// slack is needed: the monomer bbox differs slightly between selection states
// (a re-triggered layout would shift a monomer by whole grid cells, ~60 px).
const BBOX_TOLERANCE_PX = 3;

interface Point {
  x: number;
  y: number;
}

/** Page-absolute center of a canvas element, used for proximity lookups. */
async function getCenterPoint(locator: Locator): Promise<Point> {
  const bb = await locator.boundingBox();
  if (!bb) {
    throw new Error('Bounding box is not available');
  }
  return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
}

/** The monomer matching `monomer` whose center is closest to a page point. */
async function getMonomerClosestToPoint(
  monomer: MonomerLocatorOptions,
  point: Point,
) {
  const locator = getMonomerLocator(page, monomer);
  const count = await locator.count();
  let closest = locator.nth(0);
  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < count; i++) {
    const candidate = locator.nth(i);
    const distance = Math.hypot(
      (await getCenterPoint(candidate)).x - point.x,
      (await getCenterPoint(candidate)).y - point.y,
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = candidate;
    }
  }
  return closest;
}

/** Asserts that a monomer kept its position (bounding box within tolerance). */
async function expectMonomerKeptPosition(locator: Locator, before: Point) {
  const after = await getCenterPoint(locator);
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(BBOX_TOLERANCE_PX);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(BBOX_TOLERANCE_PX);
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

test.describe('Drag-and-drop monomer replacement (issue #7455)', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Replaces a terminal peptide monomer and keeps the bond to its neighbor', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Dropping a library monomer within the replacement radius of
     * a chain-end monomer replaces it; the bond to the neighbor is kept and no
     * layout re-trigger moves the rest of the chain (req. 1-2, 11).
     */
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);
    const monomerD = getMonomerLocator(page, Peptide.D);
    expect(await monomerA.count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await monomerD.count()).toBe(1);

    const centerC = await getCenterPoint(monomerC);
    const centerD = await getCenterPoint(monomerD);

    await dragLibraryItemOntoMonomer(page, Peptide.F, monomerA);

    const monomerF = getMonomerLocator(page, Peptide.F);
    expect(await monomerA.count()).toBe(0);
    expect(await monomerF.count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await monomerD.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, monomerF, monomerC)).toBe(true);

    // No layout re-trigger: the neighbors of the replaced monomer stay put.
    await expectMonomerKeptPosition(monomerC, centerC);
    await expectMonomerKeptPosition(monomerD, centerD);
  });

  test('Replaces an internal monomer and re-establishes bonds on both sides', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Replacing a monomer in the middle of a chain re-establishes
     * all possible bonds, so the new monomer is bonded to both neighbors (req. 3).
     */
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);
    const monomerD = getMonomerLocator(page, Peptide.D);

    await dragLibraryItemOntoMonomer(page, Peptide.F, monomerC);

    const monomerF = getMonomerLocator(page, Peptide.F);
    expect(await monomerC.count()).toBe(0);
    expect(await monomerF.count()).toBe(1);
    expect(await monomerA.count()).toBe(1);
    expect(await monomerD.count()).toBe(1);
    expect(await countMonomerBonds(page, monomerF)).toBe(2);
    expect(await hasBondBetweenMonomers(page, monomerA, monomerF)).toBe(true);
    expect(await hasBondBetweenMonomers(page, monomerF, monomerD)).toBe(true);
  });

  test('Replaces a peptide with a chem monomer and keeps the bond to its neighbor', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: A chem item dropped on a chain-end peptide replaces it; the
     * backbone bond to the neighbor is re-established (QA note: bonds between
     * monomers and small molecules must survive replacement).
     */
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);

    await dragLibraryItemOntoMonomer(page, Chem.EG, monomerA);

    const chemEG = getMonomerLocator(page, Chem.EG);
    expect(await monomerA.count()).toBe(0);
    expect(await chemEG.count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, chemEG, monomerC)).toBe(true);
    expect(await countMonomerBonds(page, chemEG)).toBe(1);
  });

  test('Does not replace when dropped outside the replacement radius', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Dropping a library monomer farther than the 10 px replacement
     * radius from the target center does not replace it — a new monomer is
     * added instead (req. 1, negative case).
     */
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const targetCenter = await getElementCenterInCanvasCoords(page, monomerA);

    await Library(page).dragMonomerOnCanvas(Peptide.F, {
      x: targetCenter.x + OUT_OF_RADIUS_OFFSET,
      y: targetCenter.y,
    });

    expect(await getMonomerLocator(page, Peptide.F).count()).toBe(1);
    expect(await monomerA.count()).toBe(1);
  });

  test('Shows the replacement highlight on drag-over and clears it on cancel', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: While dragging a library monomer over a valid replacement
     * target the target is highlighted; cancelling the drag removes the
     * highlight and changes nothing (req. 1 visual feedback).
     */
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const targetCenter = await getElementCenterInCanvasCoords(page, monomerA);
    const highlight = page.getByTestId('replacement-highlight');
    expect(await highlight.count()).toBe(0);

    await startDragLibraryItem(page, Peptide.F);
    await moveDragToCanvasCoords(page, targetCenter);
    await expect(highlight).toBeVisible();

    await cancelDrag(page);
    await expect(highlight).toHaveCount(0);
    expect(await monomerA.count()).toBe(1);
  });

  test('Replaces only the targeted component when a monomer is dropped onto a preset', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: A monomer dropped on one component of a canvas preset
     * replaces only that component; the rest of the preset structure is kept.
     */
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: PRESET_X,
      y: PRESET_Y,
    });

    const { sugar, base, phosphate } = Preset.A;
    if (!base || !phosphate) {
      throw new Error('Preset A must have base and phosphate components');
    }
    const sugarR = getMonomerLocator(page, sugar);
    const baseA = getMonomerLocator(page, base);
    const phosphateP = getMonomerLocator(page, phosphate);
    expect(await sugarR.count()).toBe(1);
    expect(await baseA.count()).toBe(1);
    expect(await phosphateP.count()).toBe(1);

    await dragLibraryItemOntoMonomer(page, Base.G, baseA);

    expect(await getMonomerLocator(page, Base.G).count()).toBe(1);
    expect(await baseA.count()).toBe(0);
    expect(await sugarR.count()).toBe(1);
    expect(await phosphateP.count()).toBe(1);
  });

  test('Shows the "Deletion of bonds" modal on replacement and Cancel keeps the original monomer', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: When the replacement item lacks an attachment point the
     * target was bonded with, the "Deletion of bonds" modal is shown; Cancel
     * aborts the replacement and leaves the canvas unchanged (req. 3.1).
     */
    await openChainWithChemBondedToCysteine();
    const monomerC = getMonomerLocator(page, Peptide.C);
    const chemEG = getMonomerLocator(page, Chem.EG);

    // Alanine has only left/right APs, so the C-EG side-chain bond would be lost.
    await dragLibraryItemOntoMonomer(page, Peptide.A, monomerC);

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
    expect(await chemEG.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, monomerC, chemEG)).toBe(true);
  });

  test('Performs the replacement and deletes the lost bond when the modal is confirmed', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Confirming the "Deletion of bonds" modal replaces the
     * monomer; the bond that had no matching attachment point on the new
     * monomer is deleted, all other bonds are re-established (req. 3.1).
     */
    await openChainWithChemBondedToCysteine();
    const monomerC = getMonomerLocator(page, Peptide.C);
    const monomerD = getMonomerLocator(page, Peptide.D);
    const chemEG = getMonomerLocator(page, Chem.EG);
    const replacedCenter = await getCenterPoint(monomerC);

    await dragLibraryItemOntoMonomer(page, Peptide.A, monomerC);

    const dialog = ConfirmYourActionDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.yes();
    await expect(dialog.window).toBeHidden();

    expect(await monomerC.count()).toBe(0);
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(2);
    expect(await monomerD.count()).toBe(1);
    expect(await chemEG.count()).toBe(1);

    // The new alanine sits where the cysteine was.
    const newAlanine = await getMonomerClosestToPoint(
      Peptide.A,
      replacedCenter,
    );
    expect(await countMonomerBonds(page, newAlanine)).toBe(2);
    expect(await hasBondBetweenMonomers(page, newAlanine, monomerD)).toBe(true);

    // The side-chain bond to the chem monomer was deleted.
    expect(await countMonomerBonds(page, chemEG)).toBe(0);
  });

  test('Restores the original monomer and its bonds when the replacement is undone', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Undoing a drag-and-drop replacement restores the original
     * monomer with all of its bonds intact (undo/redo coverage).
     */
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);

    await dragLibraryItemOntoMonomer(page, Peptide.F, monomerA);
    expect(await monomerA.count()).toBe(0);
    expect(await getMonomerLocator(page, Peptide.F).count()).toBe(1);

    await undoByKeyboard(page);

    expect(await monomerA.count()).toBe(1);
    expect(await getMonomerLocator(page, Peptide.F).count()).toBe(0);
    expect(await monomerC.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, monomerA, monomerC)).toBe(true);
  });

  test('Re-applies the replacement when it is redone after undo', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Redoing an undone drag-and-drop replacement re-applies it —
     * the replacement monomer is back with its bond to the neighbor
     * (undo/redo coverage).
     */
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);

    await dragLibraryItemOntoMonomer(page, Peptide.F, monomerA);
    await undoByKeyboard(page);
    expect(await monomerA.count()).toBe(1);

    await redoByKeyboard(page);

    const monomerF = getMonomerLocator(page, Peptide.F);
    expect(await monomerA.count()).toBe(0);
    expect(await monomerF.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, monomerF, monomerC)).toBe(true);
  });

  test('Does not re-trigger the layout when replacing a monomer in snake mode', async () => {
    /*
     * Test case: #7455 - Monomer replacement via drag-and-drop from library
     * Description: Replacing a monomer with another monomer does not trigger a
     * new layout in any mode — in snake mode the neighbors of the replaced
     * monomer keep their positions (req. 11). The fixture is saved already
     * laid out, so a re-triggered layout would be invisible; D is moved off
     * its grid cell first — the snake layout always anchors the chain at a
     * fixed canvas origin, so any re-layout on replacement would snap D back.
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(page, CHAIN_FIXTURE);
    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);
    const monomerD = getMonomerLocator(page, Peptide.D);

    // Move D away from its layout position so a re-triggered layout is visible.
    const originalD = await getCenterPoint(monomerD);
    await moveMonomer(page, monomerD, originalD.x + 120, originalD.y + 120);
    const movedD = await getCenterPoint(monomerD);
    const centerA = await getCenterPoint(monomerA);

    await dragLibraryItemOntoMonomer(page, Peptide.F, monomerC);

    expect(await monomerC.count()).toBe(0);
    expect(await getMonomerLocator(page, Peptide.F).count()).toBe(1);
    await expectMonomerKeptPosition(monomerA, centerA);
    await expectMonomerKeptPosition(monomerD, movedD);
  });
});
