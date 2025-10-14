/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
} from '@utils';

let page: Page;

test.describe('Snake Layout for Microstructures', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Check that small molecules connected to monomers layouted below the chains', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules connected to monomers layouted below the chains and
     * all chains made up from monomers layouted like usual at the top of the canvas
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to micro structures and molecules
     * 3. Switch to Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/peptides-connected-to-microstructures.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Check that small molecules NOT connected to monomers layouted below the ones who are connected to monomers', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules NOT connected to monomers layouted below the ones who are connected to monomers
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to micro structures and small molecules NOT connected to monomers
     * 3. Switch to Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/peptides-with-connected-and-not-connected-molecules.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Check that if there are multiple connected SMs to one monomer, when layout is applied, they pulled in a row in a way that doesnt allow their bonds to overlap, if possible', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: If there are multiple connected SMs to one monomer, when layout is applied, they
     * pulled in a row in a way that doesnt allow their bonds to overlap, if possible
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers and CHEMS connected to small molecules
     * 3. Switch to Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micromolecules-connected-to-chems.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Check that connected SMs arranged in a row based on the location of the monomer they are connected to in the grid (column x row)', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The connected SMs arranged in a row based on the location of the monomer they are connected to in the grid (column x row)
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to small molecules
     * 3. Switch to Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/peptides-connected-to-small-molecules-in-different-rows.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 5: Check that if there is one SM that has two or more connections to different monomers, when pulled into a row, the connection to a monomer that comes first in the snake chain prioritized and the SM placed in a row below it', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: If there is one SM that has two or more connections to different monomers, when pulled into a row,
     * the connection to a monomer that comes first in the snake chain prioritized and the SM placed in a row below it
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to small molecules
     * 3. Switch to Snake mode
     * 4. Check layout
     * We have a bug https://github.com/epam/ketcher/issues/8245
     * When it will be fixed we need to update the screenshots
     */
    await CommonTopRightToolbar(page).setZoomInputValue('30');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/SM-that-has-two-or-more-connections-to-different-monomers.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
