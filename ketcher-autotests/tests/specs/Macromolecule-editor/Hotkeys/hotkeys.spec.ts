import { test } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  typeAllEnglishAlphabet,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  takeTopToolbarScreenshot,
  waitForPageInit,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  ZoomInByKeyboard,
  selectUndoByKeyboard,
  selectRedoByKeyboard,
  waitForRender,
  getControlModifier,
  clearCanvasByKeyboard,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { selectSequenceLayoutModeTool } from '@utils/canvas/tools/helpers';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

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
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Clear canvas action Undo and then Redo.
    */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/peptide-bzl.mol');
    await clearCanvasByKeyboard(page);
    await selectUndoByKeyboard(page);
    await takeEditorScreenshot(page);
    await selectRedoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Check Redo Capability with Ctrl+Y', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Clear canvas action Undo and then Redo.
    */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/peptide-bzl.mol');
    await clearCanvasByKeyboard(page);
    await selectUndoByKeyboard(page);
    await takeEditorScreenshot(page);

    const modifier = getControlModifier();
    await waitForRender(page, async () => {
      await page.keyboard.press(`${modifier}+KeyY`);
    });
    await takeEditorScreenshot(page);
  });

  test('Check Select Rectangle with Shift+Tab and Erase tool with Del/Backspace', async ({
    page,
  }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Appropriate tools are selected by hotkeys.
    */
    await page.keyboard.press('Delete');
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await ZoomInByKeyboard(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Check Zoom Out Functionality with Ctrl+-', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Monomers are Zoomed Out on canvas
    */
    const numberOfPressZoomOut = 5;
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await ZoomOutByKeyboard(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Check Reset Zoom Functionality with Ctrl+0', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Monomers Zoome In are reset
    */
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-monomers-not-connected-with-bonds.ket',
    );
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await ZoomInByKeyboard(page);
    }
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
    await page.keyboard.press('Delete');
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
        await selectSequenceLayoutModeTool(page);
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
        await selectSequenceLayoutModeTool(page);
        await typeAllEnglishAlphabet(page);
        await page.keyboard.press(key);
        await takeTopToolbarScreenshot(page);
      });
    }
  });
});
