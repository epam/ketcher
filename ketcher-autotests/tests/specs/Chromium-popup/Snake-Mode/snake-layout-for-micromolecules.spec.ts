/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Ruler } from '@tests/pages/macromolecules/tools/Ruler';
import {
  keyboardPressOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  resetZoomLevelToDefault,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';

let page: Page;

test.describe('Snake Layout for Microstructures', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ initFlexCanvas }) => {
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

  test('Case 6: Check that small molecules connected to RNA/DNA monomers layouted below the chains', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules connected to RNA/DNA monomers layouted below the chains and
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
      'KET/rna-connected-to-microsrtructures.ket',
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

  test('Case 7: Check that small molecules NOT connected to RNA/DNA monomers layouted below the ones who are connected to monomers', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules NOT connected to RNA/DNA monomers layouted below the ones who are connected to monomers
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to micro structures and small molecules NOT connected to monomers
     * 3. Switch to Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rna-with-connected-and-not-connected-molecules.ket',
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

  test('Case 8: Check that if there are multiple connected SMs to one monomer in RNA/DNA chain, when layout is applied, they pulled in a row in a way that doesnt allow their bonds to overlap, if possible', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: If there are multiple connected SMs to one monomer in RNA/DNA chain, when layout is applied, they
     * pulled in a row in a way that doesnt allow their bonds to overlap, if possible
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers and CHEMS connected to small molecules
     * 3. Switch to Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micromolecules-connected-to-chems-in-RNA-chain.ket',
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

  test('Case 9: Check that connected SMs arranged in a row based on the location of the RNA/DNA monomer they are connected to in the grid (column x row)', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The connected SMs arranged in a row based on the location of the RNA/DNA monomer they are connected to in the grid (column x row)
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to small molecules
     * 3. Switch to Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rna-connected-to-small-molecules-in-different-rows.ket',
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

  test('Case 10: Check switching between modes (Flex, Snake, Sequence)', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: After switching between modes (Flex, Snake, Sequence) the layout is correct
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to small molecules
     * 3. Switch to Snake mode
     * 4. Switch to Sequence mode
     * 5. Switch to Snake mode
     * 6. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rna-connected-to-small-molecules-in-different-rows.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const mode of [
      LayoutMode.Snake,
      LayoutMode.Sequence,
      LayoutMode.Flex,
      LayoutMode.Snake,
    ]) {
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(mode);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 11: Check switching between Macro and Micro modes', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: After switching between Macro and Micro modes the layout is correct
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add chains made up from monomers connected to small molecules
     * 3. Switch to Micro mode
     * 4. Switch to Macro mode
     * 5. Check layout
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rna-connected-to-small-molecules-in-different-rows.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).resetZoom();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
    });
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});

test.describe('Snake Layout for Microstructures by Ruler', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      disableChainLengthRuler: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await Ruler(page).setLength('6');
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Check that small molecules connected to monomers layouted below the chains when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules connected to monomers layouted below the chains when change layout by dragging ruler slider.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers connected to micro structures and molecules
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/peptides-connected-to-microstructures.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 2: Check that small molecules NOT connected to monomers layouted below the ones who are connected to monomers when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules connected to monomers layouted below the chains when change layout by dragging ruler slider.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers and CHEMS connected to small molecules
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/peptides-with-connected-and-not-connected-molecules.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 3: Check that if there are multiple connected SMs to one monomer, when layout is applied, they pulled in a row in a way that doesnt allow their bonds to overlap and when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The multiple connected SMs to one monomer, when layout is applied, they pulled in a row in a way
     *  that doesnt allow their bonds to overlap and when change layout by dragging ruler slider.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers connected to micro structures and small molecules NOT connected to monomers
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micromolecules-connected-to-chems.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 4: Check that connected SMs arranged in a row based on the location of the monomer they are connected to in the grid (column x row) when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The connected SMs arranged in a row based on the location of the monomer they are
     *  connected to in the grid (column x row) when change layout by dragging ruler slider.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers connected to small molecules in different rows
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/peptides-connected-to-small-molecules-in-different-rows.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 5: Check that if there is one SM that has two or more connections to different monomers when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The one SM that has two or more connections to different monomers when change layout by dragging ruler slider layout is correct.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers connected to small molecules where one SM that has two or more connections to different monomers
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     * We have a bug https://github.com/epam/ketcher/issues/8245
     * When it will be fixed we need to update the screenshots
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/SM-that-has-two-or-more-connections-to-different-monomers.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 6: Check that small molecules connected to RNA/DNA monomers layouted below the chains when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules connected to RNA/DNA monomers layouted below the chains when change layout by dragging ruler slider.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers connected to small molecules connected to RNA/DNA monomers
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rna-connected-to-microsrtructures.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 7: Check that small molecules NOT connected to RNA/DNA monomers layouted below the ones who are connected to monomers when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The small molecules NOT connected to RNA/DNA monomers layouted below the ones who are
     *  connected to monomers when change layout by dragging ruler slider.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers and small molecules connected and NOT connected to RNA/DNA monomers
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rna-with-connected-and-not-connected-molecules.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 8: Check that if there are multiple connected SMs to one monomer in RNA/DNA chain when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: If there are multiple connected SMs to one monomer in RNA/DNA chain when change layout by dragging ruler slider layout is correct.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers and CHEMS connected to small molecules in RNA/DNA chain
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micromolecules-connected-to-chems-in-RNA-chain.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 9: Check that connected SMs arranged in a row based on the location of the RNA/DNA monomer they are connected to in the grid (column x row) when change layout by dragging ruler slider', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7560
     * Description: The connected SMs arranged in a row based on the location of the RNA/DNA monomer they are
     *  connected to in the grid (column x row) when change layout by dragging ruler slider.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add chains made up from monomers connected to small molecules
     * 3. Change layout by ruler slider in Snake mode
     * 4. Check layout
     */
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rna-connected-to-small-molecules-in-different-rows.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (const len of ['10', '16']) {
      await Ruler(page).setLength(len);
      await keyboardPressOnCanvas(page, 'Enter');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });
});
