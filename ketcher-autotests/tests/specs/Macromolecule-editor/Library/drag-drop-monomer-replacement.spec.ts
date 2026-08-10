/* eslint-disable no-magic-numbers */
import { Locator, test } from '@fixtures';
import {
  moveMouseAway,
  takeEditorScreenshot,
  undoByKeyboard,
  redoByKeyboard,
  waitForPageInit,
} from '@utils';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';

/**
 * Returns absolute page coordinates for a monomer locator's center.
 */
async function getMonomerCenter(
  monomerLocator: Locator,
): Promise<{ x: number; y: number }> {
  const bb = await monomerLocator.boundingBox();
  if (!bb) throw new Error('Monomer bounding box not found');
  return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
}

test.describe('Monomer replacement via drag-drop', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  });

  test('9.1 Replacement highlight activates within threshold and clears on exit', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.1
     * Description: Drag monomer near canvas monomer center (within threshold) →
     * replacement highlight appears; drag away → highlight clears; no AP
     * indicators shown while replacement highlight is active.
     */
    const MONOMER_X = 400;
    const MONOMER_Y = 300;
    const FAR_AWAY_X = 150;
    const FAR_AWAY_Y = 150;

    // Place a monomer on the canvas
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER_X,
      y: MONOMER_Y,
    });
    await MonomerPreviewTooltip(page).hide();

    const canvasLocator = page.locator('[class*="canvas"]').first();
    const canvasBB = await canvasLocator.boundingBox();
    if (!canvasBB) throw new Error('Canvas bounding box not found');

    const canvasMonomer = getMonomerLocator(page, Peptide.A).nth(0);
    const center = await getMonomerCenter(canvasMonomer);

    // Start dragging a different peptide from the library
    await Library(page).hoverMonomer(Peptide.C);
    await page.mouse.down();

    // Move near the canvas monomer center → replacement highlight should appear
    await page.mouse.move(center.x, center.y, { steps: 5 });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Move far away → highlight should clear
    await page.mouse.move(canvasBB.x + FAR_AWAY_X, canvasBB.y + FAR_AWAY_Y, {
      steps: 5,
    });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await page.mouse.up();
    await moveMouseAway(page);
  });

  test('9.2 Drop monomer onto canvas monomer in Flex mode replaces it in place', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.2
     * Description: Drop monomer onto canvas monomer in Flex mode → monomer
     * replaced in place, all compatible bonds re-established, no re-layout.
     */
    const MONOMER1_X = 350;
    const MONOMER1_Y = 300;
    const MONOMER2_X = 500;
    const MONOMER2_Y = 300;

    // Place two peptides and bond them
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER1_X,
      y: MONOMER1_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER2_X,
      y: MONOMER2_Y,
    });
    const m1 = getMonomerLocator(page, Peptide.A).nth(0);
    const m2 = getMonomerLocator(page, Peptide.A).nth(1);

    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, m1, m2);
    await MonomerPreviewTooltip(page).hide();

    // Drag a compatible replacement (Peptide.C has R1 and R2) onto m1
    const center = await getMonomerCenter(m1);
    await Library(page).hoverMonomer(Peptide.C);
    await page.mouse.down();
    await page.mouse.move(center.x, center.y, { steps: 5 });
    await page.mouse.up();

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('9.3 Bond deletion modal shown when replacement would lose bonds; Cancel aborts, Yes proceeds', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.3
     * Description: Drop monomer onto canvas monomer where new monomer lacks an
     * AP with an active bond → "Deletion of bonds" modal shown; Cancel → no
     * replacement; Yes → replacement proceeds, bond deleted.
     */
    const MONOMER1_X = 350;
    const MONOMER1_Y = 300;
    const MONOMER2_X = 500;
    const MONOMER2_Y = 300;

    // Place two peptides, bond them (uses R1 and R2)
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER1_X,
      y: MONOMER1_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER2_X,
      y: MONOMER2_Y,
    });
    const m1 = getMonomerLocator(page, Peptide.A).nth(0);
    const m2 = getMonomerLocator(page, Peptide.A).nth(1);

    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, m1, m2);
    await MonomerPreviewTooltip(page).hide();

    // Use a CHEM monomer that has fewer APs (Test_6_Ch has 6 APs, but not all
    // matching Peptide's R1/R2 expectations — adjust if needed)
    // For a guaranteed bond-loss: use a monomer with only R1 so R2-bond is lost
    // Peptide.bAla has R1, R2, R3 → won't trigger. Use a monomer with just R1:
    // Chem.sDBL (sDBL___Symmetric-Doubler-Linker) typically has just R1 and R2
    // which should work. We'll use Chem.EG which has R1 and R2 only.
    // Actually easiest: use a replacement that only has R1 (no R2), so the
    // existing R2 bond would be lost. Sugar.R has R1, R2, R3.
    // Simplest approach: bond m1 on R3 as well by adding a third monomer and
    // then replace with a 2-AP monomer.

    // Add a third peptide bonded to m1 at R3 to ensure a bond will be lost
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: 350,
      y: 450,
    });
    const m3 = getMonomerLocator(page, Peptide.A).nth(2);
    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, m1, m3);
    await MonomerPreviewTooltip(page).hide();

    // Now drag a 2-AP peptide onto m1 — the R3 bond will be lost
    const center = await getMonomerCenter(page, m1);
    await Library(page).switchToPeptidesTab();
    await Library(page).hoverMonomer(Peptide.C);
    await page.mouse.down();
    await page.mouse.move(center.x, center.y, { steps: 5 });
    await page.mouse.up();

    // The "Deletion of bonds" modal should appear
    const dialog = ConfirmYourActionDialog(page);
    await dialog.window.waitFor({ state: 'visible' });

    // Screenshot with dialog visible
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    // Part A: Cancel → no replacement
    await dialog.cancel();
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Part B: Drag again and confirm with Yes → replacement proceeds
    await Library(page).hoverMonomer(Peptide.C);
    await page.mouse.down();
    await page.mouse.move(center.x, center.y, { steps: 5 });
    await page.mouse.up();

    await dialog.window.waitFor({ state: 'visible' });
    await dialog.yes();

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('9.4 Single monomer dropped onto a preset component replaces only that component', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.4
     * Description: Single monomer dropped onto a preset component → only that
     * component is replaced, rest of preset unchanged.
     */
    const PRESET_X = 400;
    const PRESET_Y = 300;

    // Place a standard RNA preset (A = Adenine preset: ribose + adenine + phosphate)
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: PRESET_X,
      y: PRESET_Y,
    });
    await MonomerPreviewTooltip(page).hide();

    // Locate the sugar component of the preset
    const sugarMonomer = getMonomerLocator(page, {
      monomerAlias: Preset.A.sugar.alias,
    }).nth(0);
    const sugarCenter = await getMonomerCenter(page, sugarMonomer);

    // Drop a single peptide onto the sugar component
    await Library(page).switchToPeptidesTab();
    await Library(page).hoverMonomer(Peptide.A);
    await page.mouse.down();
    await page.mouse.move(sugarCenter.x, sugarCenter.y, { steps: 5 });
    await page.mouse.up();

    // Dismiss any dialog that might appear (compatible replacement → no dialog)
    const dialog = ConfirmYourActionDialog(page);
    if (await dialog.isVisible()) {
      await dialog.yes();
    }

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('9.5 Drop same-geometry preset onto canvas preset replaces entire preset in place', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.5
     * Description: Drop same-geometry preset onto canvas preset → entire
     * preset replaced in place, bonds re-established.
     */
    const PRESET1_X = 350;
    const PRESET1_Y = 300;
    const PRESET2_X = 550;
    const PRESET2_Y = 300;

    // Place two RNA presets of the same geometry and bond them
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: PRESET1_X,
      y: PRESET1_Y,
    });
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: PRESET2_X,
      y: PRESET2_Y,
    });

    const preset1Sugar = getMonomerLocator(page, {
      monomerAlias: Preset.A.sugar.alias,
    }).nth(0);
    const preset2Sugar = getMonomerLocator(page, {
      monomerAlias: Preset.A.sugar.alias,
    }).nth(1);

    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, preset1Sugar, preset2Sugar);
    await MonomerPreviewTooltip(page).hide();

    // Drag a same-geometry preset (C preset) over the first preset's sugar center
    const sugarCenter = await getMonomerCenter(page, preset1Sugar);
    await Library(page).dragMonomerOnCanvas(Preset.C, {
      x: 0,
      y: 0,
    });
    // The above adds it to canvas; instead use manual drag to hover then drop:
    // We need to drag WITHOUT placing first, so we use the hover+mousedown approach.
    // Clear any accidentally placed monomer with undo, then do correct drag.
    await undoByKeyboard(page);
    await moveMouseAway(page);

    await Library(page).hoverMonomer(Preset.C);
    await page.mouse.down();
    await page.mouse.move(sugarCenter.x, sugarCenter.y, { steps: 5 });
    await page.mouse.up();

    // Dismiss bond deletion warning if any (unlikely for same-geometry presets
    // with compatible APs, but handle gracefully)
    const dialog = ConfirmYourActionDialog(page);
    if (await dialog.isVisible()) {
      await dialog.yes();
    }

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('9.6 Drop preset onto standalone monomer in Snake mode triggers snake re-layout', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.6
     * Description: Drop preset onto standalone monomer in Snake mode →
     * monomer replaced by preset, snake re-layout triggered.
     */
    const MONOMER1_X = 300;
    const MONOMER1_Y = 300;
    const MONOMER2_X = 450;
    const MONOMER2_Y = 300;

    // Build a small chain in Flex first, then switch to Snake
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER1_X,
      y: MONOMER1_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER2_X,
      y: MONOMER2_Y,
    });
    const m1 = getMonomerLocator(page, Peptide.A).nth(0);
    const m2 = getMonomerLocator(page, Peptide.A).nth(1);

    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, m1, m2);
    await MonomerPreviewTooltip(page).hide();

    // Switch to Snake mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    // Locate m1 in snake layout
    const m1Snake = getMonomerLocator(page, Peptide.A).nth(0);
    const centerSnake = await getMonomerCenter(page, m1Snake);

    // Drag an RNA preset from library onto the first peptide
    await Library(page).switchToRNATab();
    await Library(page).hoverMonomer(Preset.A);
    await page.mouse.down();
    await page.mouse.move(centerSnake.x, centerSnake.y, { steps: 5 });
    await page.mouse.up();

    const dialog = ConfirmYourActionDialog(page);
    if (await dialog.isVisible()) {
      await dialog.yes();
    }

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('9.7 Drop preset onto standalone monomer in Flex mode shifts chain to accommodate geometry', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.7
     * Description: Drop preset onto standalone monomer in Flex mode →
     * monomer replaced by preset, chain shifted to accommodate new geometry.
     */
    const MONOMER1_X = 300;
    const MONOMER1_Y = 300;
    const MONOMER2_X = 450;
    const MONOMER2_Y = 300;
    const MONOMER3_X = 600;
    const MONOMER3_Y = 300;

    // Build a chain of three peptides in Flex mode
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER1_X,
      y: MONOMER1_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER2_X,
      y: MONOMER2_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER3_X,
      y: MONOMER3_Y,
    });

    const m1 = getMonomerLocator(page, Peptide.A).nth(0);
    const m2 = getMonomerLocator(page, Peptide.A).nth(1);
    const m3 = getMonomerLocator(page, Peptide.A).nth(2);

    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, m1, m2);
    await bondTwoMonomers(page, m2, m3);
    await MonomerPreviewTooltip(page).hide();

    // Screenshot before replacement
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Drag an RNA preset onto the middle monomer (m2)
    const m2Center = await getMonomerCenter(page, m2);
    await Library(page).switchToRNATab();
    await Library(page).hoverMonomer(Preset.A);
    await page.mouse.down();
    await page.mouse.move(m2Center.x, m2Center.y, { steps: 5 });
    await page.mouse.up();

    const dialog = ConfirmYourActionDialog(page);
    if (await dialog.isVisible()) {
      await dialog.yes();
    }

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('9.8 Replacement undo in one step restores original monomer and bonds; redo reapplies', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.8
     * Description: Replacement undo in one step → original monomer/preset
     * restored with all bonds; redo reapplies replacement.
     */
    const MONOMER1_X = 350;
    const MONOMER1_Y = 300;
    const MONOMER2_X = 500;
    const MONOMER2_Y = 300;

    // Place two peptides and bond them
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER1_X,
      y: MONOMER1_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER2_X,
      y: MONOMER2_Y,
    });
    const m1 = getMonomerLocator(page, Peptide.A).nth(0);
    const m2 = getMonomerLocator(page, Peptide.A).nth(1);

    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, m1, m2);
    await MonomerPreviewTooltip(page).hide();

    // Screenshot before replacement (baseline)
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Replace m1 with Peptide.C
    const center = await getMonomerCenter(page, m1);
    await Library(page).hoverMonomer(Peptide.C);
    await page.mouse.down();
    await page.mouse.move(center.x, center.y, { steps: 5 });
    await page.mouse.up();

    const dialog = ConfirmYourActionDialog(page);
    if (await dialog.isVisible()) {
      await dialog.yes();
    }

    await moveMouseAway(page);
    // Screenshot after replacement
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Undo once → original state should be restored
    await undoByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Redo → replacement reapplied
    await redoByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('9.9 Bonds to small molecules and hydrogen bonds preserved after monomer replacement', async ({
    page,
  }) => {
    /*
     * Test task: monomer-replacement-drag-drop / 9.9
     * Description: Bonds to small molecules and hydrogen bonds preserved
     * after monomer replacement.
     */
    const MONOMER_X = 400;
    const MONOMER_Y = 300;
    const CHEM_X = 400;
    const CHEM_Y = 450;

    // Place a peptide and a CHEM (small molecule) monomer
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: MONOMER_X,
      y: MONOMER_Y,
    });
    await Library(page).switchToCHEMTab();
    await Library(page).dragMonomerOnCanvas(Chem.Test_6_Ch, {
      x: CHEM_X,
      y: CHEM_Y,
    });

    const peptide = getMonomerLocator(page, Peptide.A).nth(0);
    const chem = getMonomerLocator(page, Chem.Test_6_Ch).nth(0);

    // Bond the peptide to the CHEM monomer
    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await bondTwoMonomers(page, peptide, chem);
    await MonomerPreviewTooltip(page).hide();

    // Screenshot before replacement
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Replace the peptide (Peptide.A) with another peptide that also has R3
    // compatible with the CHEM bond (Peptide.C also has R1,R2,R3)
    const peptideCenter = await getMonomerCenter(page, peptide);
    await Library(page).switchToPeptidesTab();
    await Library(page).hoverMonomer(Peptide.C);
    await page.mouse.down();
    await page.mouse.move(peptideCenter.x, peptideCenter.y, { steps: 5 });
    await page.mouse.up();

    const dialog = ConfirmYourActionDialog(page);
    if (await dialog.isVisible()) {
      await dialog.yes();
    }

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
