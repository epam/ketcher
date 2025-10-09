/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import {
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
} from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

let page: Page;

test.describe('Snap Functionality', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.beforeEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Snap a selected group of connected monomers relative to adjacent monomers', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/ketcher/issues/6287
     * Description: Snap a selected group of connected monomers relative to adjacent monomers
     * Scenario:
     * 1. Create a structure consisting of several monomers connected via bonds.
     * 2. Select a subset of monomers that form a connected group within the structure.
     * 3. Drag this group toward the monomers that are directly bonded to it.
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/six-peptides.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('80');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.keyboard.down('Shift');
    for (const peptide of [Peptide.D, Peptide.E, Peptide.F]) {
      await getMonomerLocator(page, peptide).click();
    }
    await page.keyboard.up('Shift');
    await getMonomerLocator(page, Peptide.F);
    await page.mouse.down();
    await page.mouse.move(632, 322, { steps: 10 });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
  });

  test('Case 2: Magnetic area for horizontal snap between monomers', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/ketcher/issues/6287
     * Description: A magnetic area appears at the midpoint between the connected monomers with a height
     * equal to y and a 15 px magnetic zone, showing where the group will snap.
     * Scenario:
     * 1. Arrange a chain of monomers horizontally with connections on both sides of a selected group.
     * 2. Select the central group and start dragging it horizontally between its two connected monomers.
     * 3. Observe the area at the midpoint between the connected monomers.
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/six-peptides.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('80');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.keyboard.down('Shift');
    for (const peptide of [Peptide.D, Peptide.E, Peptide.F]) {
      await getMonomerLocator(page, peptide).click();
    }
    await page.keyboard.up('Shift');
    await getMonomerLocator(page, Peptide.F);
    await page.mouse.down();
    await page.mouse.move(600, 322, { steps: 10 });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
  });

  test('Case 3: Condition for horizontal snap', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/ketcher/issues/6287
     * Description: When the geometric mean enters the magnetic area, the group snaps horizontally into place between the connected monomers.
     * Scenario:
     * 1. Arrange a chain of monomers horizontally with connections on both sides of a selected group.
     * 2. Determine the geometric mean (center of mass) of the selected group.
     * 3. Drag the group so that its geometric mean enters the magnetic area around midpoint M.
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/six-peptides.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('80');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.keyboard.down('Shift');
    for (const peptide of [Peptide.D, Peptide.E, Peptide.F]) {
      await getMonomerLocator(page, peptide).click();
    }
    await page.keyboard.up('Shift');
    await getMonomerLocator(page, Peptide.F);
    await page.mouse.down();
    await page.mouse.move(550, 322, { steps: 10 });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
  });
});
