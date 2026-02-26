import { test } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  setMode,
  takePageScreenshot,
  takeEditorScreenshot,
  setZoom,
  moveMouseAway,
} from '@utils';

test.describe('setMode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Should set "sequence" mode', async ({ page }) => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-and-peptide.ket');
    await takePageScreenshot(page);
    await setMode(page, 'sequence');
    await takePageScreenshot(page);
  });

  test('Validate ketcher.setMode for Flex Mode', async ({ page }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Flex Mode
     */
    await openFileAndAddToCanvasMacro(page, 'KET/snake-mode-peptides.ket');
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await setMode(page, 'flex');
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Validate ketcher.setMode for Snake Mode', async ({ page }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Snake Mode
     */
    await openFileAndAddToCanvasMacro(page, 'KET/snake-mode-peptides.ket');
    await takeEditorScreenshot(page);
    await setMode(page, 'snake');
    await takeEditorScreenshot(page);
  });

  test('Validate ketcher.setMode for Sequence Mode', async ({ page }) => {
    /**
     * Test case: #4539
     * Description: ketcher.setMode switch canvas to Sequence Mode
     */
    await openFileAndAddToCanvasMacro(page, 'KET/snake-mode-peptides.ket');
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
    await openFileAndAddToCanvasMacro(page, 'KET/hundred-monomers.ket');
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
    await openFileAndAddToCanvasMacro(page, 'KET/snake-mode-peptides.ket');
    await takeEditorScreenshot(page);
    await setMode(page, 'snake');
    await takeEditorScreenshot(page);
    await setZoom(page, zoomValue);
    await takeEditorScreenshot(page);
  });
});
