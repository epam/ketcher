import { test } from '@fixtures';
import {
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  takeTopToolbarScreenshot,
  waitForPageInit,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  ZoomInByKeyboard,
  undoByKeyboard,
  redoByKeyboard,
  clearCanvasByKeyboard,
  deleteByKeyboard,
  keyboardTypeOnCanvas,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

test.describe('Hotkeys', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Check Clear Canvas (Ctrl+Del) Shortcut', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Canvas is cleared.
    */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/peptide-bzl.mol');
    await clearCanvasByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Check Clear Canvas (Ctrl+Backspace) Shortcut', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Canvas is cleared.
    */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/peptide-bzl.mol');
    await clearCanvasByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Check Undo Functionality with Ctrl+Z and Redo with Ctrl+Shift+Z', async ({
    page,
  }) => {
    /*
     * Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
     * Description: Clear canvas action Undo and then Redo.
     */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/peptide-bzl.mol');
    await clearCanvasByKeyboard(page);
    await undoByKeyboard(page);
    await takeEditorScreenshot(page);
    await redoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Check Redo Capability with Ctrl+Y', async ({ page }) => {
    /*
     * Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
     * Description: Clear canvas action Undo and then Redo.
     */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/peptide-bzl.mol');
    await clearCanvasByKeyboard(page);
    await undoByKeyboard(page);
    await takeEditorScreenshot(page);

    await redoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Check Select Rectangle with Shift+Tab and Erase tool with Del/Backspace', async ({
    page,
  }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Appropriate tools are selected by hotkeys.
    */
    await deleteByKeyboard(page);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
    await page.keyboard.press('Backspace');
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await page.keyboard.press('Shift+Tab');
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Check Zoom In Functionality with Ctrl+=', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Monomers are Zoomed In on canvas
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    await ZoomInByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });

  test('Check Zoom Out Functionality with Ctrl+-', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Monomers are Zoomed Out on canvas
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    await ZoomOutByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });

  test('Check Reset Zoom Functionality with Ctrl+0', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Monomers Zoome In are reset
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    await ZoomInByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
    await resetZoomLevelToDefault(page);
    await takeEditorScreenshot(page);
  });

  test('Check Select All Functionality with Ctrl+A', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: All Monomers are selected.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Check that "Del" hotkey allows removing selection, but after that, selection tool not switches to deletion tool', async ({
    page,
  }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/4020
    Description: Selection tool not switches to deletion tool.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  const hotkeysAndDescriptions = [
    { key: 'Control+Alt+D', type: 'DNA' },
    { key: 'Control+Alt+P', type: 'Peptide' },
    { key: 'Control+Alt+R', type: 'RNA' },
  ];

  test.describe('Check New approach and UI for switching between types in sequence mode', () => {
    for (const { key, type } of hotkeysAndDescriptions) {
      test(`Check that ${key} switches to ${type} type`, async ({ page }) => {
        /* 
        Test case: Hotkeys https://github.com/epam/ketcher/issues/5554
        Description: ${key} switches to ${type} type.
        */
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Sequence,
        );
        await page.keyboard.press(key);
        await takeTopToolbarScreenshot(page);
      });
    }
  });

  test.describe('Check New approach and UI for switching between types in sequence mode when typing any sequences', () => {
    for (const { key, type } of hotkeysAndDescriptions) {
      test(`Check that ${key} switches to ${type} type  when typing any sequences`, async ({
        page,
      }) => {
        /* 
        Test case: Hotkeys https://github.com/epam/ketcher/issues/5554
        Description: ${key} switches to ${type} type when typing any sequences.
        */
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Sequence,
        );
        await keyboardTypeOnCanvas(page, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        await page.keyboard.press(key);
        await takeTopToolbarScreenshot(page);
      });
    }
  });
});
