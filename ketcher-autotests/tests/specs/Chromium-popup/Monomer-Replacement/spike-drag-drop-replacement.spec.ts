import { test, expect, Page } from '@fixtures';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  getMonomerLocator,
  connectMonomersWithBonds,
} from '@utils/macromolecules/monomer';
import {
  hasBondBetweenMonomers,
  countMonomerBonds,
} from '@utils/macromolecules/bonds';
import {
  getElementCenterInCanvasCoords,
  startDragLibraryItem,
  moveDragToCanvasCoords,
  cancelDrag,
} from '@utils/macromolecules/replacement';

let page: Page;

/**
 * TEMPORARY SPIKE — Phase 0/1 verification for the drag-and-drop monomer
 * replacement test plan (e2e-test-plan-7455-drag-drop-replacement.md).
 * Delete this file after Phase 1 (its cases are absorbed into the Phase 3+ specs).
 */
test.describe('Spike: drag-and-drop monomer replacement (issue #7455)', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  const FIRST_MONOMER_X = 300;
  const FIRST_MONOMER_Y = 300;
  // Keep within the canvas: with the library open in popup mode the canvas is
  // narrower than the full viewport (drops beyond ~450 px land on the library).
  const SECOND_MONOMER_X = 420;
  // Must be greater than the 10 px replacement radius.
  const OUT_OF_RADIUS_OFFSET = 40;

  test('Spike 1: dropping a monomer on another monomer center replaces it', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: FIRST_MONOMER_X,
      y: FIRST_MONOMER_Y,
    });
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);

    const targetCenter = await getElementCenterInCanvasCoords(
      page,
      getMonomerLocator(page, Peptide.A),
    );
    await Library(page).dragMonomerOnCanvas(Peptide.C, targetCenter);

    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Peptide.C).count()).toBe(1);
  });

  test('Spike 2: dropping outside the 10 px radius adds a new monomer', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: FIRST_MONOMER_X,
      y: FIRST_MONOMER_Y,
    });

    const targetCenter = await getElementCenterInCanvasCoords(
      page,
      getMonomerLocator(page, Peptide.A),
    );
    await Library(page).dragMonomerOnCanvas(Peptide.C, {
      x: targetCenter.x + OUT_OF_RADIUS_OFFSET,
      y: targetCenter.y,
    });

    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
    expect(await getMonomerLocator(page, Peptide.C).count()).toBe(1);
  });

  test('Spike 3: replacement highlight appears on drag-over and clears on cancel', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: FIRST_MONOMER_X,
      y: FIRST_MONOMER_Y,
    });

    const targetCenter = await getElementCenterInCanvasCoords(
      page,
      getMonomerLocator(page, Peptide.A),
    );
    const highlight = page.getByTestId('replacement-highlight');
    expect(await highlight.count()).toBe(0);

    await startDragLibraryItem(page, Peptide.C);
    await moveDragToCanvasCoords(page, targetCenter);
    await expect(highlight).toBeVisible();

    await cancelDrag(page);
    await expect(highlight).toHaveCount(0);
  });

  test('Spike 4: bond helpers report bonds between two bonded monomers', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: FIRST_MONOMER_X,
      y: FIRST_MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.C, {
      x: SECOND_MONOMER_X,
      y: FIRST_MONOMER_Y,
    });
    await connectMonomersWithBonds(page, ['A', 'C']);

    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);

    expect(await hasBondBetweenMonomers(page, monomerA, monomerC)).toBe(true);
    expect(await countMonomerBonds(page, monomerA)).toBe(1);
    expect(await countMonomerBonds(page, monomerC)).toBe(1);
  });
});
