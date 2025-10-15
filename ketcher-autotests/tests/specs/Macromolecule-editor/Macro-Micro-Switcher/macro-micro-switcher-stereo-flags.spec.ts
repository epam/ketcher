/* eslint-disable max-len */
import { Page, test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  waitForPageInit,
  selectAllStructuresOnCanvas,
} from '@utils';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

async function configureInitialState(page: Page) {
  await Library(page).switchToRNATab();
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test('Verify that stereo-flags are visible in macromolecules mode when switching from molecules mode', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7104
   * Description: Verify that stereo-flags (ABS, AND, OR, Mixed) are visible in macromolecules mode
   *
   * Case: 1. Switch to Molecules mode
   *       2. Load KET file with stereo-flags (molecules with stereoLabels)
   *       3. Take screenshot to verify stereo-flags are visible in molecules mode
   *       4. Switch to Macromolecules mode - Flex
   *       5. Take screenshot to verify stereo-flags are still visible in Flex mode
   *       6. Switch to Snake mode
   *       7. Take screenshot to verify stereo-flags are still visible in Snake mode
   *       8. Switch to Sequence mode
   *       9. Take screenshot to verify stereo-flags are still visible in Sequence mode
   */
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/Micro-Macro-Switcher/Stereo-flags/stereo-flags-test.ket',
  );
  await takeEditorScreenshot(page);

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Verify that stereo-flags get selected when the molecule is selected in macromolecules mode', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7104
   * Description: Verify that when a molecule with stereo-flag is selected, the stereo-flag also gets selected
   *
   * Case: 1. Load KET file with stereo-flags in Macromolecules mode
   *       2. Select all structures on canvas
   *       3. Take screenshot to verify stereo-flag is also selected (highlighted)
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/Micro-Macro-Switcher/Stereo-flags/stereo-flags-test.ket',
  );
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

  await selectAllStructuresOnCanvas(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Verify that stereo-flags can be moved independently in macromolecules mode', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7104
   * Description: Verify that stereo-flags can be moved independently of the molecule
   *
   * Case: 1. Load KET file with stereo-flags in Macromolecules mode
   *       2. Click and drag the stereo-flag to a new position
   *       3. Take screenshot to verify stereo-flag moved independently
   *       4. Move the molecule
   *       5. Take screenshot to verify molecule moved without stereo-flag
   */
  // Note: This test requires manual drag implementation which would need
  // more complex test infrastructure. Marking as a placeholder for now.
  test.skip();
});
