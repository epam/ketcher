import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  selectSingleBondTool,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Hotkeys', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check Clear Canvas (Ctrl+Del) Shortcut', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Canvas is cleared.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/peptide-bzl.mol', page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Check Clear Canvas (Ctrl+Backspace) Shortcut', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Canvas is cleared.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/peptide-bzl.mol', page);
    await page.keyboard.press('Control+Backspace');
    await takeEditorScreenshot(page);
  });

  test('Check Undo Functionality with Ctrl+Z and Redo with Ctrl+Shift+Z', async ({
    page,
  }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Clear canvas action Undo and then Redo.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/peptide-bzl.mol', page);
    await page.keyboard.press('Control+Backspace');
    await page.keyboard.press('Control+z');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Shift+z');
    await takeEditorScreenshot(page);
  });

  test('Check Redo Capability with Ctrl+Y', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Clear canvas action Undo and then Redo.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/peptide-bzl.mol', page);
    await page.keyboard.press('Control+Backspace');
    await page.keyboard.press('Control+z');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+y');
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
    await selectSingleBondTool(page);
    await page.keyboard.press('Backspace');
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await page.keyboard.press('Shift+Tab');
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });
});
