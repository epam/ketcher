import { test } from '@playwright/test';
import {
  TopPanelButton,
  openFileAndAddToCanvasMacro,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  chooseFileFormat,
  selectRectangleArea,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Saving in .svg files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Should convert .ket file to .svg format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 600;
    const endY = 450;
    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'SVG Document');
    // Should clean up dynamic svg elements (selections...) in drawn structure
    await takeEditorScreenshot(page);
  });
});
