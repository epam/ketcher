import { test } from '@playwright/test';
import {
  waitForPageInit,
  turnOnMacromoleculesEditor,
  openFileAndAddToCanvasMacro,
  setMode,
  takePageScreenshot,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  setZoom,
  moveMouseAway,
  resetCurrentTool,
} from '@utils';

test.describe('setMode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Should set "sequence" mode', async ({ page }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    await takePageScreenshot(page);
    await setMode(page, 'sequence');
    await takePageScreenshot(page);
  });

  test('Validate ketcher.setMode for Flex Mode', async ({ page }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Flex Mode
     */
    await openFileAndAddToCanvasMacro('KET/snake-mode-peptides.ket', page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await setMode(page, 'flex');
    await moveMouseAway(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Validate ketcher.setMode for Snake Mode', async ({ page }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Snake Mode
     */
    await openFileAndAddToCanvasMacro('KET/snake-mode-peptides.ket', page);
    await takeEditorScreenshot(page);
    await setMode(page, 'snake');
    await takeEditorScreenshot(page);
  });

  test('Validate ketcher.setMode for Sequence Mode', async ({ page }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Sequence Mode
     */
    await openFileAndAddToCanvasMacro('KET/snake-mode-peptides.ket', page);
    await takeEditorScreenshot(page);
    await setMode(page, 'sequence');
    await takeEditorScreenshot(page);
  });

  test('Switch between different modes (flex, sequence, snake) using ketcher.setMode for Complex Structures', async ({
    page,
  }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Sequence Mode
     */
    await openFileAndAddToCanvasMacro('KET/hundred-monomers.ket', page);
    await takeEditorScreenshot(page);
    await setMode(page, 'snake');
    await takeEditorScreenshot(page);
    await setMode(page, 'sequence');
    await takeEditorScreenshot(page);
    await setMode(page, 'flex');
    await takeEditorScreenshot(page);
  });

  test('Test Combination of ketcher.setMode and ketcher.setZoom', async ({
    page,
  }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Snake Mode
     */
    const zoomValue = 0.5;
    await openFileAndAddToCanvasMacro('KET/snake-mode-peptides.ket', page);
    await takeEditorScreenshot(page);
    await setMode(page, 'snake');
    await takeEditorScreenshot(page);
    await setZoom(page, zoomValue);
    await takeEditorScreenshot(page);
  });
});
