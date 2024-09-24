import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  selectSingleBondTool,
  selectSequenceLayoutModeTool,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  takeTopToolbarScreenshot,
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
    await openFileAndAddToCanvasMacro('Molfiles-V3000/peptide-bzl.mol', page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Check Clear Canvas (Ctrl+Backspace) Shortcut', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Canvas is cleared.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/peptide-bzl.mol', page);
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
    await openFileAndAddToCanvasMacro('Molfiles-V3000/peptide-bzl.mol', page);
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
    await openFileAndAddToCanvasMacro('Molfiles-V3000/peptide-bzl.mol', page);
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

  test('Check Zoom In Functionality with Ctrl+=', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: Monomers are Zoomed In on canvas
    */
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-not-connected-with-bonds.ket',
      page,
    );
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await page.keyboard.press('Control+=');
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
      'KET/three-monomers-not-connected-with-bonds.ket',
      page,
    );
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await page.keyboard.press('Control+-');
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
      'KET/three-monomers-not-connected-with-bonds.ket',
      page,
    );
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await page.keyboard.press('Control+=');
    }
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+0');
    await takeEditorScreenshot(page);
  });

  test('Check Select All Functionality with Ctrl+A', async ({ page }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/3713
    Description: All Monomers are selected.
    */
    await openFileAndAddToCanvasMacro(
      'KET/three-monomers-not-connected-with-bonds.ket',
      page,
    );
    await page.keyboard.press('Control+a');
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
      'KET/three-monomers-not-connected-with-bonds.ket',
      page,
    );
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Check New approach and UI for switching between types in sequence mode', async ({
    page,
  }) => {
    /* 
    Test case: Hotkeys https://github.com/epam/ketcher/issues/5554
    Description: 
    1. The default mode for typing is RNA.
    2. When hovering over RNA the user should see "RNA (Ctrl+Alt+R)", 
    3. When hovering over DNA the user should see "DNA (Ctrl+Alt+D)", 
    4. When hovering over PEP the user should see "Peptides (Ctrl+Alt+P)".
    5. Ctrl+Alt+D switches to DNA type
    6. Ctrl+Alt+P switches to peptide type
    7. Ctrl+Alt+R switches to RNA type
    */
    selectSequenceLayoutModeTool(page);

    await takeTopToolbarScreenshot(page);

    const buttonRNA = page.getByTestId('RNABtn');
    await expect(buttonRNA).toHaveAttribute('title', 'RNA (Ctrl+Alt+R)');

    const buttonDNA = page.getByTestId('DNABtn');
    await expect(buttonDNA).toHaveAttribute('title', 'DNA (Ctrl+Alt+D)');

    const buttonPEP = page.getByTestId('PEPTIDEBtn');
    await expect(buttonPEP).toHaveAttribute('title', 'Peptides (Ctrl+Alt+P)');

    await page.keyboard.press('Control+Alt+D');
    await takeTopToolbarScreenshot(page);

    await page.keyboard.press('Control+Alt+P');
    await takeTopToolbarScreenshot(page);

    await page.keyboard.press('Control+Alt+R');
    await takeTopToolbarScreenshot(page);
  });
});
